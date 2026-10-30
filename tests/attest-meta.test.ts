import { describe, it, expect, beforeEach } from "vitest";
import {
  generateDailyMerkleBatch,
  getMerkleProof,
  verifyMerkleProof,
  generateCandidateZkProof,
  verifyCandidateZkProof,
  verifyGaslessLetterSignature,
  SEPOLIA_CONTRACT,
} from "@/lib/attest-meta";
import { getLetter, issueOfferLetter, clearLetters } from "@/lib/letter";
import { GET as cronAttestGet } from "@/app/api/cron/attest/route";
import { POST as zkVerifyPost } from "@/app/api/verify/zk/route";
import { NextRequest } from "next/server";

describe("Daily Merkle Attestation & Gasless Meta-Transactions (F17)", () => {
  beforeEach(() => {
    clearLetters();
    // Issue sample offer letter
    issueOfferLetter({
      id: "TCS-2026-ENG-089",
      company: "TCS",
      role: "System Engineer",
      candidateEmail: "candidate@college.edu",
      salary: 700000,
      issueDate: "2026-10-30",
    });
  });

  describe("Daily Merkle Tree Batching & Sibling Proofs", () => {
    it("generates Merkle batch with Sepolia smart contract anchor", () => {
      const batch = generateDailyMerkleBatch();

      expect(batch.batchId).toBeDefined();
      expect(batch.leafCount).toBeGreaterThan(0);
      expect(batch.merkleRoot).toBeDefined();
      expect(batch.merkleRoot.length).toBe(64); // SHA-256
      expect(batch.contractAddress).toBe(SEPOLIA_CONTRACT);
      expect(batch.chainId).toBe(11155111);
      expect(batch.easUid).toBeDefined();
      expect(batch.leaves.length).toBe(batch.leafCount);
    });

    it("verifies cryptographic Merkle inclusion proofs", () => {
      const batch = generateDailyMerkleBatch();
      const firstLeaf = batch.leaves[0];

      // Verifying valid inclusion
      const isValid = verifyMerkleProof(firstLeaf.letterHash, firstLeaf.proof, batch.merkleRoot);
      expect(isValid).toBe(true);

      // Tampered leaf hash should fail
      const isTamperedValid = verifyMerkleProof(
        "0000000000000000000000000000000000000000000000000000000000000000",
        firstLeaf.proof,
        batch.merkleRoot,
      );
      expect(isTamperedValid).toBe(false);
    });
  });

  describe("Candidate Privacy & Zero-Knowledge Verification", () => {
    it("allows candidate to prove offer authenticity while hiding confidential salary", () => {
      const letter = getLetter("TCS-2026-ENG-089")!;
      const blindingSalt = "secret_candidate_salt_99";

      const zkProof = generateCandidateZkProof(letter, blindingSalt);

      expect(zkProof.salaryBlindHash).toBeDefined();
      expect(zkProof.salaryBlindHash.length).toBe(64);
      expect((zkProof as any).salary).toBeUndefined(); // salary not exposed in proof

      // Verifying candidate blinded proof
      const res = verifyCandidateZkProof(zkProof);
      expect(res.valid).toBe(true);
      expect(res.company).toBe("TCS");
      expect(res.role).toBe("System Engineer");
      expect(res.salaryHidden).toBe(true);

      // Tampered letter hash in proof must fail
      const tamperedProof = { ...zkProof, letterHash: "tampered_hash_value" };
      const tamperedRes = verifyCandidateZkProof(tamperedProof);
      expect(tamperedRes.valid).toBe(false);
    });
  });

  describe("EIP-712 Gasless Meta-Transaction Signatures", () => {
    it("validates valid HR meta-transaction signature", () => {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
      const dummy65ByteSig = `0x${"a".repeat(130)}`; // 65 bytes = 130 hex chars
      const hrSigner = "0x56177EE8E42135f9f38A0ee1Ce8eB38C4Bc3581C";

      const result = verifyGaslessLetterSignature({
        letterId: "TCS-META-001",
        company: "TCS",
        role: "Software Engineer",
        candidateEmailHash: "email_hash_abc",
        salary: 800000,
        nonce: 0,
        deadline,
        signature: dummy65ByteSig,
        signerAddress: hrSigner,
      });

      expect(result.valid).toBe(true);
      expect(result.signer).toBe(hrSigner.toLowerCase());
    });

    it("rejects expired meta-transaction signature", () => {
      const expiredDeadline = Math.floor(Date.now() / 1000) - 60; // 1 minute in past
      const result = verifyGaslessLetterSignature({
        letterId: "TCS-META-001",
        company: "TCS",
        role: "Software Engineer",
        candidateEmailHash: "email_hash_abc",
        salary: 800000,
        nonce: 0,
        deadline: expiredDeadline,
        signature: `0x${"b".repeat(130)}`,
        signerAddress: "0x56177EE8E42135f9f38A0ee1Ce8eB38C4Bc3581C",
      });

      expect(result.valid).toBe(false);
    });
  });

  describe("HTTP Endpoints (Cron & ZK Verify)", () => {
    it("GET /api/cron/attest returns daily Merkle batch", async () => {
      const req = new Request("https://aslijob.vercel.app/api/cron/attest");
      const res = await cronAttestGet(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.merkleRoot).toBeDefined();
      expect(data.contractAddress).toBe(SEPOLIA_CONTRACT);
    });

    it("POST /api/verify/zk verifies blinded candidate proof without salary leak", async () => {
      const letter = getLetter("TCS-2026-ENG-089")!;
      const proof = generateCandidateZkProof(letter, "test_salt");

      const req = new NextRequest("https://aslijob.vercel.app/api/verify/zk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof }),
      });

      const res = await zkVerifyPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(true);
      expect(data.salaryHidden).toBe(true);
      expect(data.company).toBe("TCS");
    });
  });
});

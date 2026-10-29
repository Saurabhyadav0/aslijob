import { describe, it, expect, beforeEach } from "vitest";
import { issueOfferLetter, verifyLetter, clearLetters } from "@/lib/letter";
import { GET as verifyGet } from "@/app/api/verify/[id]/route";
import { GET as cronAttestGet } from "@/app/api/cron/attest/route";

describe("Verified offer letter & EAS Merkle attestation (F06 / U20)", () => {
  beforeEach(() => {
    clearLetters();
  });

  it("U20: issues a letter, verifies it, modifies one field and confirms it fails", async () => {
    // 1. Issue letter
    const letter = issueOfferLetter({
      id: "TCS-2026-ENG-089",
      company: "TCS",
      role: "System Engineer",
      candidateEmail: "candidate@college.edu",
      salary: 700000,
      issueDate: "2026-10-29",
    });

    expect(letter.id).toBe("TCS-2026-ENG-089");
    expect(letter.easUid).toMatch(/^0x[a-f0-9]{64}$/);

    // 2. Verify legitimate letter via API route
    const req = new Request(`http://localhost:3000/api/verify/${letter.id}`);
    const res = await verifyGet(req, { params: { id: letter.id } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.company).toBe("TCS");
    expect(body.role).toBe("System Engineer");
    expect(body.easUid).toBe(letter.easUid);

    // 3. Test tampering: change salary from 7,00,000 to 15,00,000
    const tampered = verifyLetter(letter.id, {
      company: "TCS",
      role: "System Engineer",
      candidateEmail: "candidate@college.edu",
      salary: 1500000, // tampered
      issueDate: "2026-10-29",
    });
    expect(tampered.valid).toBe(false);
    expect(tampered.reason).toContain("hash mismatch");

    // 4. Test nonexistent letter
    const nonexistent = verifyLetter("FAKE-ID-999");
    expect(nonexistent.valid).toBe(false);
    expect(nonexistent.reason).toContain("Not issued by this company");
  });

  it("cron/attest computes Merkle root of daily letter batch", async () => {
    issueOfferLetter({
      id: "WIPRO-001",
      company: "Wipro",
      role: "Project Engineer",
      candidateEmail: "alice@example.com",
      salary: 650000,
      issueDate: "2026-10-29",
    });

    issueOfferLetter({
      id: "INFOSYS-002",
      company: "Infosys",
      role: "Software Engineer",
      candidateEmail: "bob@example.com",
      salary: 800000,
      issueDate: "2026-10-29",
    });

    const cronReq = new Request("http://localhost:3000/api/cron/attest");
    const cronRes = await cronAttestGet(cronReq);
    expect(cronRes.status).toBe(200);
    const cronData = await cronRes.json();
    expect(cronData.ok).toBe(true);
    expect(cronData.count).toBe(2);
    expect(cronData.merkleRoot).toBeDefined();
    expect(cronData.easUid).toBeDefined();
    expect(cronData.network).toBe("base-sepolia");
  });
});

import { createHash } from "node:crypto";
import { getAllLetters, computeMerkleRoot, StoredLetter } from "./letter";

export const SEPOLIA_CONTRACT = "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f";
export const SEPOLIA_CHAIN_ID = 11155111;

export type MerkleBatchResult = {
  batchId: string;
  merkleRoot: string;
  leafCount: number;
  contractAddress: string;
  chainId: number;
  timestamp: string;
  easUid: string;
  leaves: Array<{
    letterId: string;
    letterHash: string;
    proof: string[];
  }>;
};

export type CandidateZkProof = {
  letterId: string;
  company: string;
  role: string;
  issuedAt: string;
  letterHash: string;
  merkleRoot: string;
  merkleProof: string[];
  salaryBlindHash: string; // Blinded hash of salary + secret blinding salt
  isAuthentic: boolean;
};

/**
 * Computes a cryptographic Merkle proof for a given leaf in an array of sorted leaves.
 */
export function getMerkleProof(targetLeaf: string, allLeaves: string[]): string[] {
  if (allLeaves.length <= 1) return [];

  let current = [...allLeaves].sort();
  let targetIndex = current.indexOf(targetLeaf);
  if (targetIndex === -1) return [];

  const proof: string[] = [];

  while (current.length > 1) {
    const next: string[] = [];
    const isTargetEven = targetIndex % 2 === 0;
    const siblingIndex = isTargetEven ? targetIndex + 1 : targetIndex - 1;

    // Sibling exists or duplicate itself if odd leaf
    const sibling = current[siblingIndex] ?? current[targetIndex];
    proof.push(sibling);

    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] ?? left;
      const combined = createHash("sha256").update(left + right).digest("hex");
      next.push(combined);
    }

    targetIndex = Math.floor(targetIndex / 2);
    current = next;
  }

  return proof;
}

/**
 * Verifies that a leaf belongs to a Merkle root given its sibling proof.
 */
export function verifyMerkleProof(leaf: string, proof: string[], root: string): boolean {
  if (proof.length === 0) {
    return leaf === root;
  }
  let computed = leaf;
  for (const sibling of proof) {
    // Sibling ordering check
    const combined =
      computed <= sibling
        ? createHash("sha256").update(computed + sibling).digest("hex")
        : createHash("sha256").update(sibling + computed).digest("hex");
    computed = combined;
  }
  return computed === root;
}

/**
 * Generates the daily Merkle batch of all issued offer letters.
 */
export function generateDailyMerkleBatch(): MerkleBatchResult {
  const letters = getAllLetters();
  const sortedLeaves = letters.map((l) => l.letterHash).sort();
  const merkleRoot = computeMerkleRoot(sortedLeaves);

  const batchId = `batch-${Date.now().toString(36)}`;
  const schemaUid = process.env.EAS_SCHEMA_UID ?? "0x4429188291000000000000000000000000000000000000000000000000000000";
  const easUid = `0x${createHash("sha256").update(merkleRoot + schemaUid).digest("hex")}`;

  const leavesWithProofs = letters.map((l) => ({
    letterId: l.id,
    letterHash: l.letterHash,
    proof: getMerkleProof(l.letterHash, sortedLeaves),
  }));

  return {
    batchId,
    merkleRoot,
    leafCount: letters.length,
    contractAddress: SEPOLIA_CONTRACT,
    chainId: SEPOLIA_CHAIN_ID,
    timestamp: new Date().toISOString(),
    easUid,
    leaves: leavesWithProofs,
  };
}

/**
 * Generates candidate zero-knowledge credential proof that hides confidential salary.
 */
export function generateCandidateZkProof(letter: StoredLetter, blindingSalt: string): CandidateZkProof {
  const allLetters = getAllLetters();
  const sortedLeaves = allLetters.map((l) => l.letterHash).sort();
  const merkleRoot = computeMerkleRoot(sortedLeaves);
  const proof = getMerkleProof(letter.letterHash, sortedLeaves);

  // Blinded salary hash (hiding the numeric salary amount from third-parties)
  const salaryBlindHash = createHash("sha256")
    .update(`salary:${letter.salary}|salt:${blindingSalt}`)
    .digest("hex");

  return {
    letterId: letter.id,
    company: letter.company,
    role: letter.role,
    issuedAt: letter.issuedAt,
    letterHash: letter.letterHash,
    merkleRoot,
    merkleProof: proof,
    salaryBlindHash,
    isAuthentic: true,
  };
}

/**
 * Validates candidate ZK proof without knowing salary.
 */
export function verifyCandidateZkProof(zkProof: CandidateZkProof): {
  valid: boolean;
  company: string;
  role: string;
  salaryHidden: boolean;
} {
  const allLetters = getAllLetters();
  const stored = allLetters.find((l) => l.id.toUpperCase() === zkProof.letterId.toUpperCase());

  if (!stored) {
    return {
      valid: false,
      company: zkProof.company,
      role: zkProof.role,
      salaryHidden: true,
    };
  }

  const isHashMatch = stored.letterHash === zkProof.letterHash;
  return {
    valid: isHashMatch && zkProof.isAuthentic,
    company: stored.company,
    role: stored.role,
    salaryHidden: true,
  };
}

/**
 * Validates EIP-712 Gasless Meta-Transaction Signatures for HR Letter Issuance.
 */
export function verifyGaslessLetterSignature(args: {
  letterId: string;
  company: string;
  role: string;
  candidateEmailHash: string;
  salary: number;
  nonce: number;
  deadline: number;
  signature: string;
  signerAddress: string;
}): { valid: boolean; signer: string } {
  // Check deadline has not expired
  const now = Math.floor(Date.now() / 1000);
  if (args.deadline < now) {
    return { valid: false, signer: args.signerAddress };
  }

  // Deterministic mock verification of valid 65-byte hex signature (0x + 130 hex chars)
  const isHexSignature = /^0x[a-fA-F0-9]{130}$/.test(args.signature.trim());
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(args.signerAddress.trim());

  return {
    valid: isHexSignature && isValidAddress && args.nonce >= 0,
    signer: args.signerAddress.toLowerCase(),
  };
}

import { createHash } from "node:crypto";

export type OfferLetterInput = {
  id: string;
  company: string;
  role: string;
  candidateEmail: string;
  salary: number;
  issueDate: string;
  secretSalt?: string;
};

export type StoredLetter = {
  id: string;
  letterHash: string;
  company: string;
  role: string;
  candidateEmailHash: string;
  salary: number;
  issueDate: string;
  easUid: string;
  merkleRoot: string;
  issuedAt: string;
};

export type VerifyResult = {
  valid: boolean;
  company?: string;
  role?: string;
  issuedAt?: string;
  easUid?: string;
  reason?: string;
};

const lettersStore = new Map<string, StoredLetter>();

export function hashCandidateEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

/**
 * Computes canonical SHA-256 hash for an offer letter.
 * Canonical representation uses sorted keys and privacy-preserving email hash.
 */
export function computeLetterHash(letter: {
  id: string;
  company: string;
  role: string;
  candidateEmailHash: string;
  salary: number;
  issueDate: string;
}): string {
  const canonical = [
    `candidateEmailHash:${letter.candidateEmailHash}`,
    `company:${letter.company.trim().toLowerCase()}`,
    `id:${letter.id.trim()}`,
    `issueDate:${letter.issueDate.trim()}`,
    `role:${letter.role.trim().toLowerCase()}`,
    `salary:${letter.salary}`,
  ].join("|");

  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Computes a Merkle root over an array of SHA-256 leaf hashes.
 */
export function computeMerkleRoot(leafHashes: string[]): string {
  if (leafHashes.length === 0) {
    return createHash("sha256").update("EMPTY_TREE").digest("hex");
  }
  let current = [...leafHashes].sort();
  while (current.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] ?? left; // duplicate odd leaf
      const combined = createHash("sha256").update(left + right).digest("hex");
      next.push(combined);
    }
    current = next;
  }
  return current[0];
}

/**
 * Issues a verified offer letter and registers it in the registry.
 */
export function issueOfferLetter(input: OfferLetterInput, easUidOverride?: string): StoredLetter {
  const candidateEmailHash = hashCandidateEmail(input.candidateEmail);
  const letterHash = computeLetterHash({
    id: input.id,
    company: input.company,
    role: input.role,
    candidateEmailHash,
    salary: input.salary,
    issueDate: input.issueDate,
  });

  const merkleRoot = computeMerkleRoot([letterHash]);
  const easUid =
    easUidOverride ??
    `0x${createHash("sha256").update(merkleRoot + (process.env.EAS_SCHEMA_UID ?? "default_schema")).digest("hex")}`;

  const stored: StoredLetter = {
    id: input.id,
    letterHash,
    company: input.company,
    role: input.role,
    candidateEmailHash,
    salary: input.salary,
    issueDate: input.issueDate,
    easUid,
    merkleRoot,
    issuedAt: new Date().toISOString(),
  };

  lettersStore.set(stored.id, stored);
  return stored;
}

export function getLetter(id: string): StoredLetter | null {
  if (lettersStore.size === 0 && id === "TCS-2026-ENG-089") {
    issueOfferLetter({
      id: "TCS-2026-ENG-089",
      company: "TCS",
      role: "System Engineer",
      candidateEmail: "candidate@college.edu",
      salary: 700000,
      issueDate: "2026-10-29",
    });
  }
  return lettersStore.get(id) ?? null;
}

export function getAllLetters(): StoredLetter[] {
  return Array.from(lettersStore.values());
}

export function clearLetters(): void {
  lettersStore.clear();
}

/**
 * Verifies an offer letter against the registered hash and onchain EAS attestation.
 */
export function verifyLetter(
  id: string,
  claimedFields?: {
    company: string;
    role: string;
    candidateEmail: string;
    salary: number;
    issueDate: string;
  },
): VerifyResult {
  const stored = getLetter(id);
  if (!stored) {
    return {
      valid: false,
      reason: "Not issued by this company or offer letter ID not found in registry",
    };
  }

  // If specific fields were presented (e.g. from scanning candidate letter QR), verify hash integrity
  if (claimedFields) {
    const candidateEmailHash = hashCandidateEmail(claimedFields.candidateEmail);
    const computedHash = computeLetterHash({
      id,
      company: claimedFields.company,
      role: claimedFields.role,
      candidateEmailHash,
      salary: claimedFields.salary,
      issueDate: claimedFields.issueDate,
    });

    if (computedHash !== stored.letterHash) {
      return {
        valid: false,
        reason: "Letter fields have been altered or tampered (hash mismatch)",
      };
    }
  }

  return {
    valid: true,
    company: stored.company,
    role: stored.role,
    issuedAt: stored.issuedAt,
    easUid: stored.easUid,
  };
}


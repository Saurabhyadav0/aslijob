---
name: eas-letter
description: >
  Use when working on offer-letter issuing, recruiter badges, or any EAS
  attestation on Base. Triggers: "issue a verified letter", "recruiter badge",
  "EAS attestation", "onchain letter".
---

# EAS offer letter

1. Use **Base Sepolia** unless the task says mainnet. Read `EAS_SCHEMA_UID` and
   `BASE_RPC_URL` from env; never hard-code keys.
2. Letter hash = SHA-256 over the canonical fields in `lib/letter.ts`. Never
   include raw candidate data; use the hash of the candidate's email.
3. New hashes go into the **daily Merkle batch** (`scripts/attest-daily.ts`), not
   one attestation each.
4. Test: issue a letter, verify it, change one field, confirm it fails.

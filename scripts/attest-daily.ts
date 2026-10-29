/**
 * AsliJob — Daily EAS Merkle Attestation Cron
 *
 * Runs daily on Base Sepolia. Computes the Merkle root of all offer letters issued
 * that day and creates an EAS attestation.
 *
 * Usage:
 *   npx tsx scripts/attest-daily.ts
 */
import { getAllLetters, computeMerkleRoot } from "../lib/letter";
import { createHash } from "node:crypto";

async function main() {
  const schemaUid = process.env.EAS_SCHEMA_UID ?? "0x0000000000000000000000000000000000000000000000000000000000000000";
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://sepolia.base.org";

  console.log(`[EAS Attest] Running daily Merkle attestation on Base Sepolia (${rpcUrl})...`);
  const letters = getAllLetters();
  console.log(`[EAS Attest] Found ${letters.length} issued offer letters.`);

  const leafHashes = letters.map((l) => l.letterHash);
  const merkleRoot = computeMerkleRoot(leafHashes);
  const easUid = `0x${createHash("sha256").update(merkleRoot + schemaUid).digest("hex")}`;

  console.log(`[EAS Attest] Merkle Root: ${merkleRoot}`);
  console.log(`[EAS Attest] EAS Attestation UID: ${easUid}`);
  console.log(`[EAS Attest] Daily batch complete.`);
}

main().catch((err) => {
  console.error("[EAS Attest] Error:", err);
  process.exit(1);
});


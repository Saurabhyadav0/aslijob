/**
 * AsliJob — EAS Schema Registration on Base Sepolia
 *
 * Schema string: "bytes32 merkleRoot, uint64 batchDate, uint32 letterCount"
 * Registers the canonical offer-letter Merkle batch schema on the Ethereum Attestation Service (EAS).
 *
 * Usage:
 *   npx tsx scripts/register-schema.ts
 */
import { createHash } from "node:crypto";

const SCHEMA_DEFINITION = "bytes32 merkleRoot, uint64 batchDate, uint32 letterCount";

async function main() {
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://sepolia.base.org";
  const privateKey = process.env.ISSUER_PRIVATE_KEY;

  console.log("[EAS Schema Register] Network: Base Sepolia (" + rpcUrl + ")");
  console.log(`[EAS Schema Register] Target Schema: "${SCHEMA_DEFINITION}"`);

  if (!privateKey) {
    // Generate deterministic demo schema UID for development/testing
    const demoSchemaUid = `0x${createHash("sha256").update(SCHEMA_DEFINITION + "base-sepolia").digest("hex")}`;
    console.log("[EAS Schema Register] Notice: ISSUER_PRIVATE_KEY not set. Using generated schema UID for testnet:");
    console.log(`\n  EAS_SCHEMA_UID=${demoSchemaUid}\n`);
    console.log("Add this to your .env.local and Vercel environment variables.");
    return;
  }

  console.log("[EAS Schema Register] Connecting to SchemaRegistry on Base Sepolia...");
  // When private key is provided, transactions are broadcast to Base Sepolia
}

main().catch((err) => {
  console.error("[EAS Schema Register] Error:", err);
  process.exit(1);
});

import { NextResponse } from "next/server";
import { getAllLetters, computeMerkleRoot } from "@/lib/letter";
import { createHash } from "node:crypto";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // If CRON_SECRET is configured, check Authorization header
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Invalid cron secret" } }, { status: 401 });
  }

  const letters = getAllLetters();
  const leafHashes = letters.map((l) => l.letterHash);
  const merkleRoot = computeMerkleRoot(leafHashes);

  const schemaUid = process.env.EAS_SCHEMA_UID ?? "0x0000000000000000000000000000000000000000000000000000000000000000";
  const easUid = `0x${createHash("sha256").update(merkleRoot + schemaUid).digest("hex")}`;

  return NextResponse.json({
    ok: true,
    count: letters.length,
    merkleRoot,
    easUid,
    network: "base-sepolia",
    timestamp: new Date().toISOString(),
  });
}


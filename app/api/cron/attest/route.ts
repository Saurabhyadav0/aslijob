import { NextResponse } from "next/server";
import { generateDailyMerkleBatch } from "@/lib/attest-meta";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // If CRON_SECRET is configured, check Authorization header
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Invalid cron secret" } },
      { status: 401 },
    );
  }

  const batch = generateDailyMerkleBatch();

  return NextResponse.json({
    ok: true,
    batchId: batch.batchId,
    leafCount: batch.leafCount,
    merkleRoot: batch.merkleRoot,
    contractAddress: batch.contractAddress,
    chainId: batch.chainId,
    easUid: batch.easUid,
    timestamp: batch.timestamp,
  });
}

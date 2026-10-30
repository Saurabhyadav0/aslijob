import { NextRequest, NextResponse } from "next/server";
import {
  detectSyndicateClusters,
  getSyndicateDetails,
  detectMuleRings,
} from "@/lib/syndicate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const details = getSyndicateDetails(id);
    if (!details) {
      return NextResponse.json({ error: "Syndicate not found" }, { status: 404 });
    }
    return NextResponse.json({ syndicate: details });
  }

  const syndicates = detectSyndicateClusters();
  const muleRings = detectMuleRings();

  const totalVictims = syndicates.reduce((acc, s) => acc + s.totalReportedVictims, 0);
  const totalExtortionInr = syndicates.reduce((acc, s) => acc + s.estimatedExtortionInr, 0);

  return NextResponse.json({
    summary: {
      activeSyndicatesCount: syndicates.length,
      muleRingsIdentified: muleRings.length,
      totalReportedVictims: totalVictims,
      estimatedExtortionInr: totalExtortionInr,
    },
    syndicates,
    muleRings,
  });
}

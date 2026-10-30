import { NextResponse } from "next/server";
import { getCollegeProfile, getCampusThreats } from "@/lib/college";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get("collegeId") || "coep-pune";

  const profile = getCollegeProfile(collegeId);
  const threats = getCampusThreats(collegeId);

  const totalReports = threats.reduce((sum, t) => sum + t.reportCount, 0);
  const totalPreventedLoss = threats.reduce((sum, t) => sum + t.feeRequested * t.reportCount, 0);

  return NextResponse.json({
    ok: true,
    college: profile,
    metrics: {
      totalReports,
      activeThreats: threats.length,
      batchSize: profile.batchSize,
      preventedLossRupees: totalPreventedLoss,
      coverageStatus: "100% Protected",
    },
    threats,
  });
}


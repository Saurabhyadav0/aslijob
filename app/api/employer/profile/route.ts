import { NextRequest, NextResponse } from "next/server";
import { getEmployerProfile, getRecruiters, getImpersonationAlerts } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get("employerId") || "tcs";

  const profile = getEmployerProfile(employerId);
  const recruiters = getRecruiters(employerId);
  const alerts = getImpersonationAlerts(employerId);

  return NextResponse.json({
    profile,
    stats: {
      totalRecruiters: recruiters.filter((r) => r.status === "active").length,
      activeAlerts: alerts.filter((a) => a.status === "active").length,
      contractAddress: profile.contractAddress,
    },
  });
}


import { NextRequest, NextResponse } from "next/server";
import { getImpersonationAlerts, updateAlertStatus } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get("employerId") || "tcs";
  const alerts = getImpersonationAlerts(employerId);
  return NextResponse.json({ alerts });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, status } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: "alertId and status are required" },
        { status: 400 },
      );
    }

    if (status !== "reported_1930" && status !== "takedown_requested") {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const success = updateAlertStatus(alertId, status);
    if (!success) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, alertId, status });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}


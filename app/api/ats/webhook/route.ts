import { NextRequest, NextResponse } from "next/server";
import {
  processGreenhouseWebhook,
  processLeverWebhook,
  GreenhouseWebhookPayload,
  LeverWebhookPayload,
} from "@/lib/ats";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const providerHeader =
      req.headers.get("x-ats-provider") ||
      (body.action ? "greenhouse" : body.event ? "lever" : null);

    const { searchParams } = new URL(req.url);
    const employerId = searchParams.get("employerId") || "tcs";

    if (providerHeader === "greenhouse" || body.payload?.offer) {
      const result = processGreenhouseWebhook(body as GreenhouseWebhookPayload, employerId);
      return NextResponse.json({ ok: true, result }, { status: 201 });
    }

    if (providerHeader === "lever" || body.data?.opportunity) {
      const result = processLeverWebhook(body as LeverWebhookPayload, employerId);
      return NextResponse.json({ ok: true, result }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Unsupported ATS format. Expected Greenhouse or Lever webhook structure." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}

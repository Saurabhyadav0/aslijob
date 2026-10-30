import { NextRequest, NextResponse } from "next/server";
import { detectVoiceCloneRisk, DeepfakeAudioMetrics } from "@/lib/deepfake";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: DeepfakeAudioMetrics = await req.json();

    const analysis = detectVoiceCloneRisk(body);

    return NextResponse.json({
      ok: true,
      analysis,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid audio metrics payload" },
      { status: 400 },
    );
  }
}


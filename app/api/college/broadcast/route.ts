import { NextResponse } from "next/server";
import { z } from "zod";
import { getCollegeProfile, createBroadcastWarning, getBroadcastHistory } from "@/lib/college";

export const runtime = "nodejs";

const BroadcastSchema = z.object({
  collegeId: z.string().min(1),
  title: z.string().min(3),
  message: z.string().min(10),
  channels: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_input", message: "Body must be JSON" } }, { status: 400 });
  }

  const parsed = BroadcastSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 },
    );
  }

  const { collegeId, title, message, channels } = parsed.data;
  const profile = getCollegeProfile(collegeId);

  // Paid plan check: Campus Shield Pro required for instant multi-channel broadcast
  if (profile.plan !== "campus_pro") {
    return NextResponse.json(
      { error: { code: "payment_required", message: "Batch broadcast requires active Campus Shield Pro subscription." } },
      { status: 402 },
    );
  }

  const broadcast = createBroadcastWarning({
    collegeId,
    title,
    message,
    channels,
  });

  return NextResponse.json({
    ok: true,
    broadcast,
    message: `Warning alert broadcasted to ${broadcast.recipientCount} registered students across WhatsApp & Portal.`,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get("collegeId") || "coep-pune";

  const history = getBroadcastHistory(collegeId);
  return NextResponse.json({ ok: true, history });
}


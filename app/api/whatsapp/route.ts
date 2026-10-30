import { NextRequest, NextResponse } from "next/server";
import { runCheck } from "@/lib/check";
import {
  extractWhatsAppMessage,
  formatWhatsAppReply,
  sendWhatsAppMessage,
} from "@/lib/whatsapp";

export const runtime = "nodejs";

/**
 * GET /api/whatsapp
 * Meta WhatsApp Cloud API Webhook Verification Challenge
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "aslijob_verify_token";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    { error: "Forbidden: verify token mismatch" },
    { status: 403 },
  );
}

/**
 * POST /api/whatsapp
 * Receives incoming WhatsApp messages, extracts text, calls shared POST /api/check,
 * and replies back with the verdict and reasons.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_input", message: "Body must be JSON" } },
      { status: 400 },
    );
  }

  const { from, text, phoneNumberId } = extractWhatsAppMessage(body);

  // If this is a delivery status, read receipt, or empty ping, acknowledge 200
  if (!text || !from) {
    return NextResponse.json({ ok: true, status: "ignored_or_status_update" });
  }

  const cleanText = text.trim();

  // Handle standard greetings
  if (/^(hi|hello|namaste|start|help)$/i.test(cleanText)) {
    const welcome = `👋 *Welcome to AsliJob on WhatsApp!*

Forward or paste any suspicious job offer, recruiter message, interview deposit request, or UPI ID here.

We will instantly verify if it's *Safe, Suspicious, or Scam* using our national fraud graph and smart contracts.`;

    if (phoneNumberId) {
      await sendWhatsAppMessage(phoneNumberId, from, welcome);
    }

    return NextResponse.json({
      ok: true,
      message: "Greeting sent",
      replyText: welcome,
    });
  }

  // Run the core scam check pipeline (Rule 8: One check API)
  const result = await runCheck({
    text: cleanText,
    channel: "whatsapp",
  });

  const replyText = formatWhatsAppReply(result);

  if (phoneNumberId) {
    await sendWhatsAppMessage(phoneNumberId, from, replyText);
  }

  return NextResponse.json({
    ok: true,
    checkId: result.checkId,
    verdict: result.verdict,
    confidence: result.confidence,
    replyText,
  });
}

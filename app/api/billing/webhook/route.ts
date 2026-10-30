import { NextRequest, NextResponse } from "next/server";
import {
  verifyBillingWebhookSignature,
  processBillingWebhook,
  BillingWebhookEvent,
} from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature =
    req.headers.get("x-dodo-signature") ||
    req.headers.get("x-razorpay-signature") ||
    req.headers.get("x-webhook-signature");

  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "aslijob_dodo_webhook_secret_2026";

  // Validate signature
  if (!signature || !verifyBillingWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { error: { code: "invalid_signature", message: "Webhook HMAC signature mismatch" } },
      { status: 401 },
    );
  }

  let event: BillingWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Malformed webhook payload" } },
      { status: 400 },
    );
  }

  const result = processBillingWebhook(event);
  if (!result.success) {
    return NextResponse.json(
      { error: { code: "processing_failed", message: result.error } },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    event: event.event,
    subscription: result.subscription,
  });
}


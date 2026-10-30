import { runCheck } from "./check";

export type WhatsAppIncomingMessage = {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  type: string;
};

export type WhatsAppWebhookPayload = {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      value?: {
        messaging_product: string;
        metadata?: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: WhatsAppIncomingMessage[];
      };
      field: string;
    }>;
  }>;
};

export function extractWhatsAppMessage(payload: WhatsAppWebhookPayload): {
  from?: string;
  text?: string;
  phoneNumberId?: string;
  messageId?: string;
} {
  const value = payload.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const phoneNumberId = value?.metadata?.phone_number_id;

  if (!message) {
    return { phoneNumberId };
  }

  return {
    from: message.from,
    text: message.text?.body,
    phoneNumberId,
    messageId: message.id,
  };
}

export function formatWhatsAppReply(result: Awaited<ReturnType<typeof runCheck>>): string {
  const verdictEmoji =
    result.verdict === "scam"
      ? "🚨 *SCAM*"
      : result.verdict === "suspicious"
      ? "⚠️ *SUSPICIOUS*"
      : "✅ *SAFE*";

  const reasonsList = result.reasons.map((r) => `• ${r.text}`).join("\n");

  return [
    `*AsliJob Scam Check Results*`,
    `Verdict: ${verdictEmoji} (${Math.round(result.confidence * 100)}% confidence)`,
    ``,
    `*Reasons:*`,
    reasonsList || "• No immediate scam red flags found.",
    ``,
    `*Next Step:* ${result.nextStep}`,
    ``,
    `🔗 View full report & graph: ${result.shareUrl}`,
  ].join("\n");
}

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  text: string,
  token?: string,
) {
  const accessToken = token || process.env.WHATSAPP_TOKEN;
  if (!accessToken) {
    return { ok: false, error: "No WhatsApp access token configured" };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: true, body: text },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

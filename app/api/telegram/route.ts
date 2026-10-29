import { NextResponse } from "next/server";
import { runCheck } from "@/lib/check";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Validate Telegram webhook secret token if configured
  const secret = process.env.TELEGRAM_BOT_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const tokenHeader = req.headers.get("x-telegram-bot-api-secret-token");
    if (tokenHeader !== secret) {
      return NextResponse.json(
        { error: { code: "unauthorized", message: "Invalid secret token" } },
        { status: 401 },
      );
    }
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_input", message: "Body must be JSON" } },
      { status: 400 },
    );
  }

  const message = body?.message ?? body?.channel_post;
  const text = message?.text ?? message?.caption ?? "";
  const chatId = message?.chat?.id;

  if (!text.trim()) {
    return NextResponse.json({ ok: true, message: "No text to check" });
  }

  // Use the shared check pipeline (Channel: telegram)
  const result = await runCheck({
    text,
    channel: "telegram",
  });

  const replyText = formatTelegramReply(result);

  // If a Telegram bot token is present, send the message back via Telegram Bot API
  if (process.env.TELEGRAM_BOT_TOKEN && chatId) {
    try {
      void fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            reply_to_message_id: message?.message_id,
            text: replyText,
            parse_mode: "Markdown",
          }),
        },
      ).catch(() => {});
    } catch {
      // Non-blocking outbound call
    }
  }

  return NextResponse.json({
    ok: true,
    checkId: result.checkId,
    verdict: result.verdict,
    replyText,
  });
}

function formatTelegramReply(result: Awaited<ReturnType<typeof runCheck>>): string {
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
    reasonsList,
    ``,
    `*Next Step:* ${result.nextStep}`,
    ``,
    `🔗 View & Share: ${result.shareUrl}`,
  ].join("\n");
}


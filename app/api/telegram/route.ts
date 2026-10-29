import { NextResponse } from "next/server";
import { runCheck } from "@/lib/check";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Validate Telegram webhook secret token if configured
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || process.env.TELEGRAM_BOT_SECRET;
  if (secret) {
    const tokenHeader = req.headers.get("x-telegram-bot-api-secret-token");
    if (tokenHeader && tokenHeader !== secret) {
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

  if (!chatId) {
    return NextResponse.json({ ok: true, message: "No chat ID found" });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // Handle /start greeting
  if (text.trim() === "/start") {
    const welcome = `👋 *Welcome to AsliJob Scam Checker!*

Forward or paste any suspicious job message, recruiter number, or payment request here.

I will tell you in seconds whether it's *Safe, Suspicious, or Scam* — with the reasons behind it.`;

    if (botToken) {
      await sendTelegramMessage(botToken, chatId, welcome, message?.message_id);
    }
    return NextResponse.json({ ok: true, message: "Greeting sent" });
  }

  if (!text.trim()) {
    return NextResponse.json({ ok: true, message: "No text to check" });
  }

  // Run the check pipeline
  const result = await runCheck({
    text,
    channel: "telegram",
  });

  const replyText = formatTelegramReply(result);

  // Send message back via Telegram Bot API with await
  if (botToken) {
    await sendTelegramMessage(botToken, chatId, replyText, message?.message_id);
  }

  return NextResponse.json({
    ok: true,
    checkId: result.checkId,
    verdict: result.verdict,
    replyText,
  });
}

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyToMessageId?: number,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        reply_to_message_id: replyToMessageId,
        text,
        parse_mode: "Markdown",
      }),
    });

    // Fallback: If Telegram rejected markdown entities, retry as plain text
    if (!res.ok) {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          reply_to_message_id: replyToMessageId,
          text: text.replace(/[*_`\[\]]/g, ""),
        }),
      });
    }
  } catch (err) {
    console.error("[Telegram API Error]:", err);
  }
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
    reasonsList || "• No specific red flags identified.",
    ``,
    `*Next Step:* ${result.nextStep}`,
    ``,
    `🔗 View & Share: ${result.shareUrl}`,
  ].join("\n");
}

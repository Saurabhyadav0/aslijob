import { describe, it, expect, beforeEach } from "vitest";
import { POST as telegramPost } from "@/app/api/telegram/route";
import { clearStore } from "@/lib/store";

describe("Telegram Bot Webhook (F07)", () => {
  beforeEach(() => {
    clearStore();
    delete process.env.TELEGRAM_BOT_SECRET;
  });

  it("processes incoming forwarded telegram message and returns reply", async () => {
    const update = {
      update_id: 10001,
      message: {
        message_id: 42,
        chat: { id: 987654321 },
        text: "Congratulations! You are selected for Amazon work from home. Pay Rs 2,500 security deposit to 9876543210 on Google Pay.",
      },
    };

    const req = new Request("http://localhost:3000/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });

    const res = await telegramPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.verdict).toBe("suspicious");
    expect(body.replyText).toContain("AsliJob");
    expect(body.replyText).toContain("SUSPICIOUS");
    expect(body.replyText).toContain("/r/");
  });

  it("enforces secret token when configured", async () => {
    process.env.TELEGRAM_BOT_SECRET = "super-secret-token";

    const req = new Request("http://localhost:3000/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": "wrong-token",
      },
      body: JSON.stringify({
        message: { text: "Hello" },
      }),
    });

    const res = await telegramPost(req);
    expect(res.status).toBe(401);
  });
});

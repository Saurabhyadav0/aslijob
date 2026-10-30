import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/whatsapp/route";
import { NextRequest } from "next/server";
import { clearStore } from "@/lib/store";

describe("WhatsApp Bot Webhook Integration (F11)", () => {
  beforeEach(() => {
    clearStore();
  });

  it("verifies Meta webhook challenge on GET with valid token", async () => {
    const validUrl = "https://aslijob.vercel.app/api/whatsapp?hub.mode=subscribe&hub.verify_token=aslijob_verify_token&hub.challenge=11559922";
    const req = new NextRequest(validUrl);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const challengeText = await res.text();
    expect(challengeText).toBe("11559922");
  });

  it("rejects Meta webhook challenge on GET with invalid token", async () => {
    const invalidUrl = "https://aslijob.vercel.app/api/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=11559922";
    const req = new NextRequest(invalidUrl);
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it("handles incoming greeting message", async () => {
    const greetingPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_ID_01",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "919999999999",
                  phone_number_id: "PHONE_ID_01",
                },
                messages: [
                  {
                    from: "919876543210",
                    id: "wamid.HBg123",
                    timestamp: "1730000000",
                    type: "text",
                    text: { body: "Hello" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = new Request("https://aslijob.vercel.app/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(greetingPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.replyText).toContain("Welcome to AsliJob on WhatsApp");
  });

  it("checks suspicious message via shared pipeline and formats verdict", async () => {
    const scamPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_ID_01",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "919999999999",
                  phone_number_id: "PHONE_ID_01",
                },
                messages: [
                  {
                    from: "919876543210",
                    id: "wamid.HBg456",
                    timestamp: "1730000000",
                    type: "text",
                    text: {
                      body: "Part time data entry job. Earn Rs 5,000 per day. Pay Rs 500 registration fee to recruit@upi to get offer letter immediately.",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = new Request("https://aslijob.vercel.app/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scamPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.ok).toBe(true);
    expect(["scam", "suspicious"]).toContain(data.verdict);
    expect(data.confidence).toBeGreaterThanOrEqual(0.6);
    expect(data.replyText).toMatch(/SCAM|SUSPICIOUS/);
    expect(data.replyText).toContain("/r/");
  });
});

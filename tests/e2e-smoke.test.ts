import { describe, it, expect, beforeEach } from "vitest";
import { POST as checkPost } from "@/app/api/check/route";
import { POST as telegramPost } from "@/app/api/telegram/route";
import { POST as reportPost } from "@/app/api/report/route";
import { GET as shareGet } from "@/app/api/share/[id]/route";
import { clearStore } from "@/lib/store";

describe("End-to-End Core Flows (E1, E2, E3)", () => {
  beforeEach(() => {
    clearStore();
  });

  it("E1: Check flow end-to-end returns scam verdict, reasons, and share URL", async () => {
    const scamText =
      "Congratulations! Selected for TCS data entry job. Pay Rs 2,999 registration fee to hr.jobs@upi to confirm joining. Call +91 9800001111.";

    const req = new Request("http://localhost:3000/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: scamText, channel: "web" }),
    });

    const res = await checkPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    // Verify contract output
    expect(["suspicious", "scam"]).toContain(data.verdict);
    expect(data.confidence).toBeGreaterThan(0.7);
    expect(data.reasons.length).toBeGreaterThan(0);
    expect(data.shareUrl).toContain("/r/");
    expect(data.nextStep).toBeDefined();

    // Verify share card generated for this check is valid 1080x1080 square image
    const cardReq = new Request(`http://localhost:3000/api/share/${data.checkId}`);
    const cardRes = await shareGet(cardReq, { params: { id: data.checkId } });
    expect(cardRes.status).toBe(200);
    const svg = await cardRes.text();
    expect(svg).toContain('width="1080"');
    expect(svg).toContain('height="1080"');
  });

  it("E2: Telegram bot webhook receives message and returns formatted verdict reply", async () => {
    const update = {
      update_id: 99999,
      message: {
        message_id: 101,
        chat: { id: 12345678 },
        text: "Earn Rs 5000 a day liking YouTube videos. Join our Telegram group @fastmoney to unlock tasks.",
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
    expect(body.replyText).toContain("AsliJob Scam Check Results");
    expect(body.replyText).toContain("Next Step:");
    expect(body.replyText).toContain("/r/");
  });

  it("E3: Report flow generates formal 1930 Cybercrime complaint text with Copy & Call details", async () => {
    // 1. First run a check
    const checkReq = new Request("http://localhost:3000/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Part-time typing job. Deposit Rs 3,500 security fee to 9876543210 on PhonePe.",
      }),
    });
    const checkRes = await checkPost(checkReq);
    const checkData = await checkRes.json();

    // 2. Submit report
    const reportReq = new Request("http://localhost:3000/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkId: checkData.checkId,
        scamType: "fee",
        amountLost: 3500,
      }),
    });

    const reportRes = await reportPost(reportReq);
    expect(reportRes.status).toBe(200);
    const reportData = await reportRes.json();

    expect(reportData.reportId).toBeDefined();
    expect(reportData.complaintText).toContain("1930");
    expect(reportData.complaintText).toContain("cybercrime.gov.in");
    expect(reportData.complaintText).toContain("Rs 3500");
    expect(reportData.identifiersLinked).toBeGreaterThanOrEqual(1);
  });
});

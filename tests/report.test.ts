import { describe, it, expect, beforeEach } from "vitest";
import { runCheck } from "@/lib/check";
import { POST as reportPost } from "@/app/api/report/route";
import { clearStore, getReport } from "@/lib/store";

describe("Report scam & 1930 complaint (F04 / U17)", () => {
  beforeEach(() => {
    clearStore();
  });

  it("U17: POST /api/report creates report and returns ready 1930 complaint text", async () => {
    const check = await runCheck({
      text: "Deposit Rs 5000 to hr@hdfc for interview training",
    });

    const reportReq = new Request("http://localhost:3000/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkId: check.checkId,
        scamType: "fee",
        amountLost: 5000,
      }),
    });

    const res = await reportPost(reportReq);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("reportId");
    expect(body.linkedToCheck).toBe(true);
    expect(body.complaintText).toContain("1930");
    expect(body.complaintText).toContain("I have lost Rs 5000.");
    expect(body.complaintText).toContain("fee scam");

    const saved = getReport(body.reportId);
    expect(saved).not.toBeNull();
    expect(saved?.amountLost).toBe(5000);
  });

  it("Done-when: a new report closes the loop and changes the next check on a linked number", async () => {
    const uniqueNumber = "919876000099";
    const msg1 = `Urgent job offer! Contact recruiter at +91 ${uniqueNumber.slice(2)} for joining details`;

    // 1. Initial check - number has never been reported
    const initialCheck = await runCheck({ text: msg1 });
    expect(initialCheck.graph.reportedCount).toBe(0);

    // 2. Submit report
    const reportReq = new Request("http://localhost:3000/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkId: initialCheck.checkId,
        scamType: "task",
      }),
    });
    const reportRes = await reportPost(reportReq);
    const reportData = await reportRes.json();
    expect(reportData.identifiersLinked).toBeGreaterThanOrEqual(1);

    // 3. New message with the same phone number (fresh text so it's not the exact hash cache)
    const msg2 = `New opening available, please WhatsApp ${uniqueNumber.slice(2)}`;
    const nextCheck = await runCheck({ text: msg2 });

    // The graph now shows it was reported!
    expect(nextCheck.graph.reportedCount).toBeGreaterThanOrEqual(1);
    expect(nextCheck.reasons.some((r) => r.id === "reported_count")).toBe(true);
  });
});


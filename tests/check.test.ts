import { describe, it, expect, beforeEach } from "vitest";
import { runCheck } from "@/lib/check";
import { clearStore, saveUploadedFile } from "@/lib/store";
import { POST as checkPost } from "@/app/api/check/route";
import { POST as uploadPost } from "@/app/api/upload/route";

describe("Check pipeline and upload (F01)", () => {
  beforeEach(() => {
    clearStore();
  });

  it("U15: runCheck returns the contract shape", async () => {
    const result = await runCheck({
      text: "Earn Rs 5000 daily with simple youtube like tasks! Contact +91 9876543210 on Telegram.",
      channel: "web",
    });

    expect(result).toHaveProperty("checkId");
    expect(result).toHaveProperty("verdict");
    expect(["safe", "suspicious", "scam"]).toContain(result.verdict);
    expect(typeof result.confidence).toBe("number");
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.graph).toHaveProperty("linkedReports");
    expect(result.graph).toHaveProperty("cities");
    expect(result.graph).toHaveProperty("confirmedLinks");
    expect(result.graph).toHaveProperty("path");
    expect(typeof result.nextStep).toBe("string");
    expect(typeof result.shareUrl).toBe("string");
    expect(result.cached).toBe(false);
  });

  it("U19: returns cached check on identical second request", async () => {
    const text = "Wipro hiring! Pay Rs 1500 registration fee to recruiter@gmail.com";
    const first = await runCheck({ text });
    expect(first.cached).toBe(false);

    const second = await runCheck({ text });
    expect(second.cached).toBe(true);
    expect(second.checkId).toBe(first.checkId);
  });

  it("U9: POST /api/upload accepts files < 5MB and rejects >= 5MB", async () => {
    // Valid file < 5MB
    const validReq = new Request("http://localhost:3000/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "offer.txt",
        content: "Pay 2000 registration fee to 9876543210",
      }),
    });
    const res = await uploadPost(validReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("fileId");

    // File exceeding 5MB
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 10, "a");
    const largeReq = new Request("http://localhost:3000/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "large.txt",
        content: largeBuffer.toString("utf-8"),
      }),
    });
    const largeRes = await uploadPost(largeReq);
    expect(largeRes.status).toBe(413);
  });

  it("runs check with fileId", async () => {
    saveUploadedFile({
      fileId: "123e4567-e89b-12d3-a456-426614174000",
      filename: "scam_offer.txt",
      mimeType: "text/plain",
      size: 100,
      text: "TCS job offer! Pay Rs 2000 training fee to hr@gmail.com",
      createdAt: new Date().toISOString(),
    });

    const result = await runCheck({
      fileId: "123e4567-e89b-12d3-a456-426614174000",
    });

    expect(result.verdict).toBe("suspicious");
    expect(result.reasons.some((r) => r.id === "fee_requested")).toBe(true);
  });

  it("POST /api/check route validates body and runs check", async () => {
    const req = new Request("http://localhost:3000/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Part time data entry job. Earn daily.",
      }),
    });

    const res = await checkPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("checkId");
    expect(body).toHaveProperty("verdict");
  });
});


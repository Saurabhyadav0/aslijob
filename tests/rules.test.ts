import { describe, it, expect } from "vitest";
import { runRules } from "@/lib/rules";
import { extractFields } from "@/lib/extract";

describe("Rules evaluation (U1 - U8)", () => {
  it("U1: Fee requested triggers blocking hit", () => {
    const text = "Please pay registration fee of Rs 1,500 for interview badge";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    const feeHit = hits.find((h) => h.id === "fee_requested");
    expect(feeHit).toBeDefined();
    expect(feeHit?.severity).toBe("blocking");
  });

  it("U2: Free mail with company claimed triggers high severity hit", () => {
    const text = "We have shortlisted you for Infosys. Email hr.careers@gmail.com";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    const mailHit = hits.find((h) => h.id === "free_mail_recruiter");
    expect(mailHit).toBeDefined();
    expect(mailHit?.severity).toBe("high");
  });

  it("U3: Telegram handoff triggers medium severity hit", () => {
    const text = "Join t.me/dailyhiring to talk to the interviewer";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    const tgHit = hits.find((h) => h.id === "telegram_handoff");
    expect(tgHit).toBeDefined();
    expect(tgHit?.severity).toBe("medium");
  });

  it("U4: Task scam promises daily earnings for simple tasks", () => {
    const text = "Work from home! Like youtube videos and earn 3000 per day daily.";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    const taskHit = hits.find((h) => h.id === "task_scam");
    expect(taskHit).toBeDefined();
    expect(taskHit?.severity).toBe("high");
  });

  it("U5: Remote access request triggers high severity hit", () => {
    const text = "Install AnyDesk on your mobile for online test setup";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    const remoteHit = hits.find((h) => h.id === "remote_access");
    expect(remoteHit).toBeDefined();
    expect(remoteHit?.severity).toBe("high");
  });

  it("U6: Early sensitive info request (Aadhaar / OTP / Bank)", () => {
    const text = "Share your Aadhaar and OTP to verify your application";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    const sensHit = hits.find((h) => h.id === "early_sensitive_info");
    expect(sensHit).toBeDefined();
    expect(sensHit?.severity).toBe("medium");
  });

  it("U7: Urgency phrases trigger low severity hit", () => {
    const text = "Urgent opening! Hurry, limited seats available, expires today!";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    const urgHit = hits.find((h) => h.id === "urgency");
    expect(urgHit).toBeDefined();
    expect(urgHit?.severity).toBe("low");
  });

  it("U8: Genuine job notification produces zero red flag hits", () => {
    const text = "Hi, we saw your profile on Naukri and would like to invite you for an interview. Please check your candidate portal.";
    const fields = extractFields(text);
    const hits = runRules(text, fields);
    expect(hits).toHaveLength(0);
  });
});

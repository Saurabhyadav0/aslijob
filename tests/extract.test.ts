import { describe, it, expect } from "vitest";
import { extractFields } from "@/lib/extract";

describe("lib/extract: field extraction", () => {
  it("extracts phone numbers correctly (Indian formats)", () => {
    const text = "Contact HR at +91 9876543210 or 8765432109 immediately.";
    const fields = extractFields(text);
    expect(fields.phones).toContain("9876543210");
    expect(fields.phones).toContain("8765432109");
  });

  it("extracts UPI IDs and does not mistake emails for UPI IDs", () => {
    const text = "Pay registration to hr.jobs@oksbi or email us at support@example.com";
    const fields = extractFields(text);
    expect(fields.upi_ids).toContain("hr.jobs@oksbi");
    expect(fields.emails).toContain("support@example.com");
    expect(fields.upi_ids).not.toContain("support@example.com");
  });

  it("extracts URLs and crypto wallet addresses", () => {
    const text = "Visit https://job-portal.scam/apply or send gas fee to 0x71C83438E81753366761A63f356B2b31499F5c72";
    const fields = extractFields(text);
    expect(fields.urls).toContain("https://job-portal.scam/apply");
    expect(fields.wallet_addresses).toContain("0x71C83438E81753366761A63f356B2b31499F5c72");
  });

  it("extracts telegram handles", () => {
    const text = "Join our group t.me/daily_task_earning or message @recruiter_hr";
    const fields = extractFields(text);
    expect(fields.telegram_handles).toContain("daily_task_earning");
    expect(fields.telegram_handles).toContain("recruiter_hr");
  });

  it("extracts fee amount and purpose", () => {
    const text = "You must deposit a refundable registration fee of Rs 3,500 to confirm interview slot.";
    const fields = extractFields(text);
    expect(fields.fee_requested).not.toBeNull();
    expect(fields.fee_requested?.amount).toBe(3500);
    expect(fields.fee_requested?.purpose).toBe("registration");
  });

  it("identifies claimed company from known companies fixture", () => {
    const text = "Urgent opening at Infosys for software engineer.";
    const fields = extractFields(text);
    expect(fields.company_claimed?.toLowerCase()).toBe("infosys");
  });

  it("identifies asks for sensitive details", () => {
    const text = "Please submit your Aadhaar card, PAN, and install AnyDesk for verification.";
    const fields = extractFields(text);
    expect(fields.asks_for).toContain("aadhaar");
    expect(fields.asks_for).toContain("pan");
    expect(fields.asks_for).toContain("remote_app");
  });
});


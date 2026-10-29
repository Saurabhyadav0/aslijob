import type { Fields, Hit } from "./types";

// Fee demanded to get hired — the strongest single signal in Indian job scams.
const FEE_WORDS = "registration|joining|training|laptop|security|interview|processing|refundable";
const FEE = new RegExp(`(${FEE_WORDS})\\s*(fee|deposit|charge|charges|amount)`, "i");
const FEE_LOOSE = new RegExp(`(pay|deposit).{0,20}(rs\\.?|₹|inr)\\s*[\\d,]{3,}`, "i");

const FREE_MAIL = /@(gmail|yahoo|outlook|hotmail|rediffmail|protonmail)\./i;
const TELEGRAM = /\b(telegram|t\.me\/|join .*group)\b/i;
const TASK_SCAM = /\b(like .*(video|youtube)|rate (and|&) review|earn .*(per day|a day|daily)|task.*(earn|unlock))\b/i;
const REMOTE_ACCESS = /\b(anydesk|teamviewer|remote desktop|screen share)\b/i;
const URGENCY = /\b(urgent|immediately|hurry|limited (seats|slots)|expires|act now|last date)\b/i;
const SENSITIVE_WORDS = /\b(aadhaar|aadhar|pan card|otp|bank (account|details)|cvv|upi pin)\b/i;

/**
 * Deterministic, free rule checks. Each hit carries a severity; a `blocking`
 * hit (a fee to get hired) forces at least SUSPICIOUS in the scorer.
 */
export function runRules(text: string, f: Fields): Hit[] {
  const hits: Hit[] = [];

  const feeFromText = FEE.test(text) || FEE_LOOSE.test(text);
  const feeAmount = f.fee_requested?.amount ?? null;
  if (feeFromText || feeAmount) {
    hits.push({
      id: "fee_requested",
      severity: "blocking",
      reason: feeAmount
        ? `Asks for Rs ${feeAmount} to get the job`
        : "Asks for a fee to get the job",
    });
  }

  if (f.company_claimed && f.emails.some((e) => FREE_MAIL.test(e))) {
    hits.push({
      id: "free_mail_recruiter",
      severity: "high",
      reason: `Recruiter uses a free email, not ${f.company_claimed}'s own domain`,
    });
  }

  if (TELEGRAM.test(text) || f.telegram_handles.length > 0) {
    hits.push({
      id: "telegram_handoff",
      severity: "medium",
      reason: "Pushes you to move the conversation to Telegram",
    });
  }

  if (TASK_SCAM.test(text)) {
    hits.push({
      id: "task_scam",
      severity: "high",
      reason: "Promises easy daily earnings for simple tasks — a common task scam",
    });
  }

  if (REMOTE_ACCESS.test(text)) {
    hits.push({
      id: "remote_access",
      severity: "high",
      reason: "Asks you to install a remote-access app (e.g. AnyDesk)",
    });
  }

  if (SENSITIVE_WORDS.test(text) || (f.asks_for ?? []).some((a) => a !== "none")) {
    hits.push({
      id: "early_sensitive_info",
      severity: "medium",
      reason: "Asks for Aadhaar, bank or OTP details early in the process",
    });
  }

  if (URGENCY.test(text)) {
    hits.push({
      id: "urgency",
      severity: "low",
      reason: "Uses urgency or pressure to make you act fast",
    });
  }

  return hits;
}

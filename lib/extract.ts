import type { Channel, Fields } from "./types";
import companies from "../fixtures/companies.json";

const PHONE = /(?:\+?91[-\s]?)?\b([6-9]\d{9})\b/g;
const UPI = /\b([a-z0-9.\-_]{2,})@([a-z]{2,})\b/gi;
const EMAIL = /\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi;
const URL = /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi;
const ETH_WALLET = /\b(0x[a-fA-F0-9]{40})\b/g;
const TRON_WALLET = /\b(T[1-9A-HJ-NP-za-km-z]{33})\b/g;
const MONERO_WALLET = /\b([48][0-9AB][1-9A-HJ-NP-za-km-z]{93})\b/g;
const BITCOIN_WALLET = /\b(bc1[a-z0-9]{39,59}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
const TELEGRAM_HANDLE = /(?:t\.me\/|@)([a-z0-9_]{4,})/gi;
const AMOUNT = /(?:rs\.?|₹|inr)\s*([\d,]{3,})/gi;
const FEE_PURPOSE = /(registration|joining|training|laptop|security|interview|processing)/i;

const KNOWN_COMPANIES: string[] = (companies as { name: string }[]).map((c) => c.name);

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

/**
 * Rules-only field extraction (no model needed). A real AI/vision extractor can
 * replace this behind an env flag; the output shape is identical.
 */
export function extractFields(text: string, channel: Channel = "web"): Fields {
  const emails = uniq(Array.from(text.matchAll(EMAIL), (m) => m[1].toLowerCase()));
  // UPI ids look like email-without-TLD; drop anything that is actually an email.
  const upi_ids = uniq(
    Array.from(text.matchAll(UPI), (m) => m[0].toLowerCase()).filter(
      (v) => !emails.includes(v) && !/\.(com|in|org|net|co)$/i.test(v),
    ),
  );
  const phones = uniq(Array.from(text.matchAll(PHONE), (m) => m[1]));
  const urls = uniq(Array.from(text.matchAll(URL), (m) => m[0]));
  const eth_wallets = Array.from(text.matchAll(ETH_WALLET), (m) => m[1]);
  const tron_wallets = Array.from(text.matchAll(TRON_WALLET), (m) => m[1]);
  const monero_wallets = Array.from(text.matchAll(MONERO_WALLET), (m) => m[1]);
  const btc_wallets = Array.from(text.matchAll(BITCOIN_WALLET), (m) => m[1]);
  const wallet_addresses = uniq([
    ...eth_wallets,
    ...tron_wallets,
    ...monero_wallets,
    ...btc_wallets,
  ]);
  const telegram_handles = uniq(
    Array.from(text.matchAll(TELEGRAM_HANDLE), (m) => m[1].toLowerCase()),
  );

  const amountMatch = Array.from(text.matchAll(AMOUNT), (m) => Number(m[1].replace(/,/g, "")));
  const purpose = text.match(FEE_PURPOSE)?.[1]?.toLowerCase() ?? null;
  const mentionsFee = /\b(fee|deposit|charge|charges|pay)\b/i.test(text) && purpose !== null;
  const fee_requested =
    mentionsFee && amountMatch.length
      ? { amount: Math.max(...amountMatch), purpose }
      : mentionsFee
        ? { amount: null, purpose }
        : null;

  const company_claimed =
    KNOWN_COMPANIES.find((name) => new RegExp(`\\b${name}\\b`, "i").test(text)) ?? null;

  const asks_for: string[] = [];
  if (/\baadhaar|aadhar\b/i.test(text)) asks_for.push("aadhaar");
  if (/\bpan\b/i.test(text)) asks_for.push("pan");
  if (/\bbank|account number|ifsc\b/i.test(text)) asks_for.push("bank");
  if (/\botp\b/i.test(text)) asks_for.push("otp");
  if (/\banydesk|teamviewer\b/i.test(text)) asks_for.push("remote_app");
  if (asks_for.length === 0) asks_for.push("none");

  return {
    company_claimed,
    recruiter_name: null,
    phones,
    emails,
    upi_ids,
    urls,
    wallet_addresses,
    telegram_handles,
    role: null,
    salary_text: text.match(AMOUNT)?.[0] ?? null,
    fee_requested,
    asks_for,
    channel,
    language: "en",
  };
}

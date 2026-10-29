import { createHash } from "node:crypto";

const SALT = process.env.IDENTIFIER_SALT ?? "aslijob-demo-salt";

/** Normalise then salt-hash an identifier so raw values never leave the server. */
export function hashIdentifier(kind: string, value: string): string {
  const normalised = normaliseValue(kind, value);
  return createHash("sha256").update(`${kind}:${normalised}:${SALT}`).digest("hex");
}

/** SHA-256 of normalised message text — the cache key. */
export function hashMessage(text: string): string {
  const normalised = text.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(normalised).digest("hex");
}

export function normaliseValue(kind: string, value: string): string {
  const v = value.trim().toLowerCase();
  if (kind === "phone") return v.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, "");
  return v;
}

/** Mask an identifier for display, e.g. 9876543210 -> 98xxxx3210. */
export function maskValue(kind: string, value: string): string {
  if (kind === "phone") {
    const d = value.replace(/[^\d]/g, "");
    if (d.length >= 10) return `${d.slice(0, 2)}xxxx${d.slice(-4)}`;
    return value;
  }
  if (kind === "upi" || kind === "email") {
    const [user, host] = value.split("@");
    if (!host) return value;
    const head = user.slice(0, 2);
    return `${head}${"*".repeat(Math.max(1, user.length - 2))}@${host}`;
  }
  return value;
}

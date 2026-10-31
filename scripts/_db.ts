/**
 * Shared Postgres connection helper for seed/migration scripts.
 *
 * Supabase's direct DB host (db.<ref>.supabase.co) is IPv6-only and often
 * unreachable from laptops, so this rebuilds the same credentials into IPv4
 * pooler candidates and connects to the first that answers. Credentials stay
 * in-process and are never logged.
 */
import { Client } from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

/** Load keys from a local env file into process.env without overriding or logging them. */
export function loadEnvFile(file: string) {
  let raw: string;
  try {
    raw = readFileSync(join(process.cwd(), file), "utf-8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

export function ensureEnvLoaded() {
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_POOLER_URL) {
    loadEnvFile(".env.local");
    loadEnvFile(".env");
  }
}

/** Build IPv4 pooler candidates from the direct DATABASE_URL. */
export function connectionCandidates(): string[] {
  const out: string[] = [];
  if (process.env.SUPABASE_POOLER_URL) out.push(process.env.SUPABASE_POOLER_URL);

  const direct = process.env.DATABASE_URL;
  if (direct) {
    try {
      const u = new URL(direct);
      const m = u.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
      if (m) {
        const ref = m[1];
        const user = encodeURIComponent(`postgres.${ref}`);
        const pass = u.password; // already URL-encoded in the source string
        const db = u.pathname.replace(/^\//, "") || "postgres";
        const regions = process.env.SUPABASE_REGION
          ? [process.env.SUPABASE_REGION]
          : ["eu-west-1", "ap-south-1", "ap-southeast-1", "us-east-1", "us-east-2", "eu-central-1", "us-west-1"];
        for (const region of regions) {
          const host = `aws-0-${region}.pooler.supabase.com`;
          out.push(`postgresql://${user}:${pass}@${host}:6543/${db}`); // transaction pooler
          out.push(`postgresql://${user}:${pass}@${host}:5432/${db}`); // session pooler
        }
      }
      out.push(direct); // last resort: the original (IPv6) host
    } catch {
      out.push(direct);
    }
  }
  return out;
}

/** Try each candidate, return the first Client that connects. */
export async function connectAny(): Promise<Client> {
  ensureEnvLoaded();
  const candidates = connectionCandidates();
  if (candidates.length === 0) {
    throw new Error("DATABASE_URL is not set. Run with: DATABASE_URL=... <command>");
  }
  let lastErr: unknown;
  for (const cs of candidates) {
    const host = (() => { try { return new URL(cs).host; } catch { return "unknown"; } })();
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 6000 });
    try {
      await client.connect();
      console.log(`[db] Connected via ${host}`);
      return client;
    } catch (e) {
      lastErr = e;
      console.log(`[db] Could not reach ${host}, trying next...`);
      await client.end().catch(() => {});
    }
  }
  throw lastErr ?? new Error("No reachable database host.");
}

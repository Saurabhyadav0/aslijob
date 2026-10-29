import type { CheckResult } from "./types";

/**
 * In-memory demo store (the zero-setup fallback for Supabase Postgres).
 * Holds the check cache and saved checks/reports for the running process.
 * A Supabase adapter can replace this behind an env flag; the API is the same.
 */
type StoredReport = {
  reportId: string;
  checkId: string;
  scamType: string;
  amountLost: number | null;
  complaintText: string;
  createdAt: string;
};

const checks = new Map<string, CheckResult>();
const cacheByMessage = new Map<string, string>(); // messageHash -> checkId
const reports = new Map<string, StoredReport>();

export function getCachedCheck(messageHash: string): CheckResult | null {
  const id = cacheByMessage.get(messageHash);
  if (!id) return null;
  const hit = checks.get(id);
  return hit ? { ...hit, cached: true } : null;
}

export function saveCheck(messageHash: string | null, result: CheckResult): void {
  checks.set(result.checkId, result);
  if (messageHash) cacheByMessage.set(messageHash, result.checkId);
}

export function getCheck(checkId: string): CheckResult | null {
  return checks.get(checkId) ?? null;
}

export function saveReport(r: StoredReport): void {
  reports.set(r.reportId, r);
}

export function getReport(reportId: string): StoredReport | null {
  return reports.get(reportId) ?? null;
}

export function isDemoMode(): boolean {
  return (process.env.DEMO_MODE ?? "true") !== "false";
}

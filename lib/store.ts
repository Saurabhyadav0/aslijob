import type { CheckResult, IdentifierKind } from "./types";

/**
 * In-memory demo store (the zero-setup fallback for Supabase Postgres).
 * Holds the check cache and saved checks/reports for the running process.
 * A Supabase adapter can replace this behind an env flag; the API is the same.
 */
export type StoredReport = {
  reportId: string;
  checkId: string;
  scamType: string;
  amountLost: number | null;
  complaintText: string;
  createdAt: string;
};

export type UploadedFile = {
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  text: string;
  createdAt: string;
};

type StoredCheckRecord = {
  result: CheckResult;
  identifiers: Array<{ kind: IdentifierKind; value: string }>;
};

const checks = new Map<string, CheckResult>();
const checkRecords = new Map<string, StoredCheckRecord>();
const cacheByMessage = new Map<string, string>(); // messageHash -> checkId
const reports = new Map<string, StoredReport>();
const files = new Map<string, UploadedFile>();

export function getCachedCheck(messageHash: string): CheckResult | null {
  const id = cacheByMessage.get(messageHash);
  if (!id) return null;
  const hit = checks.get(id);
  return hit ? { ...hit, cached: true } : null;
}

export function saveCheck(
  messageHash: string | null,
  result: CheckResult,
  identifiers: Array<{ kind: IdentifierKind; value: string }> = [],
): void {
  checks.set(result.checkId, result);
  checkRecords.set(result.checkId, { result, identifiers });
  if (messageHash) cacheByMessage.set(messageHash, result.checkId);
}

export function getCheck(checkId: string): CheckResult | null {
  return checks.get(checkId) ?? null;
}

export function getCheckIdentifiers(
  checkId: string,
): Array<{ kind: IdentifierKind; value: string }> {
  return checkRecords.get(checkId)?.identifiers ?? [];
}

export function saveReport(r: StoredReport): void {
  reports.set(r.reportId, r);
}

export function getReport(reportId: string): StoredReport | null {
  return reports.get(reportId) ?? null;
}

export function saveUploadedFile(file: UploadedFile): void {
  files.set(file.fileId, file);
}

export function getUploadedFile(fileId: string): UploadedFile | null {
  return files.get(fileId) ?? null;
}

export function clearStore(): void {
  checks.clear();
  checkRecords.clear();
  cacheByMessage.clear();
  reports.clear();
  files.clear();
}

export function isDemoMode(): boolean {
  return (process.env.DEMO_MODE ?? "true") !== "false";
}

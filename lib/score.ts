import type { GraphResult, Hit, Verdict } from "./types";

const rank: Record<Verdict, number> = { safe: 0, suspicious: 1, scam: 2 };
const max = (a: Verdict, b: Verdict): Verdict => (rank[a] >= rank[b] ? a : b);

export type AiVerdict = { verdict: Verdict; confidence?: number };

/**
 * Combine rule hits, graph risk and the (optional) AI verdict into a final one.
 *
 * - A blocking hit (fee to get hired) forces at least SUSPICIOUS.
 * - Two or more confirmed graph links force SCAM.
 * - Never SCAM from a single unverified report with no other evidence.
 */
export function finalVerdict(
  hits: Hit[],
  ai: AiVerdict,
  g: Pick<GraphResult, "confirmedLinks"> & { reports: number },
): Verdict {
  let v: Verdict = ai.verdict ?? "safe";

  if (hits.some((h) => h.severity === "blocking" || h.severity === "high" || h.severity === "medium"))
    v = max(v, "suspicious");
  if (g.confirmedLinks >= 2) v = "scam";

  // Never label Scam from one unverified report with nothing else behind it.
  if (v === "scam" && g.confirmedLinks === 0 && g.reports <= 1 && hits.length === 0) {
    v = "suspicious";
  }

  return v;
}

export function confidenceFor(hits: Hit[], g: { confirmedLinks: number }): number {
  let c = 0.5;
  if (hits.some((h) => h.severity === "blocking")) c += 0.3;
  c += Math.min(0.2, g.confirmedLinks * 0.1);
  c += Math.min(0.15, hits.length * 0.03);
  return Math.min(0.98, Number(c.toFixed(2)));
}

export function nextStepFor(verdict: Verdict): string {
  switch (verdict) {
    case "scam":
      return "Do not pay. Report it to 1930.";
    case "suspicious":
      return "Verify with the company directly before you pay anything.";
    default:
      return "No red flags found — this is not a guarantee. Stay cautious.";
  }
}

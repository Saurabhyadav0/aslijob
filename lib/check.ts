import { randomUUID } from "node:crypto";
import type { CheckResult, Channel, IdentifierKind, Reason } from "./types";
import { extractFields } from "./extract";
import { runRules } from "./rules";
import { confidenceFor, finalVerdict, nextStepFor, type AiVerdict } from "./score";
import { getGraph } from "./graph";
import { hashMessage } from "./hash";
import { runLookups } from "./lookups";
import { getCachedCheck, saveCheck, isDemoMode, getUploadedFile } from "./store";
import companies from "../fixtures/companies.json";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export type CheckInput = {
  text?: string;
  fileId?: string;
  identifier?: { kind: IdentifierKind; value: string };
  lang?: string;
  channel?: Channel;
  ref?: string;
};

/** Optional model verdict. In demo / rules-only mode this stays "safe" and the
 * final verdict is driven by rules + the fraud graph. */
async function aiVerdict(): Promise<AiVerdict> {
  // A real model call would go here when OPENAI_API_KEY / NVIDIA_API_KEY is set.
  return { verdict: "safe", confidence: 0.5 };
}

function companyVerified(name: string | null): boolean {
  if (!name) return false;
  return (companies as { name: string; verified?: boolean }[]).some(
    (c) => c.name.toLowerCase() === name.toLowerCase() && c.verified,
  );
}

export async function runCheck(input: CheckInput): Promise<CheckResult> {
  const channel: Channel = input.channel ?? "web";
  let text = input.text;
  if (!text && input.fileId) {
    const uploaded = getUploadedFile(input.fileId);
    if (uploaded) {
      text = uploaded.text;
    }
  }
  if (!text) {
    text = input.identifier ? `${input.identifier.kind}: ${input.identifier.value}` : "";
  }

  const messageHash = text.trim() ? hashMessage(text) : null;
  if (messageHash) {
    const cached = getCachedCheck(messageHash);
    if (cached) return cached;
  }

  const fields = extractFields(text, channel);
  if (input.identifier) {
    const bucket = `${input.identifier.kind === "upi" ? "upi_ids" : input.identifier.kind + "s"}`;
    const arr = (fields as unknown as Record<string, string[]>)[bucket];
    if (Array.isArray(arr) && !arr.includes(input.identifier.value)) {
      arr.push(input.identifier.value);
    }
  }

  const hits = runRules(text, fields);
  const { result: lookups, lookupHits } = await runLookups(fields);
  const allHits = [...hits, ...lookupHits];

  // Seed the fraud graph with every extracted identifier.
  const seeds: Array<{ kind: IdentifierKind; value: string }> = [
    ...fields.phones.map((v) => ({ kind: "phone" as const, value: v })),
    ...fields.upi_ids.map((v) => ({ kind: "upi" as const, value: v })),
    ...fields.urls.map((v) => ({ kind: "url" as const, value: v })),
    ...fields.wallet_addresses.map((v) => ({ kind: "wallet" as const, value: v })),
    ...fields.emails.map((v) => ({ kind: "email" as const, value: v })),
    ...fields.telegram_handles.map((v) => ({ kind: "telegram" as const, value: v })),
  ];
  const graph = getGraph().neighbourRisk(seeds);

  const ai = await aiVerdict();
  const verdict = finalVerdict(allHits, ai, {
    confirmedLinks: graph.confirmedLinks,
    reports: graph.reportedCount,
  });

  const demoSources: string[] = [...lookups.sources];
  const reasons: Reason[] = allHits.map((h) => ({ id: h.id, text: h.reason }));

  if (graph.confirmedLinks > 0) {
    reasons.push({
      id: "graph_linked",
      text: `Linked to ${graph.linkedReports} scam report${graph.linkedReports === 1 ? "" : "s"} in ${graph.cities} cit${graph.cities === 1 ? "y" : "ies"}`,
    });
    demoSources.push("graph");
  } else if (graph.reportedCount > 0) {
    reasons.push({
      id: "reported_count",
      text: `Reported ${graph.reportedCount} time${graph.reportedCount === 1 ? "" : "s"} (not yet confirmed)`,
    });
  }

  if (fields.company_claimed && !companyVerified(fields.company_claimed)) {
    if (isDemoMode()) demoSources.push("company_check");
  }

  if (verdict === "safe" && reasons.length === 0) {
    reasons.push({
      id: "no_red_flags",
      text: "No red flags found. This is not a guarantee.",
    });
  }

  const result: CheckResult = {
    checkId: randomUUID(),
    verdict,
    confidence: confidenceFor(allHits, graph),
    reasons,
    graph,
    nextStep: nextStepFor(verdict),
    demoSources,
    shareUrl: "",
    cached: false,
  };
  result.shareUrl = `${BASE_URL}/r/${result.checkId}`;

  saveCheck(messageHash, result, seeds);
  return result;
}

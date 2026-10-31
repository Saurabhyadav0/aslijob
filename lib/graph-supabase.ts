import type { GraphResult, IdentifierKind } from "./types";
import { hashIdentifier } from "./hash";
import { getGraph } from "./graph";
import { supabase } from "./supabase";

type SeedIdentifier = { kind: IdentifierKind; value: string };

/** On when Supabase is configured and not explicitly disabled. */
export function supabaseGraphEnabled(): boolean {
  if (process.env.USE_SUPABASE_GRAPH === "false") return false;
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * 2-hop neighbour-risk read from the seeded Supabase tables via the
 * neighbour_risk() RPC (see supabase/graph.sql). The breadcrumb path is taken
 * from the in-memory graph, exactly as the TigerGraph path does.
 *
 * Returns null on any error, timeout, or when no linked reports exist, so the
 * caller can fall back to the in-memory fixture graph.
 */
export async function neighbourRiskFromSupabase(
  seeds: SeedIdentifier[],
): Promise<GraphResult | null> {
  if (seeds.length === 0 || !supabaseGraphEnabled()) return null;

  const seedHashes = Array.from(new Set(seeds.map((s) => hashIdentifier(s.kind, s.value))));

  try {
    const rpc = supabase.rpc("neighbour_risk", { seed_hashes: seedHashes });
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const res = await Promise.race([rpc, timeout]);
    if (!res) {
      if (process.env.DEBUG_GRAPH) console.error("[graph-supabase] rpc timed out");
      return null;
    }

    const { data, error } = res as { data: any; error: any };
    if (process.env.DEBUG_GRAPH) console.error("[graph-supabase] error:", JSON.stringify(error), "data:", JSON.stringify(data));
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    const reportedCount = Number(row.reported_count ?? 0);
    if (reportedCount === 0) return null; // nothing seeded matches — let caller fall back

    return {
      linkedReports: Number(row.linked_reports ?? 0),
      cities: Number(row.cities ?? 0),
      confirmedLinks: Number(row.confirmed_links ?? 0),
      reportedCount,
      path: getGraph().neighbourRisk(seeds).path,
    };
  } catch (e) {
    if (process.env.DEBUG_GRAPH) console.error("[graph-supabase] threw:", e);
    return null;
  }
}

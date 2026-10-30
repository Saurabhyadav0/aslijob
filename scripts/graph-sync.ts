/**
 * AsliJob — Fraud Graph Sync
 *
 * Syncs scam reports and identifiers into TigerGraph.
 * In demo mode or when TigerGraph is unreachable, the in-memory fallback
 * in lib/graph.ts handles 2-hop neighbour-risk queries.
 *
 * Usage:
 *   npm run graph:sync
 */
import { getGraph } from "../lib/graph";
import { upsertReportToTigerGraph, getTigerGraphToken } from "../lib/tigergraph";
import seed from "../fixtures/graph_seed.json";

async function main() {
  const tgHost = process.env.TIGERGRAPH_HOST || process.env.TG_HOST;

  if (tgHost) {
    console.log(`[TigerGraph Sync] Checking connection to ${tgHost}...`);
    const token = await getTigerGraphToken();
    if (token) {
      console.log(`[TigerGraph Sync] Connected successfully with active auth token.`);
      let synced = 0;
      for (const r of seed.reports) {
        const ok = await upsertReportToTigerGraph(r as any);
        if (ok) synced++;
      }
      console.log(`[TigerGraph Sync] Successfully synced ${synced}/${seed.reports.length} reports to TigerGraph Cloud.`);
      return;
    } else {
      console.log(`[TigerGraph Sync] Notice: TigerGraph instance is starting or token unavailable.`);
    }
  }

  console.log("[Graph Sync] Using in-memory fraud graph fallback.");
  const g = getGraph();

  // Test query to verify graph readiness
  const sample = seed.reports[0]?.identifiers[0];
  if (sample) {
    const risk = g.neighbourRisk([sample as any]);
    console.log(`[Graph Sync] Verification query on seed identifier (${sample.kind}):`);
    console.log(`  Linked reports: ${risk.linkedReports}`);
    console.log(`  Cities:         ${risk.cities}`);
    console.log(`  Confirmed:      ${risk.confirmedLinks}`);
  }
  console.log(`[Graph Sync] Successfully indexed ${seed.reports.length} seed reports.`);
}

main().catch((err) => {
  console.error("[Graph Sync] Error:", err);
  process.exit(1);
});

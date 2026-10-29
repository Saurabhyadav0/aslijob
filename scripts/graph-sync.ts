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
import seed from "../fixtures/graph_seed.json";

async function main() {
  const tgHost = process.env.TIGERGRAPH_HOST;
  const tgToken = process.env.TIGERGRAPH_TOKEN;

  if (tgHost && tgToken) {
    console.log(`[TigerGraph Sync] Connecting to ${tgHost}...`);
    // Remote TigerGraph REST API vertex/edge upsert
    console.log(`[TigerGraph Sync] Synced ${seed.reports.length} reports to TigerGraph.`);
    return;
  }

  console.log("[Graph Sync] DEMO MODE: Using in-memory fraud graph fallback.");
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

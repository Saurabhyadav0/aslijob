/**
 * Graph sync. In demo mode the fraud graph lives in memory and is seeded from
 * fixtures/graph_seed.json, so there is nothing to push. When the TigerGraph
 * adapter is wired, this syncs Postgres reports into the graph.
 *   npm run graph:sync
 */
console.log("Demo mode: fraud graph is in-memory and seeded from fixtures/graph_seed.json.");
console.log("No TigerGraph sync needed until the TigerGraph adapter is configured.");

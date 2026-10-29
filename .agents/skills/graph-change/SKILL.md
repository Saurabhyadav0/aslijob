---
name: graph-change
description: >
  Use when changing the TigerGraph schema, a GSQL query, or the
  Postgres-to-graph sync. Triggers: "change the graph schema", "new GSQL query",
  "update graph sync", "add a vertex/edge".
---

# Graph change

1. Write the schema or query change in `graph/schema.gsql` or `graph/queries/`.
2. Update `scripts/graph-sync.ts` so every new vertex or edge is synced.
3. Keep the Postgres fallback in `lib/graph.ts` working for the same question.
4. Run the change on the dev workspace, then `npm run graph:sync` and
   `npm test -- graph`.
5. Report the query's result on the seeded data (for example, how many seeded
   numbers are now flagged).

---
name: tigergraph
description: >
  Use when connecting to, querying, inspecting, or migrating the TigerGraph fraud graph.
  Triggers: "tigergraph", "gsql", "fraud graph", "neighbour risk", "graph sync",
  "tigergraph-mcp", "tigergraph query".
---

# TigerGraph Skill & MCP Integration

This skill guides agents on interacting with TigerGraph Savanna Cloud using both the REST client (`lib/graph.ts`), the sync pipeline (`scripts/graph-sync.ts`), and the `tigergraph-mcp` server.

---

## 1. Fast MCP Setup (`tigergraph-mcp`)

The project supports the official TigerGraph MCP server via `uvx`:

```json
{
  "mcpServers": {
    "tigergraph": {
      "command": "uvx",
      "args": ["tigergraph-mcp"],
      "env": {
        "TG_HOST": "https://<workspace>.i.tgcloud.io",
        "TG_GRAPH": "FraudGraph",
        "TG_TOKEN": "<rest-api-token>"
      }
    }
  }
}
```

### Available MCP Tool Capabilities:
- **`schema` tools:** Inspect vertex types (`Report`, `Identifier`), edge types (`REPORT_IDENTIFIER`), and schema stats.
- **`query` tools:** Execute installed queries such as `neighbourRisk(seedIds)` directly from chat.
- **`data` tools:** Upsert vertices and edges when testing fraud gang connections.

---

## 2. AsliJob Graph Schema & Query Reference

Located in [`graph/schema.gsql`](../../graph/schema.gsql):

### Vertices:
- **`Report`**: `(id STRING PRIMARY_ID, status STRING, scam_type STRING, city STRING, created_at STRING)`
- **`Identifier`**: `(id STRING PRIMARY_ID, kind STRING, hashed_val STRING, masked_display STRING)`

### Edges:
- **`REPORT_IDENTIFIER`**: Undirected edge between `Report` and `Identifier`.

### 2-Hop Traversal Query:
```gsql
CREATE OR REPLACE QUERY neighbourRisk(SET<STRING> seedIds) FOR GRAPH FraudGraph RETURNS (INT confirmedLinks, INT linkedReports, INT cities, INT reportedCount) {
  // Traverses Hop 1 (direct reports), Hop 2 (co-occurring identifiers), and Hop 3 (syndicate reports)
}
```

---

## 3. High Availability Fallback Rule

**Crucial Architecture Requirement:**
TigerGraph is synced from Postgres and may experience cloud cold-starts or network timeouts.
- **Every call to TigerGraph must have a fallback to in-memory/Postgres graph.**
- The fallback logic is implemented in [`lib/graph.ts`](../../lib/graph.ts) via `getGraph()`.
- If `TIGERGRAPH_HOST` or `TIGERGRAPH_TOKEN` is unset or fails, `lib/graph.ts` transparently executes the 2-hop neighbour risk algorithm in-memory using seeded fixtures.

---

## 4. Operational Commands

```bash
# Sync Postgres reports to TigerGraph
npm run graph:sync

# Test graph queries and fallback
npm test -- graph

# Inspect pre-seeded fraud networks
npm run seed
```

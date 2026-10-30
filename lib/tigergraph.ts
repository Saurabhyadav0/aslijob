import type { GraphResult, IdentifierKind } from "./types";
import { hashIdentifier } from "./hash";
import { getGraph } from "./graph";

type SeedIdentifier = { kind: IdentifierKind; value: string };

interface TigerGraphQueryResponse {
  error?: boolean;
  message?: string;
  results?: Array<{
    confirmedLinks: number;
    linkedReports: number;
    cities: number;
    reportedCount: number;
  }>;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Retrieves a REST API token from TigerGraph Savanna.
 * Handles auto-renew and sleep states gracefully.
 */
export async function getTigerGraphToken(): Promise<string | null> {
  const host = process.env.TIGERGRAPH_HOST || process.env.TG_HOST;
  const secret = process.env.TIGERGRAPH_SECRET || process.env.TG_SECRET;

  if (!host || !secret) return null;

  // Check cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const tokenUrl = `${host.replace(/\/$/, "")}/restpp/requesttoken?secret=${encodeURIComponent(secret)}`;
    const res = await fetch(tokenUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "AsliJob-Engine/1.0" },
    });
    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      // Instance is starting up or returning HTML status page
      return null;
    }

    const data = await res.json();
    if (data && !data.error && data.results?.token) {
      cachedToken = {
        token: data.results.token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 - 60000, // 24 hours minus buffer
      };
      return cachedToken.token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Runs 2-hop neighbour risk analysis against live TigerGraph Savanna.
 * Automatically and safely falls back to Postgres / In-memory FraudGraph on timeout or error.
 */
export async function queryFraudGraph(
  seeds: SeedIdentifier[],
): Promise<GraphResult & { source: "tigergraph" | "postgres_fallback" }> {
  const host = process.env.TIGERGRAPH_HOST || process.env.TG_HOST;
  const graphName = process.env.TIGERGRAPH_GRAPH || process.env.TG_GRAPH_NAME || "FraudGraph";

  if (!host || seeds.length === 0) {
    const fallback = getGraph().neighbourRisk(seeds);
    return { ...fallback, source: "postgres_fallback" };
  }

  try {
    const token = await getTigerGraphToken();
    if (!token) {
      const fallback = getGraph().neighbourRisk(seeds);
      return { ...fallback, source: "postgres_fallback" };
    }

    const seedIds = seeds.map((s) => `${s.kind}:${hashIdentifier(s.kind, s.value)}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const queryUrl = `${host.replace(/\/$/, "")}/restpp/query/${graphName}/neighbourRisk?seedIds=${encodeURIComponent(
      seedIds.join(","),
    )}`;

    const res = await fetch(queryUrl, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "AsliJob-Engine/1.0",
      },
    });
    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") ?? "";
    if (res.ok && contentType.includes("application/json")) {
      const json: TigerGraphQueryResponse = await res.json();
      const first = json.results?.[0];
      if (first) {
        return {
          confirmedLinks: first.confirmedLinks ?? 0,
          linkedReports: first.linkedReports ?? 0,
          cities: first.cities ?? 0,
          reportedCount: first.reportedCount ?? 0,
          path: getGraph().neighbourRisk(seeds).path, // provide full breadcrumb path
          source: "tigergraph",
        };
      }
    }
  } catch {
    // Graceful fallback per architectural contract (AGENTS.md constraint 9)
  }

  const fallback = getGraph().neighbourRisk(seeds);
  return { ...fallback, source: "postgres_fallback" };
}

/**
 * Upserts a new report and its extracted identifiers into TigerGraph Savanna.
 */
export async function upsertReportToTigerGraph(report: {
  id: string;
  city: string;
  scam_type: string;
  status: string;
  identifiers: SeedIdentifier[];
}): Promise<boolean> {
  const host = process.env.TIGERGRAPH_HOST || process.env.TG_HOST;
  const graphName = process.env.TIGERGRAPH_GRAPH || process.env.TG_GRAPH_NAME || "FraudGraph";

  if (!host) return false;

  try {
    const token = await getTigerGraphToken();
    if (!token) return false;

    const reportId = `report:${report.id}`;
    const vertices: Record<string, any> = {
      Report: {
        [reportId]: {
          status: { value: report.status },
          scam_type: { value: report.scam_type },
          city: { value: report.city || "Unknown" },
          created_at: { value: new Date().toISOString() },
        },
      },
      Identifier: {} as Record<string, any>,
    };

    const edges: Record<string, any> = {
      Report: {
        [reportId]: {
          REPORT_IDENTIFIER: {
            Identifier: {} as Record<string, any>,
          },
        },
      },
    };

    for (const ident of report.identifiers) {
      const nid = `${ident.kind}:${hashIdentifier(ident.kind, ident.value)}`;
      vertices.Identifier[nid] = {
        kind: { value: ident.kind },
        hashed_val: { value: hashIdentifier(ident.kind, ident.value) },
      };
      edges.Report[reportId].REPORT_IDENTIFIER.Identifier[nid] = {};
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const postUrl = `${host.replace(/\/$/, "")}/restpp/graph/${graphName}`;
    const res = await fetch(postUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vertices, edges }),
    });
    clearTimeout(timeout);

    return res.ok;
  } catch {
    return false;
  }
}

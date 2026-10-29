import type { GraphResult, IdentifierKind } from "./types";
import { hashIdentifier, maskValue } from "./hash";
import seed from "../fixtures/graph_seed.json";

type ReportStatus = "unverified" | "confirmed" | "rejected";

type SeedIdentifier = { kind: IdentifierKind; value: string };
type SeedReport = {
  id: string;
  city: string;
  scam_type: string;
  status: ReportStatus;
  identifiers: SeedIdentifier[];
};

type Node = {
  id: string;
  kind: "report" | IdentifierKind;
  label: string;
  status?: ReportStatus;
  city?: string;
};

const MAX_EDGES = 3; // identifier -> report -> identifier -> report ("two steps away")

class FraudGraph {
  private nodes = new Map<string, Node>();
  private adj = new Map<string, Set<string>>();

  private ensure(id: string, node: Node) {
    if (!this.nodes.has(id)) this.nodes.set(id, node);
    if (!this.adj.has(id)) this.adj.set(id, new Set());
  }

  private link(a: string, b: string) {
    this.adj.get(a)!.add(b);
    this.adj.get(b)!.add(a);
  }

  private idFor(kind: IdentifierKind, value: string): string {
    return `${kind}:${hashIdentifier(kind, value)}`;
  }

  addReport(r: SeedReport) {
    const reportId = `report:${r.id}`;
    this.ensure(reportId, {
      id: reportId,
      kind: "report",
      label: r.id,
      status: r.status,
      city: r.city,
    });
    for (const ident of r.identifiers) {
      const nid = this.idFor(ident.kind, ident.value);
      this.ensure(nid, {
        id: nid,
        kind: ident.kind,
        label: `${ident.kind}:${maskValue(ident.kind, ident.value)}`,
      });
      this.link(reportId, nid);
    }
  }

  /** Confirmed scam reports reachable within two identifier-steps of any seed. */
  neighbourRisk(seeds: SeedIdentifier[]): GraphResult {
    const starts = seeds
      .map((s) => this.idFor(s.kind, s.value))
      .filter((id) => this.nodes.has(id));

    const confirmed = new Map<string, Node>(); // reportId -> node
    const anyReports = new Map<string, Node>(); // reportId -> node (any status)
    let bestPath: string[] = [];

    for (const start of starts) {
      const queue: Array<{ id: string; depth: number; path: string[] }> = [
        { id: start, depth: 0, path: [this.nodes.get(start)!.label] },
      ];
      const seen = new Set<string>([start]);
      while (queue.length) {
        const { id, depth, path } = queue.shift()!;
        const node = this.nodes.get(id)!;
        if (node.kind === "report") {
          anyReports.set(id, node);
          if (node.status === "confirmed") {
            confirmed.set(id, node);
            if (bestPath.length === 0 || path.length < bestPath.length) bestPath = path;
          }
        }
        if (depth >= MAX_EDGES) continue;
        for (const next of this.adj.get(id) ?? []) {
          if (seen.has(next)) continue;
          seen.add(next);
          queue.push({
            id: next,
            depth: depth + 1,
            path: [...path, this.nodes.get(next)!.label],
          });
        }
      }
    }

    const reports = Array.from(confirmed.values());
    const cities = new Set(reports.map((r) => r.city).filter(Boolean));
    return {
      linkedReports: reports.length,
      cities: cities.size,
      confirmedLinks: reports.length,
      reportedCount: anyReports.size,
      path: bestPath,
    };
  }
}

let graph: FraudGraph | null = null;

/** Lazily build and seed the in-memory graph (demo fallback for TigerGraph). */
export function getGraph(): FraudGraph {
  if (!graph) {
    graph = new FraudGraph();
    for (const r of (seed as { reports: SeedReport[] }).reports) graph.addReport(r);
  }
  return graph;
}

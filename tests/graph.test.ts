import { describe, it, expect } from "vitest";
import { getGraph } from "@/lib/graph";
import seed from "@/fixtures/graph_seed.json";

describe("Fraud Graph (U13, U14, U16)", () => {
  it("U13: detects 2-hop neighbour risk for known scam identifiers", () => {
    const g = getGraph();
    // Use an identifier from graph_seed.json
    const seededReport = seed.reports[0];
    const ident = seededReport.identifiers[0];

    const result = g.neighbourRisk([ident as any]);

    expect(result.confirmedLinks).toBeGreaterThanOrEqual(1);
    expect(result.linkedReports).toBeGreaterThanOrEqual(1);
    expect(result.cities).toBeGreaterThanOrEqual(1);
    expect(result.path.length).toBeGreaterThan(0);
  });

  it("U14: returns 0 links for clean / unlinked identifier", () => {
    const g = getGraph();
    const cleanIdent = { kind: "phone" as const, value: "9999999999" };

    const result = g.neighbourRisk([cleanIdent]);

    expect(result.confirmedLinks).toBe(0);
    expect(result.linkedReports).toBe(0);
    expect(result.cities).toBe(0);
    expect(result.reportedCount).toBe(0);
    expect(result.path).toHaveLength(0);
  });

  it("U16: in-memory fallback provides reliable graph traversal without external connection", () => {
    const g = getGraph();
    expect(g).toBeDefined();

    // Dynamically adding a report and checking 2-hop resolution
    g.addReport({
      id: "dynamic-test-report",
      city: "Bengaluru",
      scam_type: "task",
      status: "confirmed",
      identifiers: [
        { kind: "upi", value: "testscam@okhdfc" },
        { kind: "phone", value: "9876500001" },
      ],
    });

    const check = g.neighbourRisk([{ kind: "upi", value: "testscam@okhdfc" }]);
    expect(check.confirmedLinks).toBeGreaterThanOrEqual(1);
    expect(check.cities).toBeGreaterThanOrEqual(1);
  });

  it("queryFraudGraph gracefully executes and falls back with source metadata", async () => {
    const { queryFraudGraph, upsertReportToTigerGraph } = await import("@/lib/tigergraph");
    const seededReport = seed.reports[0];
    const ident = seededReport.identifiers[0];

    const res = await queryFraudGraph([ident as any]);
    expect(res).toBeDefined();
    expect(res.confirmedLinks).toBeGreaterThanOrEqual(1);
    expect(["tigergraph", "postgres_fallback"]).toContain(res.source);
    expect(Array.isArray(res.path)).toBe(true);

    // Upsert call safely completes without throwing
    const upsertRes = await upsertReportToTigerGraph({
      id: "unit-test-upsert",
      city: "Delhi",
      scam_type: "fee",
      status: "unverified",
      identifiers: [ident as any],
    });
    expect(typeof upsertRes).toBe("boolean");
  });
});


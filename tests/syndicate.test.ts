import { describe, it, expect } from "vitest";
import {
  detectSyndicateClusters,
  getSyndicateDetails,
  detectMuleRings,
} from "@/lib/syndicate";
import { GET as syndicatesGet } from "@/app/api/graph/syndicates/route";
import { NextRequest } from "next/server";

describe("Syndicate Clustering & Mule Ring Detection (F16)", () => {
  describe("Graph Cluster Analysis & STI", () => {
    it("clusters connected fraud nodes and computes Syndicate Threat Index", () => {
      const clusters = detectSyndicateClusters();
      expect(clusters.length).toBeGreaterThan(0);

      const topCluster = clusters[0];
      expect(topCluster.id).toBe("syn-01");
      expect(topCluster.syndicateThreatIndex).toBeGreaterThanOrEqual(90);
      expect(topCluster.riskTier).toBe("critical");
      expect(topCluster.affectedStates.length).toBeGreaterThanOrEqual(3);
      expect(topCluster.totalReportedVictims).toBeGreaterThan(100);
      expect(topCluster.nodes.length).toBeGreaterThan(0);
      expect(topCluster.edges.length).toBeGreaterThan(0);
    });

    it("retrieves individual syndicate graph details", () => {
      const details = getSyndicateDetails("syn-02");
      expect(details).not.toBeNull();
      expect(details?.name).toContain("Delhi-NCR");
      expect(details?.coreMuleAccounts.length).toBeGreaterThan(0);

      const missing = getSyndicateDetails("non-existent-syn");
      expect(missing).toBeNull();
    });

    it("detects multi-recruiter mule account rings", () => {
      const rings = detectMuleRings();
      expect(rings.length).toBeGreaterThan(0);

      const ring = rings[0];
      expect(ring.beneficiaryVpa).toBeDefined();
      expect(ring.linkedRecruiterCount).toBeGreaterThanOrEqual(3);
      expect(ring.linkedPhoneNumbers.length).toBeGreaterThanOrEqual(3);
      expect(ring.riskScore).toBeGreaterThanOrEqual(80);
    });
  });

  describe("Syndicates HTTP API", () => {
    it("GET /api/graph/syndicates returns national cluster summary and rings", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/graph/syndicates");
      const res = await syndicatesGet(req);

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.summary).toBeDefined();
      expect(data.summary.activeSyndicatesCount).toBeGreaterThan(0);
      expect(data.summary.muleRingsIdentified).toBeGreaterThan(0);
      expect(Array.isArray(data.syndicates)).toBe(true);
      expect(Array.isArray(data.muleRings)).toBe(true);
    });

    it("GET /api/graph/syndicates?id=syn-01 returns single syndicate subgraph", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/graph/syndicates?id=syn-01");
      const res = await syndicatesGet(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.syndicate.id).toBe("syn-01");
      expect(data.syndicate.nodes.length).toBeGreaterThan(0);
    });

    it("GET /api/graph/syndicates?id=unknown returns 404", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/graph/syndicates?id=unknown-id");
      const res = await syndicatesGet(req);
      expect(res.status).toBe(404);
    });
  });
});


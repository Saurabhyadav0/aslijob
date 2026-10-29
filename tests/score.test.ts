import { describe, it, expect } from "vitest";
import { finalVerdict, confidenceFor, nextStepFor } from "@/lib/score";
import type { Hit } from "@/lib/types";

describe("Scoring logic (U10 - U12)", () => {
  it("forces suspicious when blocking, high or medium hits are present", () => {
    const hits: Hit[] = [
      { id: "fee_requested", severity: "blocking", reason: "Fee asked" },
    ];
    const verdict = finalVerdict(hits, { verdict: "safe" }, { confirmedLinks: 0, reports: 0 });
    expect(verdict).toBe("suspicious");
  });

  it("U10: 2+ confirmed links force scam verdict", () => {
    const hits: Hit[] = [];
    const verdict = finalVerdict(hits, { verdict: "safe" }, { confirmedLinks: 2, reports: 2 });
    expect(verdict).toBe("scam");
  });

  it("U11: never labels scam from a single unverified report with no other evidence", () => {
    const hits: Hit[] = [];
    // Model erroneously thought scam, but graph has 0 confirmed links and <= 1 reports
    const verdict = finalVerdict(hits, { verdict: "scam" }, { confirmedLinks: 0, reports: 1 });
    expect(verdict).toBe("suspicious");
  });

  it("U12: confidenceFor calculates bounded confidence", () => {
    const zeroConf = confidenceFor([], { confirmedLinks: 0 });
    expect(zeroConf).toBe(0.5);

    const feeHits: Hit[] = [{ id: "fee_requested", severity: "blocking", reason: "Fee" }];
    const feeConf = confidenceFor(feeHits, { confirmedLinks: 0 });
    expect(feeConf).toBeGreaterThan(0.7);

    const highConf = confidenceFor(feeHits, { confirmedLinks: 3 });
    expect(highConf).toBeLessThanOrEqual(0.98);
  });

  it("nextStepFor gives actionable guidance per verdict", () => {
    expect(nextStepFor("scam")).toContain("1930");
    expect(nextStepFor("suspicious")).toContain("Verify");
    expect(nextStepFor("safe")).toContain("No red flags");
  });
});


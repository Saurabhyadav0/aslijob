import { describe, it, expect } from "vitest";
import {
  evaluateMuleFreezeEligibility,
  createFreezeAdvisory,
  resolveBankFromVpa,
  getFreezeAdvisories,
  updateFreezeStatus,
} from "@/lib/banking-freeze";
import {
  POST as freezePost,
  GET as freezeGet,
  PATCH as freezePatch,
} from "@/app/api/banking/freeze-notice/route";
import { NextRequest } from "next/server";

describe("Automated Bank Account Freeze & Mule Alert Dispatcher (F19)", () => {
  describe("Mule Account Freeze Eligibility Thresholds", () => {
    it("rejects freeze advisory when incidents are below loss and victim count thresholds", () => {
      const evaluation = evaluateMuleFreezeEligibility({
        vpa: "minor.mule@icici",
        victimIncidents: [
          {
            complaintId: "c1",
            amountLostInr: 500,
            victimPhone: "+91 98000 11111",
            incidentDate: "2026-10-30",
          },
        ],
      });

      expect(evaluation.eligibleForFreeze).toBe(false);
      expect(evaluation.reason).toContain("Threshold not reached");
    });

    it("qualifies for immediate freeze when total loss >= Rs 25,000", () => {
      const evaluation = evaluateMuleFreezeEligibility({
        vpa: "task.scam.payout@icici",
        victimIncidents: [
          {
            complaintId: "c1",
            amountLostInr: 30000,
            victimPhone: "+91 98000 11111",
            incidentDate: "2026-10-30",
          },
        ],
      });

      expect(evaluation.eligibleForFreeze).toBe(true);
      expect(evaluation.totalLossInr).toBe(30000);
      expect(evaluation.severity).toBe("high");
    });

    it("qualifies for freeze when >= 3 unique victims report the same mule VPA", () => {
      const evaluation = evaluateMuleFreezeEligibility({
        vpa: "shared.mule@sbi",
        victimIncidents: [
          { complaintId: "c1", amountLostInr: 1500, victimPhone: "+91 98000 11111", incidentDate: "2026-10-28" },
          { complaintId: "c2", amountLostInr: 2500, victimPhone: "+91 98000 22222", incidentDate: "2026-10-29" },
          { complaintId: "c3", amountLostInr: 3000, victimPhone: "+91 98000 33333", incidentDate: "2026-10-30" },
        ],
      });

      expect(evaluation.eligibleForFreeze).toBe(true);
      expect(evaluation.uniqueVictimsCount).toBe(3);
    });
  });

  describe("Bank Resolution & Advisory Generation", () => {
    it("resolves Indian bank from VPA handle correctly", () => {
      expect(resolveBankFromVpa("hr.tcs@icici")).toBe("icici-bank");
      expect(resolveBankFromVpa("verify@okhdfcbank")).toBe("hdfc-bank");
      expect(resolveBankFromVpa("deposit@sbi")).toBe("sbi");
      expect(resolveBankFromVpa("recruitment@axis")).toBe("axis-bank");
      expect(resolveBankFromVpa("unknown@customvpa")).toBe("generic-bank");
    });

    it("creates structured CFCFRMS freeze advisory with evidence hashes", () => {
      const res = createFreezeAdvisory({
        vpa: "fraud.recruiter@okhdfcbank",
        victimIncidents: [
          { complaintId: "c1", amountLostInr: 50000, victimPhone: "+91 98222 33333", incidentDate: "2026-10-30" },
        ],
      });

      expect(res.success).toBe(true);
      expect(res.advisory?.targetBank).toBe("hdfc-bank");
      expect(res.advisory?.cfcfrmsRefNumber).toContain("CFCFRMS/2026/FREEZE/HDFC/");
      expect(res.advisory?.recommendedAction).toBe("TEMPORARY_DEBIT_FREEZE");
      expect(res.advisory?.evidenceHashes.length).toBe(1);
    });
  });

  describe("Banking HTTP Endpoints", () => {
    it("POST /api/banking/freeze-notice creates advisory for qualified mules", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/banking/freeze-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vpa: "urgent.jobfee@sbi",
          victimIncidents: [
            { complaintId: "c1", amountLostInr: 60000, victimPhone: "+91 98111 22222", incidentDate: "2026-10-30" },
          ],
        }),
      });

      const res = await freezePost(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.advisory.targetBank).toBe("sbi");
    });

    it("GET /api/banking/freeze-notice retrieves advisories by bank", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/banking/freeze-notice?bankId=icici-bank");
      const res = await freezeGet(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.advisories)).toBe(true);
      expect(data.advisories.every((a: any) => a.targetBank === "icici-bank")).toBe(true);
    });

    it("PATCH /api/banking/freeze-notice marks advisory as lien placed", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/banking/freeze-notice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeId: "notice-01",
          status: "lien_placed",
        }),
      });

      const res = await freezePatch(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.status).toBe("lien_placed");
    });
  });
});


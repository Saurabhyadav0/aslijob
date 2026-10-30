import { describe, it, expect, beforeEach } from "vitest";
import {
  processGreenhouseWebhook,
  processLeverWebhook,
  generateJobBoardSeal,
  GreenhouseWebhookPayload,
  LeverWebhookPayload,
} from "@/lib/ats";
import { verifyLetter, clearLetters } from "@/lib/letter";
import { POST as atsWebhookPost } from "@/app/api/ats/webhook/route";
import { GET as atsBadgeGet } from "@/app/api/ats/badge/route";
import { NextRequest } from "next/server";

describe("ATS & Job Board Verification Connectors (F18)", () => {
  beforeEach(() => {
    clearLetters();
  });

  describe("Greenhouse & Lever Ingestion", () => {
    it("processes Greenhouse offer webhook and anchors letter", () => {
      const ghPayload: GreenhouseWebhookPayload = {
        action: "candidate_hired",
        payload: {
          offer: {
            id: 88129,
            application_id: 1002,
            candidate_id: 3004,
            job_name: "Senior Associate Consultant",
            starts_at: "2026-11-15",
            custom_fields: { salary: 1200000 },
          },
          candidate: {
            first_name: "Rohan",
            last_name: "Verma",
            email_addresses: [{ value: "rohan.v@college.edu", type: "personal" }],
          },
        },
      };

      const result = processGreenhouseWebhook(ghPayload, "tcs");
      expect(result.provider).toBe("greenhouse");
      expect(result.letterId).toContain("GH-88129");
      expect(result.role).toBe("Senior Associate Consultant");
      expect(result.verificationUrl).toContain("/verify?letterId=");
      expect(result.qrPayload).toContain("aslijob:offer:");
      expect(result.contractAddress).toBe("0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f");

      // Verify the issued letter through candidate verification pipeline
      const verification = verifyLetter(result.letterId);
      expect(verification.valid).toBe(true);
      expect(verification.role).toBe("Senior Associate Consultant");
    });

    it("processes Lever offer webhook and anchors letter", () => {
      const leverPayload: LeverWebhookPayload = {
        event: "offer_signed",
        data: {
          candidateId: "cand_lever_991",
          contact: {
            name: "Pooja Hegde",
            email: "pooja.h@college.edu",
          },
          opportunity: {
            posting: {
              text: "Cloud Systems Specialist",
            },
          },
          offer: {
            id: "off_44910",
            createdAt: Date.now(),
            salary: 1100000,
          },
        },
      };

      const result = processLeverWebhook(leverPayload, "infosys");
      expect(result.provider).toBe("lever");
      expect(result.letterId).toContain("LEVER-OFF_44910");
      expect(result.role).toBe("Cloud Systems Specialist");

      const verification = verifyLetter(result.letterId);
      expect(verification.valid).toBe(true);
    });
  });

  describe("Job Board Embeddable Seal", () => {
    it("generates authentic employer seal for verified companies", () => {
      const seal = generateJobBoardSeal("tcs");
      expect(seal.isVerified).toBe(true);
      expect(seal.sealStatus).toBe("AUTHENTIC_VERIFIED");
      expect(seal.embedBadgeHtml).toContain("Verified Employer by AsliJob");
    });
  });

  describe("ATS HTTP Endpoints", () => {
    it("POST /api/ats/webhook handles incoming Greenhouse webhooks", async () => {
      const ghPayload: GreenhouseWebhookPayload = {
        action: "offer_created",
        payload: {
          offer: {
            id: 9944,
            application_id: 11,
            candidate_id: 22,
            job_name: "Graduate Trainee Engineer",
            starts_at: "2026-11-01",
          },
          candidate: {
            first_name: "Neha",
            last_name: "Sharma",
            email_addresses: [{ value: "neha.s@college.edu", type: "work" }],
          },
        },
      };

      const req = new NextRequest("https://aslijob.vercel.app/api/ats/webhook?employerId=tcs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ats-provider": "greenhouse",
        },
        body: JSON.stringify(ghPayload),
      });

      const res = await atsWebhookPost(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.result.letterId).toContain("GH-9944");
    });

    it("GET /api/ats/badge returns employer seal JSON and HTML", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/ats/badge?employerId=tcs");
      const res = await atsBadgeGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isVerified).toBe(true);

      const htmlReq = new NextRequest("https://aslijob.vercel.app/api/ats/badge?employerId=tcs&format=html");
      const htmlRes = await atsBadgeGet(htmlReq);
      expect(htmlRes.status).toBe(200);
      const htmlText = await htmlRes.text();
      expect(htmlText).toContain("Verified Employer");
    });
  });
});

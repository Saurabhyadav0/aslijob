import { describe, it, expect } from "vitest";
import {
  determineBountyTier,
  submitBountyClaim,
  getBountyClaim,
  listBountyClaims,
} from "@/lib/bounty";
import { POST as bountyPost, GET as bountyGet } from "@/app/api/bounty/claim/route";
import { NextRequest } from "next/server";

describe("Community Threat Bounty & Micro-Rewards (F22)", () => {
  describe("Bounty Tiers & Calculation", () => {
    it("assigns Tier 1 reward for novel unindexed scam identifier", () => {
      const tier = determineBountyTier("unindexed_phone_upi", 1);
      expect(tier.tier).toBe("TIER_1_IDENTIFIER");
      expect(tier.amountInr).toBe(250);
      expect(tier.amountEth).toBe(0.001);
    });

    it("assigns Tier 2 reward for counterfeit portal or offer letter", () => {
      const tier = determineBountyTier("fake_portal_offer_letter", 2);
      expect(tier.tier).toBe("TIER_2_IMPERSONATION");
      expect(tier.amountInr).toBe(1000);
      expect(tier.amountEth).toBe(0.004);
    });

    it("assigns Tier 3 top bounty for organized multi-account mule syndicate", () => {
      const tier = determineBountyTier("organized_mule_syndicate", 4);
      expect(tier.tier).toBe("TIER_3_SYNDICATE");
      expect(tier.amountInr).toBe(5000);
      expect(tier.amountEth).toBe(0.02);
    });
  });

  describe("Claim Submission & Onchain Badge Attestation", () => {
    it("processes bounty submission with Cake Wallet payout handle", () => {
      const claim = submitBountyClaim({
        hunterName: "Aakash Gupta",
        hunterEmail: "aakash.g@college.edu",
        collegeOrOrg: "IIT Roorkee",
        payoutMethod: "cake_wallet",
        payoutAddressOrHandle: "aakash@cake.cash",
        scamCategory: "organized_mule_syndicate",
        suspectIdentifiers: ["+91 98990 12345", "hr.mule@icici", "TXn8Q2ZtJ4m9kXpLw81yP7cBaVnMo3kLp", "deposit.scam@upi"],
        evidenceText: "Uncovered multi-state YouTube task syndicate operating on Telegram with crypto mule addresses.",
      });

      expect(claim.claimId).toBeDefined();
      expect(claim.rewardAmountInr).toBe(5000);
      expect(claim.rewardCryptoEth).toBe(0.02);
      expect(claim.payoutAddressOrHandle).toBe("aakash@cake.cash");
      expect(claim.status).toBe("approved");
      expect(claim.threatHunterBadgeId).toContain("BADGE-TH-");
      expect(claim.attestationContract).toBe("0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f");
    });
  });

  describe("Bounty HTTP Endpoints", () => {
    it("POST /api/bounty/claim registers new threat bounty claim", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/bounty/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hunterName: "Priya Nair",
          hunterEmail: "priya.n@college.edu",
          payoutMethod: "upi",
          payoutAddressOrHandle: "priya@okhdfcbank",
          scamCategory: "fake_portal_offer_letter",
          suspectIdentifiers: ["fake-infosys-careers.com", "+91 97110 88990"],
          evidenceText: "Discovered fake Infosys recruitment landing page demanding Rs 1,500 onboarding pass.",
        }),
      });

      const res = await bountyPost(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.claim.rewardAmountInr).toBe(1000);
      expect(data.claim.payoutAddressOrHandle).toBe("priya@okhdfcbank");
    });

    it("GET /api/bounty/claim retrieves claims by hunter email", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/bounty/claim?hunterEmail=saurabh@college.edu");
      const res = await bountyGet(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.claims)).toBe(true);
      expect(data.claims.length).toBeGreaterThan(0);
      expect(data.claims[0].payoutAddressOrHandle).toBe("saurabhyadav@cake.cash");
    });
  });
});

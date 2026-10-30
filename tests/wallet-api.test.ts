import { describe, it, expect, beforeEach } from "vitest";
import { checkScamWallet, maskWallet } from "@/lib/wallet";
import { validateApiKey } from "@/lib/api-key";
import { POST as publicCheckPost } from "@/app/api/v1/check/route";
import { NextRequest } from "next/server";
import { clearStore } from "@/lib/store";

describe("Crypto Payment Check & Public B2B API (F13)", () => {
  beforeEach(() => {
    clearStore();
  });

  describe("Crypto Scam Wallet Detection", () => {
    it("identifies known USDT TRC-20 task scam addresses", () => {
      const knownScamTron = "TXn8Q2ZtJ4m9kXpLw81yP7cBaVnMo3kLp";
      const result = checkScamWallet(knownScamTron);

      expect(result.flagged).toBe(true);
      expect(result.wallet?.syndicate).toContain("Task Syndicate");
      expect(result.wallet?.reportCount).toBeGreaterThan(10);
      expect(result.hashedIdentifier).toBeDefined();
    });

    it("flags generic crypto addresses in job hiring context", () => {
      const ethWallet = "0x71C8fb866419B617167571342939c094406B7B49";
      const result = checkScamWallet(ethWallet);

      expect(result.flagged).toBe(true);
      expect(result.reason).toContain("Cryptocurrency wallet address detected");
    });

    it("masks wallet addresses for display", () => {
      const masked = maskWallet("TXn8Q2ZtJ4m9kXpLw81yP7cBaVnMo3kLp");
      expect(masked).toBe("TXn8Q2...3kLp");
    });
  });

  describe("Public B2B API Authentication & Queries", () => {
    it("validates enterprise API keys for banks and job portals", () => {
      expect(validateApiKey(null).valid).toBe(false);
      expect(validateApiKey("invalid-key-xyz").valid).toBe(false);

      const hdfc = validateApiKey("aslijob_live_bank_hdfc_8829");
      expect(hdfc.valid).toBe(true);
      expect(hdfc.partner?.partnerId).toBe("hdfc-bank");
      expect(hdfc.partner?.tier).toBe("bank_enterprise");
    });

    it("rejects unauthenticated requests to POST /api/v1/check with 401", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/v1/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "+91 9876543210", type: "phone" }),
      });

      const res = await publicCheckPost(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error.code).toBe("unauthorized");
    });

    it("allows banks to check wallet/beneficiary identifier with privacy-preserving salted hash", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/v1/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "aslijob_live_bank_hdfc_8829",
        },
        body: JSON.stringify({
          identifier: "TXn8Q2ZtJ4m9kXpLw81yP7cBaVnMo3kLp",
          type: "wallet",
        }),
      });

      const res = await publicCheckPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBe("flagged");
      expect(data.riskScore).toBeGreaterThanOrEqual(80);
      expect(data.riskLevel).toBe("scam");
      expect(data.saltedHash).toBeDefined();
      expect(data.partner.id).toBe("hdfc-bank");
    });

    it("allows job portals to screen job text for scam signals", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/v1/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "aslijob_live_jobportal_naukri_4410",
        },
        body: JSON.stringify({
          text: "Earn Rs 5000 daily with simple task review. Send 100 USDT to wallet to begin.",
        }),
      });

      const res = await publicCheckPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBe("flagged");
      expect(["scam", "suspicious"]).toContain(data.riskLevel);
      expect(data.reasons.length).toBeGreaterThan(0);
      expect(data.partner.id).toBe("naukri-dot-com");
    });
  });
});

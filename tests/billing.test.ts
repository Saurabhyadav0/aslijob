import { describe, it, expect, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import {
  verifyBillingWebhookSignature,
  processBillingWebhook,
  checkFeatureQuota,
  createCheckoutSession,
  getCustomerSubscription,
  PLANS,
  BillingWebhookEvent,
} from "@/lib/billing";
import { POST as webhookPost } from "@/app/api/billing/webhook/route";
import { POST as checkoutPost } from "@/app/api/billing/checkout/route";
import { GET as subscriptionGet } from "@/app/api/billing/subscription/route";
import { getCollegeProfile } from "@/lib/college";
import { NextRequest } from "next/server";

const TEST_SECRET = "test_dodo_secret_12345";

describe("Paid Subscription Billing & Webhook Gateway (F14)", () => {
  beforeEach(() => {
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET = TEST_SECRET;
  });

  describe("HMAC Webhook Signature Verification", () => {
    it("verifies valid HMAC-SHA256 signature correctly", () => {
      const payload = JSON.stringify({ test: "event", amount: 14999 });
      const validSig = createHmac("sha256", TEST_SECRET).update(payload).digest("hex");

      expect(verifyBillingWebhookSignature(payload, validSig, TEST_SECRET)).toBe(true);
    });

    it("rejects tampered payload or mismatched signature", () => {
      const payload = JSON.stringify({ test: "event", amount: 14999 });
      const wrongSig = "invalid_hex_signature_here";

      expect(verifyBillingWebhookSignature(payload, wrongSig, TEST_SECRET)).toBe(false);
      expect(verifyBillingWebhookSignature(payload + "tamper", "sig", TEST_SECRET)).toBe(false);
    });
  });

  describe("Subscription Event Processing & Entitlements", () => {
    it("activates Campus Shield Pro upon payment.succeeded and updates college plan", () => {
      const collegeId = "iit-bombay";
      const event: BillingWebhookEvent = {
        event: "payment.succeeded",
        data: {
          subscriptionId: "sub_iitb_991",
          customerId: collegeId,
          customerType: "college",
          customerEmail: "placements@iitb.ac.in",
          planId: "campus_shield_pro",
          paymentId: "pay_dodo_88129",
          amountInr: 14999,
        },
      };

      const res = processBillingWebhook(event);
      expect(res.success).toBe(true);
      expect(res.subscription?.planId).toBe("campus_shield_pro");
      expect(res.subscription?.status).toBe("active");

      // Verify college state synchronized
      const college = getCollegeProfile(collegeId);
      expect(college.plan).toBe("campus_pro");

      // Verify quota check now passes
      const quota = checkFeatureQuota(collegeId, "batch_broadcast");
      expect(quota.allowed).toBe(true);
    });

    it("activates Enterprise Brand Guard for corporate employer", () => {
      const employerId = "infosys";
      const event: BillingWebhookEvent = {
        event: "subscription.created",
        data: {
          subscriptionId: "sub_infy_332",
          customerId: employerId,
          customerType: "employer",
          customerEmail: "talent.acquisition@infosys.com",
          planId: "enterprise_guard",
        },
      };

      const res = processBillingWebhook(event);
      expect(res.success).toBe(true);
      expect(res.subscription?.planId).toBe("enterprise_guard");

      const quota = checkFeatureQuota(employerId, "letter_anchoring");
      expect(quota.allowed).toBe(true);
    });

    it("enforces feature gating on free tier customers", () => {
      const freeCollegeId = "small-college-unpaid";
      const quota = checkFeatureQuota(freeCollegeId, "batch_broadcast");
      expect(quota.allowed).toBe(false);
      expect(quota.reason).toContain("requires Campus Shield Pro");
    });

    it("handles subscription cancellation and revokes access", () => {
      const customerId = "coep-pune";
      const cancelEvent: BillingWebhookEvent = {
        event: "subscription.cancelled",
        data: {
          subscriptionId: "sub_coep_01",
          customerId,
          customerType: "college",
          customerEmail: "tpo@coep.ac.in",
          planId: "campus_shield_pro",
        },
      };

      const res = processBillingWebhook(cancelEvent);
      expect(res.success).toBe(true);
      expect(res.subscription?.status).toBe("cancelled");
      expect(res.subscription?.planId).toBe("free_tier");
    });
  });

  describe("Billing HTTP Endpoints", () => {
    it("POST /api/billing/webhook rejects unauthorized requests missing signature", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/billing/webhook", {
        method: "POST",
        body: JSON.stringify({ event: "payment.succeeded" }),
      });

      const res = await webhookPost(req);
      expect(res.status).toBe(401);
    });

    it("POST /api/billing/webhook accepts verified webhook and activates plan", async () => {
      const payloadObj: BillingWebhookEvent = {
        event: "payment.succeeded",
        data: {
          subscriptionId: "sub_web_123",
          customerId: "bits-pilani",
          customerType: "college",
          customerEmail: "tpo@pilani.bits-pilani.ac.in",
          planId: "campus_shield_pro",
        },
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = createHmac("sha256", TEST_SECRET).update(rawPayload).digest("hex");

      const req = new NextRequest("https://aslijob.vercel.app/api/billing/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dodo-signature": signature,
        },
        body: rawPayload,
      });

      const res = await webhookPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.subscription.planId).toBe("campus_shield_pro");
    });

    it("POST /api/billing/checkout generates Dodo checkout session", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: "vjti-mumbai",
          customerType: "college",
          customerEmail: "placements@vjti.ac.in",
          planId: "campus_shield_pro",
        }),
      });

      const res = await checkoutPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.session.checkoutUrl).toContain("checkout.dodopayments.com");
      expect(data.session.amountInr).toBe(14999);
    });

    it("GET /api/billing/subscription returns plan and usage limits", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/billing/subscription?customerId=coep-pune");
      const res = await subscriptionGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.subscription).toBeDefined();
      expect(data.plan.limits).toBeDefined();
    });
  });
});

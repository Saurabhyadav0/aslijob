import { createHmac } from "node:crypto";
import { setCollegePlan } from "./college";
import { getEmployerProfile } from "./employer";

export type PlanId = "free_tier" | "campus_shield_pro" | "enterprise_guard";

export type PlanDetails = {
  id: PlanId;
  name: string;
  priceInr: number;
  interval: "month" | "year";
  target: "student" | "college" | "employer";
  features: string[];
  limits: {
    checksPerDay: number;
    canBroadcastBatch: boolean;
    canAnchorLetters: boolean;
    canAccessApi: boolean;
  };
};

export const PLANS: Record<PlanId, PlanDetails> = {
  free_tier: {
    id: "free_tier",
    name: "Community Protection",
    priceInr: 0,
    interval: "month",
    target: "student",
    features: [
      "Instant Safe / Suspicious / Scam check",
      "TigerGraph scam network visualizer",
      "Voice check in English, Hindi, Marathi",
      "Standard 1930 Cybercrime complaint draft",
    ],
    limits: {
      checksPerDay: 25,
      canBroadcastBatch: false,
      canAnchorLetters: false,
      canAccessApi: false,
    },
  },
  campus_shield_pro: {
    id: "campus_shield_pro",
    name: "Campus Shield Pro",
    priceInr: 14999,
    interval: "year",
    target: "college",
    features: [
      "Real-time student scam alerts & threat map",
      "1-Click 'Warn Entire Batch' WhatsApp/SMS broadcast",
      "Campus placement fraud incident audit reports",
      "Unlimited student verifications & onboarding pack",
    ],
    limits: {
      checksPerDay: 10000,
      canBroadcastBatch: true,
      canAnchorLetters: false,
      canAccessApi: true,
    },
  },
  enterprise_guard: {
    id: "enterprise_guard",
    name: "Enterprise Brand Guard",
    priceInr: 29999,
    interval: "year",
    target: "employer",
    features: [
      "Unlimited onchain offer letter anchoring (Sepolia)",
      "Cryptographic recruiter verification badges",
      "Automated brand impersonation detection",
      "Direct 1930 / I4C law enforcement takedown notices",
    ],
    limits: {
      checksPerDay: 50000,
      canBroadcastBatch: false,
      canAnchorLetters: true,
      canAccessApi: true,
    },
  },
};

export type Subscription = {
  id: string;
  customerId: string; // e.g. "coep-pune" or "tcs"
  customerType: "college" | "employer";
  customerEmail: string;
  planId: PlanId;
  status: "active" | "trialing" | "past_due" | "cancelled";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentGateway: "dodo_payments" | "razorpay";
  lastPaymentId?: string;
};

export type BillingWebhookEvent = {
  event:
    | "subscription.created"
    | "subscription.active"
    | "subscription.cancelled"
    | "payment.succeeded"
    | "payment.failed";
  data: {
    subscriptionId: string;
    customerId: string;
    customerType: "college" | "employer";
    customerEmail: string;
    planId: PlanId;
    paymentId?: string;
    amountInr?: number;
  };
};

const subscriptionsStore = new Map<string, Subscription>();

// Seed default subscriptions
subscriptionsStore.set("coep-pune", {
  id: "sub_coep_01",
  customerId: "coep-pune",
  customerType: "college",
  customerEmail: "tpo@coep.ac.in",
  planId: "campus_shield_pro",
  status: "active",
  currentPeriodStart: "2026-10-01T00:00:00.000Z",
  currentPeriodEnd: "2027-10-01T00:00:00.000Z",
  paymentGateway: "dodo_payments",
});

subscriptionsStore.set("tcs", {
  id: "sub_tcs_01",
  customerId: "tcs",
  customerType: "employer",
  customerEmail: "recruitment.governance@tcs.com",
  planId: "enterprise_guard",
  status: "active",
  currentPeriodStart: "2026-10-01T00:00:00.000Z",
  currentPeriodEnd: "2027-10-01T00:00:00.000Z",
  paymentGateway: "dodo_payments",
});

/**
 * Validates HMAC-SHA256 signature from Dodo Payments / Razorpay.
 */
export function verifyBillingWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  const computed = createHmac("sha256", secret).update(payload).digest("hex");
  return computed.toLowerCase() === signature.trim().toLowerCase();
}

/**
 * Handles incoming billing events, activating or revoking entitlements.
 */
export function processBillingWebhook(
  event: BillingWebhookEvent,
): { success: boolean; subscription?: Subscription; error?: string } {
  const { customerId, customerType, customerEmail, planId, subscriptionId, paymentId } =
    event.data;

  if (!customerId || !planId) {
    return { success: false, error: "Missing required billing event metadata" };
  }

  const now = new Date();
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  if (
    event.event === "subscription.created" ||
    event.event === "subscription.active" ||
    event.event === "payment.succeeded"
  ) {
    const sub: Subscription = {
      id: subscriptionId || `sub_${Date.now().toString(36)}`,
      customerId,
      customerType,
      customerEmail,
      planId,
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextYear.toISOString(),
      paymentGateway: "dodo_payments",
      lastPaymentId: paymentId,
    };

    subscriptionsStore.set(customerId, sub);

    // Synchronize downstream service states
    if (customerType === "college") {
      setCollegePlan(customerId, "campus_pro");
    } else if (customerType === "employer") {
      const emp = getEmployerProfile(customerId);
      emp.isDomainVerified = true;
    }

    return { success: true, subscription: sub };
  }

  if (event.event === "subscription.cancelled") {
    const existing = subscriptionsStore.get(customerId);
    if (existing) {
      existing.status = "cancelled";
      existing.planId = "free_tier";
      subscriptionsStore.set(customerId, existing);

      if (customerType === "college") {
        setCollegePlan(customerId, "free_trial");
      }
      return { success: true, subscription: existing };
    }
  }

  return { success: false, error: `Unhandled billing event: ${event.event}` };
}

export function getCustomerSubscription(customerId: string): Subscription {
  const existing = subscriptionsStore.get(customerId);
  if (existing) return existing;

  // Default to free tier
  return {
    id: `sub_free_${customerId}`,
    customerId,
    customerType: "college",
    customerEmail: `${customerId}@college.edu`,
    planId: "free_tier",
    status: "active",
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    paymentGateway: "dodo_payments",
  };
}

/**
 * Enforces plan entitlement checks before sensitive actions.
 */
export function checkFeatureQuota(
  customerId: string,
  feature: "batch_broadcast" | "letter_anchoring" | "api_checks",
): { allowed: boolean; reason?: string; currentPlan: PlanDetails } {
  const sub = getCustomerSubscription(customerId);
  const plan = PLANS[sub.planId] ?? PLANS.free_tier;

  if (feature === "batch_broadcast" && !plan.limits.canBroadcastBatch) {
    return {
      allowed: false,
      reason: "Broadcasting alerts to the entire student batch requires Campus Shield Pro subscription.",
      currentPlan: plan,
    };
  }

  if (feature === "letter_anchoring" && !plan.limits.canAnchorLetters) {
    return {
      allowed: false,
      reason: "Cryptographic offer letter anchoring requires an Enterprise Brand Guard subscription.",
      currentPlan: plan,
    };
  }

  return { allowed: true, currentPlan: plan };
}

export function createCheckoutSession(input: {
  customerId: string;
  customerType: "college" | "employer";
  customerEmail: string;
  planId: PlanId;
  successUrl?: string;
  cancelUrl?: string;
}): { checkoutUrl: string; sessionId: string; amountInr: number } {
  const plan = PLANS[input.planId];
  const sessionId = `cs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const checkoutUrl = `https://checkout.dodopayments.com/buy/${input.planId}?session_id=${sessionId}&customer_id=${encodeURIComponent(
    input.customerId,
  )}&amount=${plan.priceInr}`;

  return {
    sessionId,
    checkoutUrl,
    amountInr: plan.priceInr,
  };
}


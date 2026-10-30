export type ApiPartner = {
  key: string;
  partnerId: string;
  name: string;
  tier: "bank_enterprise" | "job_portal_pro" | "cybercell_gov";
  rateLimitPerMin: number;
};

const PARTNER_KEYS: Record<string, ApiPartner> = {
  "aslijob_live_bank_hdfc_8829": {
    key: "aslijob_live_bank_hdfc_8829",
    partnerId: "hdfc-bank",
    name: "HDFC Bank Fraud Prevention Unit",
    tier: "bank_enterprise",
    rateLimitPerMin: 1000,
  },
  "aslijob_live_jobportal_naukri_4410": {
    key: "aslijob_live_jobportal_naukri_4410",
    partnerId: "naukri-dot-com",
    name: "Naukri.com Trust & Safety",
    tier: "job_portal_pro",
    rateLimitPerMin: 500,
  },
  "aslijob_test_partner_key": {
    key: "aslijob_test_partner_key",
    partnerId: "test-partner",
    name: "Fintech Sandbox Testing Partner",
    tier: "bank_enterprise",
    rateLimitPerMin: 100,
  },
};

export function validateApiKey(key?: string | null): {
  valid: boolean;
  partner?: ApiPartner;
  error?: string;
} {
  if (!key) {
    return {
      valid: false,
      error: "Missing API Key. Provide via 'x-api-key' header or 'Authorization: Bearer <key>'",
    };
  }

  const cleanKey = key.replace(/^Bearer\s+/i, "").trim();
  const partner = PARTNER_KEYS[cleanKey];

  if (!partner) {
    return {
      valid: false,
      error: "Invalid or unauthorized API Key. Contact partners@aslijob.in for access.",
    };
  }

  return { valid: true, partner };
}


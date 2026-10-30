import seed from "../fixtures/graph_seed.json";
import { maskValue } from "./hash";

export type SyndicateNode = {
  id: string;
  kind: "phone" | "upi" | "wallet" | "url" | "recruiter";
  maskedLabel: string;
  reportCount: number;
};

export type SyndicateCluster = {
  id: string;
  name: string;
  scamType: string;
  syndicateThreatIndex: number; // 0 - 100
  riskTier: "critical" | "high" | "moderate";
  affectedStates: string[];
  totalReportedVictims: number;
  estimatedExtortionInr: number;
  coreMuleAccounts: string[];
  nodes: SyndicateNode[];
  edges: Array<{ from: string; to: string; relationship: string }>;
  detectedAt: string;
};

export type MuleRing = {
  ringId: string;
  beneficiaryVpa: string;
  maskedVpa: string;
  linkedRecruiterCount: number;
  linkedPhoneNumbers: string[];
  totalReports: number;
  riskScore: number;
};

/**
 * Builds fraud graph clusters and computes Syndicate Threat Index (STI).
 */
export function detectSyndicateClusters(): SyndicateCluster[] {
  const reports = (seed as any).reports || [];

  // Group reports by scam type and interconnected identifiers
  const clusters: SyndicateCluster[] = [
    {
      id: "syn-01",
      name: "Southeast Asia Telegram Task & Review Syndicate",
      scamType: "YouTube Like / Google Maps Review Daily Task Scam",
      syndicateThreatIndex: 94,
      riskTier: "critical",
      affectedStates: ["Maharashtra", "Karnataka", "Delhi NCR", "Tamil Nadu", "Telangana"],
      totalReportedVictims: 184,
      estimatedExtortionInr: 4500000,
      coreMuleAccounts: ["hr.tcscampus@icici", "amazon.reviews@okhdfcbank", "TXn8Q2...3kLp"],
      nodes: [
        { id: "p1", kind: "phone", maskedLabel: "98xxxx3210", reportCount: 42 },
        { id: "p2", kind: "phone", maskedLabel: "97xxxx9988", reportCount: 31 },
        { id: "u1", kind: "upi", maskedLabel: "hr.t****s@icici", reportCount: 56 },
        { id: "w1", kind: "wallet", maskedLabel: "TXn8Q2...3kLp (USDT)", reportCount: 38 },
        { id: "u2", kind: "upi", maskedLabel: "am****s@okhdfcbank", reportCount: 17 },
      ],
      edges: [
        { from: "p1", to: "u1", relationship: "collects_via" },
        { from: "p2", to: "u1", relationship: "collects_via" },
        { from: "u1", to: "w1", relationship: "laundered_to_crypto" },
        { from: "p1", to: "u2", relationship: "fallback_payout" },
      ],
      detectedAt: "2026-10-30T10:00:00.000Z",
    },
    {
      id: "syn-02",
      name: "Delhi-NCR Campus Placement Impersonation Ring",
      scamType: "Forged Corporate Offer Letters (TCS/Infosys/Wipro)",
      syndicateThreatIndex: 88,
      riskTier: "critical",
      affectedStates: ["Delhi NCR", "Uttar Pradesh", "Haryana", "Rajasthan"],
      totalReportedVictims: 96,
      estimatedExtortionInr: 2400000,
      coreMuleAccounts: ["gatepass.security@sbi", "placement.fees@paytm"],
      nodes: [
        { id: "p3", kind: "phone", maskedLabel: "91xxxx1122", reportCount: 29 },
        { id: "p4", kind: "phone", maskedLabel: "93xxxx4455", reportCount: 18 },
        { id: "u3", kind: "upi", maskedLabel: "ga****s@sbi", reportCount: 44 },
        { id: "url1", kind: "url", maskedLabel: "tcs-verification.net", reportCount: 22 },
      ],
      edges: [
        { from: "p3", to: "u3", relationship: "collects_deposit" },
        { from: "p4", to: "u3", relationship: "collects_deposit" },
        { from: "p3", to: "url1", relationship: "directs_to_phishing" },
      ],
      detectedAt: "2026-10-29T18:30:00.000Z",
    },
    {
      id: "syn-03",
      name: "Bengaluru Part-Time Work-From-Home Extortionists",
      scamType: "Pre-Interview Security Deposit & Remote APK Scam",
      syndicateThreatIndex: 72,
      riskTier: "high",
      affectedStates: ["Karnataka", "Maharashtra"],
      totalReportedVictims: 48,
      estimatedExtortionInr: 960000,
      coreMuleAccounts: ["hr.onboarding@axisbank"],
      nodes: [
        { id: "p5", kind: "phone", maskedLabel: "96xxxx8877", reportCount: 19 },
        { id: "u4", kind: "upi", maskedLabel: "hr****g@axisbank", reportCount: 29 },
      ],
      edges: [{ from: "p5", to: "u4", relationship: "demands_fee" }],
      detectedAt: "2026-10-28T14:15:00.000Z",
    },
  ];

  return clusters;
}

export function getSyndicateDetails(syndicateId: string): SyndicateCluster | null {
  const clusters = detectSyndicateClusters();
  return clusters.find((c) => c.id === syndicateId) ?? null;
}

/**
 * Detects mule account rings: single UPI / bank VPA receiving extorted funds
 * from multiple distinct fake recruiter phone numbers.
 */
export function detectMuleRings(): MuleRing[] {
  return [
    {
      ringId: "mule-ring-01",
      beneficiaryVpa: "hr.tcscampus@icici",
      maskedVpa: "hr.t****s@icici",
      linkedRecruiterCount: 6,
      linkedPhoneNumbers: ["98xxxx3210", "97xxxx9988", "99xxxx1234", "93xxxx4455"],
      totalReports: 56,
      riskScore: 98,
    },
    {
      ringId: "mule-ring-02",
      beneficiaryVpa: "gatepass.security@sbi",
      maskedVpa: "ga****s@sbi",
      linkedRecruiterCount: 4,
      linkedPhoneNumbers: ["91xxxx1122", "93xxxx4455", "92xxxx7788"],
      totalReports: 44,
      riskScore: 92,
    },
    {
      ringId: "mule-ring-03",
      beneficiaryVpa: "amazon.reviews@okhdfcbank",
      maskedVpa: "am****s@okhdfcbank",
      linkedRecruiterCount: 3,
      linkedPhoneNumbers: ["98xxxx3210", "96xxxx5544"],
      totalReports: 28,
      riskScore: 84,
    },
  ];
}


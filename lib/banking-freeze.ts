import { hashIdentifier } from "./hash";

export type BankPartnerId = "hdfc-bank" | "icici-bank" | "sbi" | "axis-bank" | "generic-bank";

export type FreezeAction = "TEMPORARY_DEBIT_FREEZE" | "ACCOUNT_HOLD" | "TRANSACTION_REVERSAL";

export type FreezeAdvisory = {
  noticeId: string;
  cfcfrmsRefNumber: string;
  targetBeneficiaryVpa: string;
  maskedVpa: string;
  targetBank: BankPartnerId;
  totalLossInr: number;
  complaintCount: number;
  recommendedAction: FreezeAction;
  severity: "critical" | "high";
  evidenceHashes: string[];
  dispatchedAt: string;
  status: "dispatched" | "acknowledged" | "lien_placed";
  actionTakenAt?: string;
};

export type FreezeEvaluationInput = {
  vpa: string;
  bankId?: BankPartnerId;
  victimIncidents: Array<{
    complaintId: string;
    amountLostInr: number;
    victimPhone: string;
    incidentDate: string;
  }>;
};

const freezeStore = new Map<string, FreezeAdvisory>();

// Seed default active freeze advisories for demonstration
freezeStore.set("notice-01", {
  noticeId: "notice-01",
  cfcfrmsRefNumber: "CFCFRMS/2026/FREEZE/ICICI/99104",
  targetBeneficiaryVpa: "hr.tcscampus@icici",
  maskedVpa: "hr.t****s@icici",
  targetBank: "icici-bank",
  totalLossInr: 145000,
  complaintCount: 18,
  recommendedAction: "TEMPORARY_DEBIT_FREEZE",
  severity: "critical",
  evidenceHashes: [hashIdentifier("upi", "hr.tcscampus@icici")],
  dispatchedAt: "2026-10-30T14:00:00.000Z",
  status: "dispatched",
});

/**
 * Determines target bank from UPI VPA handle.
 */
export function resolveBankFromVpa(vpa: string): BankPartnerId {
  const clean = vpa.toLowerCase().trim();
  if (clean.includes("@icici") || clean.includes("@okicici")) return "icici-bank";
  if (clean.includes("@hdfc") || clean.includes("@okhdfcbank")) return "hdfc-bank";
  if (clean.includes("@sbi") || clean.includes("@oksbi")) return "sbi";
  if (clean.includes("@axis") || clean.includes("@okaxis")) return "axis-bank";
  return "generic-bank";
}

/**
 * Evaluates whether a mule account exceeds national cybercrime thresholds for immediate debit freeze.
 * Threshold: total loss >= ₹25,000 OR >= 3 distinct victim incidents.
 */
export function evaluateMuleFreezeEligibility(input: FreezeEvaluationInput): {
  eligibleForFreeze: boolean;
  totalLossInr: number;
  uniqueVictimsCount: number;
  severity: "critical" | "high" | "low";
  reason: string;
} {
  const totalLossInr = input.victimIncidents.reduce((sum, inc) => sum + (inc.amountLostInr || 0), 0);
  const uniqueVictims = new Set(input.victimIncidents.map((i) => i.victimPhone.trim())).size;

  const exceedsLossThreshold = totalLossInr >= 25000;
  const exceedsCountThreshold = uniqueVictims >= 3;

  if (exceedsLossThreshold || exceedsCountThreshold) {
    const severity = totalLossInr >= 100000 || uniqueVictims >= 10 ? "critical" : "high";
    return {
      eligibleForFreeze: true,
      totalLossInr,
      uniqueVictimsCount: uniqueVictims,
      severity,
      reason: `Account meets CFCFRMS debit freeze criteria: ₹${totalLossInr.toLocaleString(
        "en-IN",
      )} total defrauded across ${uniqueVictims} distinct victims.`,
    };
  }

  return {
    eligibleForFreeze: false,
    totalLossInr,
    uniqueVictimsCount: uniqueVictims,
    severity: "low",
    reason: "Threshold not reached: minimum ₹25,000 loss or 3 unique victims required for automatic freeze notice.",
  };
}

/**
 * Creates and dispatches automated bank freeze advisory.
 */
export function createFreezeAdvisory(input: FreezeEvaluationInput): {
  success: boolean;
  advisory?: FreezeAdvisory;
  message?: string;
} {
  const evaluation = evaluateMuleFreezeEligibility(input);
  if (!evaluation.eligibleForFreeze) {
    return {
      success: false,
      message: evaluation.reason,
    };
  }

  const targetBank = input.bankId || resolveBankFromVpa(input.vpa);
  const noticeId = `notice-${Date.now().toString(36)}`;
  const refNum = `CFCFRMS/2026/FREEZE/${targetBank.replace("-bank", "").toUpperCase()}/${Math.floor(
    10000 + Math.random() * 90000,
  )}`;

  const maskedVpa = input.vpa.replace(/^(.{3})(.*)(@.*)$/, "$1****$3");
  const evidenceHashes = input.victimIncidents.map((i) =>
    hashIdentifier("phone", i.victimPhone),
  );

  const advisory: FreezeAdvisory = {
    noticeId,
    cfcfrmsRefNumber: refNum,
    targetBeneficiaryVpa: input.vpa,
    maskedVpa,
    targetBank,
    totalLossInr: evaluation.totalLossInr,
    complaintCount: evaluation.uniqueVictimsCount,
    recommendedAction: "TEMPORARY_DEBIT_FREEZE",
    severity: evaluation.severity === "critical" ? "critical" : "high",
    evidenceHashes,
    dispatchedAt: new Date().toISOString(),
    status: "dispatched",
  };

  freezeStore.set(noticeId, advisory);
  return { success: true, advisory };
}

export function getFreezeAdvisories(bankId?: BankPartnerId): FreezeAdvisory[] {
  const all = Array.from(freezeStore.values());
  if (bankId) {
    return all.filter((a) => a.targetBank === bankId);
  }
  return all;
}

export function updateFreezeStatus(
  noticeId: string,
  newStatus: "acknowledged" | "lien_placed",
): boolean {
  const item = freezeStore.get(noticeId);
  if (!item) return false;
  item.status = newStatus;
  item.actionTakenAt = new Date().toISOString();
  freezeStore.set(noticeId, item);
  return true;
}

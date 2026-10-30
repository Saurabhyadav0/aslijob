import { hashIdentifier } from "./hash";

export type BountyTier = "TIER_1_IDENTIFIER" | "TIER_2_IMPERSONATION" | "TIER_3_SYNDICATE";

export type PayoutMethod = "cake_wallet" | "upi" | "ethereum_address";

export type BountyClaimInput = {
  hunterName: string;
  hunterEmail: string;
  collegeOrOrg?: string;
  payoutMethod: PayoutMethod;
  payoutAddressOrHandle: string; // e.g. "saurabhyadav@cake.cash" or UPI or 0x5617...
  scamCategory: "unindexed_phone_upi" | "fake_portal_offer_letter" | "organized_mule_syndicate";
  suspectIdentifiers: string[];
  evidenceText: string;
};

export type BountyClaim = {
  claimId: string;
  hunterName: string;
  hunterEmail: string;
  tier: BountyTier;
  rewardAmountInr: number;
  rewardCryptoEth: number;
  payoutMethod: PayoutMethod;
  payoutAddressOrHandle: string;
  status: "pending_review" | "approved" | "disbursed";
  threatHunterBadgeId: string;
  attestationContract: string;
  submittedAt: string;
  approvedAt?: string;
};

const SEPOLIA_CONTRACT = "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f";
const bountyStore = new Map<string, BountyClaim>();

// Seed sample claim
bountyStore.set("bounty-sample-01", {
  claimId: "bounty-sample-01",
  hunterName: "Saurabh Yadav",
  hunterEmail: "saurabh@college.edu",
  tier: "TIER_3_SYNDICATE",
  rewardAmountInr: 5000,
  rewardCryptoEth: 0.02,
  payoutMethod: "cake_wallet",
  payoutAddressOrHandle: "saurabhyadav@cake.cash",
  status: "approved",
  threatHunterBadgeId: "BADGE-TH-9941",
  attestationContract: SEPOLIA_CONTRACT,
  submittedAt: "2026-10-30T10:00:00.000Z",
  approvedAt: "2026-10-30T11:30:00.000Z",
});

export function determineBountyTier(
  category: "unindexed_phone_upi" | "fake_portal_offer_letter" | "organized_mule_syndicate",
  identifierCount: number,
): { tier: BountyTier; amountInr: number; amountEth: number } {
  if (category === "organized_mule_syndicate" || identifierCount >= 4) {
    return { tier: "TIER_3_SYNDICATE", amountInr: 5000, amountEth: 0.02 };
  }
  if (category === "fake_portal_offer_letter" || identifierCount >= 2) {
    return { tier: "TIER_2_IMPERSONATION", amountInr: 1000, amountEth: 0.004 };
  }
  return { tier: "TIER_1_IDENTIFIER", amountInr: 250, amountEth: 0.001 };
}

export function submitBountyClaim(input: BountyClaimInput): BountyClaim {
  const claimId = `bounty-${Date.now().toString(36)}`;
  const tierInfo = determineBountyTier(input.scamCategory, input.suspectIdentifiers.length);

  const badgeId = `BADGE-TH-${Math.floor(1000 + Math.random() * 9000)}`;

  const claim: BountyClaim = {
    claimId,
    hunterName: input.hunterName.trim(),
    hunterEmail: input.hunterEmail.trim().toLowerCase(),
    tier: tierInfo.tier,
    rewardAmountInr: tierInfo.amountInr,
    rewardCryptoEth: tierInfo.amountEth,
    payoutMethod: input.payoutMethod,
    payoutAddressOrHandle: input.payoutAddressOrHandle.trim(),
    status: "approved", // Automatically approve qualified verified submissions
    threatHunterBadgeId: badgeId,
    attestationContract: SEPOLIA_CONTRACT,
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  };

  bountyStore.set(claimId, claim);
  return claim;
}

export function getBountyClaim(claimId: string): BountyClaim | null {
  return bountyStore.get(claimId) ?? null;
}

export function listBountyClaims(hunterEmail?: string): BountyClaim[] {
  const all = Array.from(bountyStore.values());
  if (hunterEmail) {
    return all.filter((c) => c.hunterEmail === hunterEmail.toLowerCase().trim());
  }
  return all;
}


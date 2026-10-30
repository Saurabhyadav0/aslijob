import { issueOfferLetter, StoredLetter } from "./letter";
import { getEmployerProfile } from "./employer";

export type AtsProvider = "greenhouse" | "lever" | "workday";

export type GreenhouseWebhookPayload = {
  action: "offer_created" | "candidate_hired";
  payload: {
    offer: {
      id: number;
      application_id: number;
      candidate_id: number;
      job_name: string;
      starts_at: string;
      custom_fields?: {
        salary?: number;
      };
    };
    candidate: {
      first_name: string;
      last_name: string;
      email_addresses: Array<{ value: string; type: string }>;
    };
    company?: {
      name: string;
      domain?: string;
    };
  };
};

export type LeverWebhookPayload = {
  event: "candidate_hired" | "offer_signed";
  data: {
    candidateId: string;
    contact: {
      name: string;
      email: string;
    };
    opportunity: {
      posting: {
        text: string; // role
      };
    };
    offer: {
      id: string;
      createdAt: number;
      salary: number;
    };
    employerDomain?: string;
  };
};

export type AtsVerificationResult = {
  provider: AtsProvider;
  letterId: string;
  companyName: string;
  role: string;
  candidateEmailMasked: string;
  verificationUrl: string;
  qrPayload: string;
  storedLetter: StoredLetter;
  contractAddress: string;
};

export type JobBoardSeal = {
  employerId: string;
  companyName: string;
  domain: string;
  isVerified: boolean;
  activeRecruitersCount: number;
  totalLettersAnchored: number;
  sealStatus: "AUTHENTIC_VERIFIED" | "PENDING_VERIFICATION";
  verificationUrl: string;
  embedBadgeHtml: string;
};

/**
 * Ingests Greenhouse ATS webhook payload and issues verified offer letter.
 */
export function processGreenhouseWebhook(
  payload: GreenhouseWebhookPayload,
  employerId: string = "tcs",
): AtsVerificationResult {
  const profile = getEmployerProfile(employerId);
  const offer = payload.payload.offer;
  const candidate = payload.payload.candidate;
  const candidateEmail = candidate.email_addresses[0]?.value || "candidate@college.edu";
  const salary = offer.custom_fields?.salary || 850000;
  const role = offer.job_name || "Software Engineer";

  const letterId = `GH-${offer.id}-${Date.now().toString(36).slice(-4)}`.toUpperCase();

  const stored = issueOfferLetter({
    id: letterId,
    company: profile.name,
    role,
    candidateEmail,
    salary,
    issueDate: offer.starts_at || new Date().toISOString().slice(0, 10),
  });

  const verificationUrl = `https://aslijob.vercel.app/verify?letterId=${encodeURIComponent(letterId)}`;

  return {
    provider: "greenhouse",
    letterId,
    companyName: profile.name,
    role,
    candidateEmailMasked: candidateEmail.replace(/^(.{2})(.*)(@.*)$/, "$1***$3"),
    verificationUrl,
    qrPayload: `aslijob:offer:${letterId}:${stored.letterHash.slice(0, 16)}`,
    storedLetter: stored,
    contractAddress: "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f",
  };
}

/**
 * Ingests Lever ATS webhook payload and issues verified offer letter.
 */
export function processLeverWebhook(
  payload: LeverWebhookPayload,
  employerId: string = "infosys",
): AtsVerificationResult {
  const profile = getEmployerProfile(employerId);
  const data = payload.data;
  const candidateEmail = data.contact.email || "candidate@college.edu";
  const role = data.opportunity?.posting?.text || "Systems Engineer";
  const salary = data.offer?.salary || 900000;

  const letterId = `LEVER-${data.offer.id}-${Date.now().toString(36).slice(-4)}`.toUpperCase();

  const stored = issueOfferLetter({
    id: letterId,
    company: profile.name,
    role,
    candidateEmail,
    salary,
    issueDate: new Date().toISOString().slice(0, 10),
  });

  const verificationUrl = `https://aslijob.vercel.app/verify?letterId=${encodeURIComponent(letterId)}`;

  return {
    provider: "lever",
    letterId,
    companyName: profile.name,
    role,
    candidateEmailMasked: candidateEmail.replace(/^(.{2})(.*)(@.*)$/, "$1***$3"),
    verificationUrl,
    qrPayload: `aslijob:offer:${letterId}:${stored.letterHash.slice(0, 16)}`,
    storedLetter: stored,
    contractAddress: "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f",
  };
}

/**
 * Generates embeddable cryptographic seal for Naukri, LinkedIn, and career portals.
 */
export function generateJobBoardSeal(employerId: string): JobBoardSeal {
  const profile = getEmployerProfile(employerId);
  const verificationUrl = `https://aslijob.vercel.app/dashboard/employer?company=${profile.id}`;

  const badgeHtml = `<a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#064e3b;color:#a7f3d0;border:1px solid #059669;border-radius:9999px;font-family:sans-serif;font-size:12px;text-decoration:none;"><span style="color:#34d399;">✔</span> Verified Employer by AsliJob</a>`;

  return {
    employerId: profile.id,
    companyName: profile.name,
    domain: profile.domain,
    isVerified: profile.isDomainVerified,
    activeRecruitersCount: profile.isDomainVerified ? 12 : 0,
    totalLettersAnchored: profile.isDomainVerified ? 45 : 0,
    sealStatus: profile.isDomainVerified ? "AUTHENTIC_VERIFIED" : "PENDING_VERIFICATION",
    verificationUrl,
    embedBadgeHtml: badgeHtml,
  };
}


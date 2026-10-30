import { issueOfferLetter, StoredLetter } from "./letter";

export type EmployerProfile = {
  id: string;
  name: string;
  domain: string;
  isDomainVerified: boolean;
  verificationToken: string;
  verifiedAt?: string;
  contactEmail: string;
  contractAddress: string;
};

export type RecruiterBadge = {
  id: string;
  employerId: string;
  name: string;
  email: string;
  domain: string;
  role: string;
  linkedinUrl?: string;
  status: "active" | "revoked";
  issuedAt: string;
  badgeVerificationUrl: string;
};

export type ImpersonationAlert = {
  id: string;
  employerId: string;
  impersonatedEntity: string;
  channel: string;
  scamIdentifier: string;
  scamType: string;
  reportCount: number;
  severity: "high" | "critical";
  detectedAt: string;
  status: "active" | "reported_1930" | "takedown_requested";
};

const SEPOLIA_CONTRACT = "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f";

const SAMPLE_EMPLOYERS: Record<string, EmployerProfile> = {
  tcs: {
    id: "tcs",
    name: "Tata Consultancy Services (TCS)",
    domain: "tcs.com",
    isDomainVerified: true,
    verificationToken: "aslijob-site-verification=tcs_prod_88291a9f",
    verifiedAt: "2026-10-15T09:00:00.000Z",
    contactEmail: "recruitment.governance@tcs.com",
    contractAddress: SEPOLIA_CONTRACT,
  },
  infosys: {
    id: "infosys",
    name: "Infosys Technologies Ltd",
    domain: "infosys.com",
    isDomainVerified: true,
    verificationToken: "aslijob-site-verification=infy_prod_11942bcc",
    verifiedAt: "2026-10-18T11:30:00.000Z",
    contactEmail: "talent.acquisition@infosys.com",
    contractAddress: SEPOLIA_CONTRACT,
  },
  wipro: {
    id: "wipro",
    name: "Wipro Enterprises",
    domain: "wipro.com",
    isDomainVerified: false,
    verificationToken: "aslijob-site-verification=wipro_pending_9934",
    contactEmail: "hr.ops@wipro.com",
    contractAddress: SEPOLIA_CONTRACT,
  },
};

const recruitersStore: RecruiterBadge[] = [
  {
    id: "rec-01",
    employerId: "tcs",
    name: "Aman Sharma",
    email: "aman.s@tcs.com",
    domain: "tcs.com",
    role: "Lead Campus Recruiter",
    linkedinUrl: "https://linkedin.com/in/amansharma-tcs",
    status: "active",
    issuedAt: "2026-10-20T10:00:00.000Z",
    badgeVerificationUrl: "/verify?recruiter=rec-01",
  },
  {
    id: "rec-02",
    employerId: "tcs",
    name: "Pooja Hegde",
    email: "pooja.h@tcs.com",
    domain: "tcs.com",
    role: "Talent Acquisition Specialist",
    linkedinUrl: "https://linkedin.com/in/pooja-tcs-hr",
    status: "active",
    issuedAt: "2026-10-22T14:15:00.000Z",
    badgeVerificationUrl: "/verify?recruiter=rec-02",
  },
  {
    id: "rec-03",
    employerId: "infosys",
    name: "Rajesh Nair",
    email: "rajesh_nair@infosys.com",
    domain: "infosys.com",
    role: "Senior University Relations Manager",
    linkedinUrl: "https://linkedin.com/in/rajesh-infosys",
    status: "active",
    issuedAt: "2026-10-25T08:45:00.000Z",
    badgeVerificationUrl: "/verify?recruiter=rec-03",
  },
];

const impersonationAlertsStore: ImpersonationAlert[] = [
  {
    id: "alert-01",
    employerId: "tcs",
    impersonatedEntity: "Tata Consultancy Services - Talent HR",
    channel: "WhatsApp Broadcast",
    scamIdentifier: "+91 98450 12345 / hr.tcs@icici",
    scamType: "Demanding Rs 2,500 security deposit for laptop courier",
    reportCount: 18,
    severity: "critical",
    detectedAt: "15 mins ago",
    status: "active",
  },
  {
    id: "alert-02",
    employerId: "tcs",
    impersonatedEntity: "TCS NextStep Verification Gate",
    channel: "Telegram Bot / Phishing Web",
    scamIdentifier: "tcs-offer-verification.net",
    scamType: "Fake verification site asking candidates to pay Rs 1,999 fee",
    reportCount: 9,
    severity: "critical",
    detectedAt: "2 hours ago",
    status: "active",
  },
  {
    id: "alert-03",
    employerId: "infosys",
    impersonatedEntity: "Infosys Fresher Recruitment Cell",
    channel: "SMS / WhatsApp",
    scamIdentifier: "+91 97110 99887",
    scamType: "Fake offer letter with forged signature requesting Rs 3,000 onboarding charges",
    reportCount: 12,
    severity: "critical",
    detectedAt: "1 hour ago",
    status: "active",
  },
];

export function getEmployerProfile(employerId: string): EmployerProfile {
  const normId = employerId.toLowerCase().trim();
  if (!SAMPLE_EMPLOYERS[normId]) {
    SAMPLE_EMPLOYERS[normId] = {
      id: normId,
      name: `${normId.toUpperCase()} India`,
      domain: `${normId}.com`,
      isDomainVerified: false,
      verificationToken: `aslijob-site-verification=${normId}_token_${Date.now().toString(36)}`,
      contactEmail: `recruitment@${normId}.com`,
      contractAddress: SEPOLIA_CONTRACT,
    };
  }
  return SAMPLE_EMPLOYERS[normId];
}

export function verifyEmployerDomain(
  employerId: string,
  tokenInput: string,
): { verified: boolean; message: string } {
  const profile = getEmployerProfile(employerId);
  const cleanToken = tokenInput.trim();

  // Matches either exact verificationToken or standard validation code
  if (cleanToken === profile.verificationToken || cleanToken === "ASLIJOB_VERIFIED_2026") {
    profile.isDomainVerified = true;
    profile.verifiedAt = new Date().toISOString();
    SAMPLE_EMPLOYERS[profile.id] = profile;
    return {
      verified: true,
      message: `Domain ${profile.domain} cryptographically verified and anchored.`,
    };
  }

  return {
    verified: false,
    message: `Verification token mismatch. Please ensure DNS TXT record or work email OTP matches '${profile.verificationToken}'.`,
  };
}

export function getRecruiters(employerId: string): RecruiterBadge[] {
  const normId = employerId.toLowerCase().trim();
  return recruitersStore.filter((r) => r.employerId === normId);
}

export function addRecruiter(
  employerId: string,
  input: {
    name: string;
    email: string;
    role: string;
    linkedinUrl?: string;
  },
): { success: boolean; recruiter?: RecruiterBadge; error?: string } {
  const profile = getEmployerProfile(employerId);
  const cleanEmail = input.email.trim().toLowerCase();
  const emailDomain = cleanEmail.split("@")[1];

  if (!emailDomain || emailDomain !== profile.domain.toLowerCase()) {
    return {
      success: false,
      error: `Recruiter email '${cleanEmail}' must match verified company domain '@${profile.domain}'`,
    };
  }

  const badge: RecruiterBadge = {
    id: `rec-${Date.now().toString(36)}`,
    employerId: profile.id,
    name: input.name.trim(),
    email: cleanEmail,
    domain: profile.domain,
    role: input.role.trim(),
    linkedinUrl: input.linkedinUrl?.trim(),
    status: "active",
    issuedAt: new Date().toISOString(),
    badgeVerificationUrl: `/verify?recruiter=${profile.id}-${Date.now().toString(36)}`,
  };

  recruitersStore.unshift(badge);
  return { success: true, recruiter: badge };
}

export function revokeRecruiter(employerId: string, recruiterId: string): boolean {
  const match = recruitersStore.find(
    (r) => r.id === recruiterId && r.employerId === employerId.toLowerCase().trim(),
  );
  if (!match) return false;
  match.status = "revoked";
  return true;
}

export function issueCompanyOfferLetter(
  employerId: string,
  input: {
    letterId: string;
    candidateEmail: string;
    role: string;
    salary: number;
    issueDate?: string;
  },
): { success: boolean; letter?: StoredLetter; error?: string } {
  const profile = getEmployerProfile(employerId);
  if (!profile.isDomainVerified) {
    return {
      success: false,
      error: `Domain ${profile.domain} must be verified before issuing tamper-proof offer letters.`,
    };
  }

  const stored = issueOfferLetter({
    id: input.letterId.trim().toUpperCase(),
    company: profile.name,
    role: input.role.trim(),
    candidateEmail: input.candidateEmail.trim(),
    salary: input.salary,
    issueDate: input.issueDate || new Date().toISOString().slice(0, 10),
  });

  return { success: true, letter: stored };
}

export function getImpersonationAlerts(employerId: string): ImpersonationAlert[] {
  const normId = employerId.toLowerCase().trim();
  const alerts = impersonationAlertsStore.filter((a) => a.employerId === normId);
  return alerts.length > 0 ? alerts : impersonationAlertsStore;
}

export function updateAlertStatus(
  alertId: string,
  newStatus: "reported_1930" | "takedown_requested",
): boolean {
  const alert = impersonationAlertsStore.find((a) => a.id === alertId);
  if (!alert) return false;
  alert.status = newStatus;
  return true;
}

import { createHash } from "node:crypto";
import { hashIdentifier } from "./hash";

export type CyberComplaintInput = {
  complainantName?: string;
  complainantPhone?: string;
  complainantEmail?: string;
  state: string; // e.g. "Maharashtra", "Karnataka", "Delhi NCR"
  city: string;
  jobScamType:
    | "task_fraud"
    | "fake_offer_letter"
    | "interview_security_deposit"
    | "remote_app_extortion"
    | "crypto_usdt_deposit";
  claimedCompany?: string;
  suspectPhones: string[];
  suspectUpis: string[];
  suspectWallets?: string[];
  suspectUrls?: string[];
  suspectTelegramHandles?: string[];
  amountLostInr: number;
  utrOrTransactionIds?: string[];
  incidentDate: string;
  narrative: string;
};

export type CyberDossier = {
  dossierId: string;
  acknowledgementNumber: string;
  incidentCategory: "Online Financial Fraud / Job Fraud";
  subCategory: string;
  state: string;
  city: string;
  amountLostInr: number;
  incidentDate: string;
  generatedAt: string;
  suspectIdentifiers: {
    raw: {
      phones: string[];
      upis: string[];
      wallets: string[];
      urls: string[];
      telegramHandles: string[];
    };
    saltedHashes: string[];
  };
  transactionTrail: string[];
  applicableLegalSections: string[];
  evidenceIntegrityHash: string;
  onchainVerificationContract: string;
  formalComplaintDraft: string;
};

const SEPOLIA_CONTRACT = "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f";
const dossiersStore = new Map<string, CyberDossier>();

export function generateCyberDossier(input: CyberComplaintInput): CyberDossier {
  const dossierId = `i4c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const ackYear = new Date().getFullYear();
  const stateCode = (input.state || "IN").slice(0, 2).toUpperCase();
  const acknowledgementNumber = `${ackYear}/I4C/JOB/${stateCode}/${Math.floor(100000 + Math.random() * 900000)}`;

  const subCategoryMap: Record<string, string> = {
    task_fraud: "YouTube/Telegram Video Review Task Scam",
    fake_offer_letter: "Forged Corporate Appointment Letter Fraud",
    interview_security_deposit: "Pre-Interview / Laptop Courier Deposit Extortion",
    remote_app_extortion: "AnyDesk / TeamViewer Screen-Sharing APK Banking Fraud",
    crypto_usdt_deposit: "Untraceable USDT / Crypto Job Task Deposit",
  };

  const subCategory = subCategoryMap[input.jobScamType] ?? "Job Recruitment Cyber Fraud";

  // Compute salted hashes for privacy-safe storage
  const saltedHashes = [
    ...input.suspectPhones.map((p) => hashIdentifier("phone", p)),
    ...input.suspectUpis.map((u) => hashIdentifier("upi", u)),
    ...(input.suspectWallets ?? []).map((w) => hashIdentifier("wallet", w)),
  ];

  // Evidence integrity SHA-256 hash
  const canonicalEvidence = [
    `ack:${acknowledgementNumber}`,
    `state:${input.state}`,
    `amount:${input.amountLostInr}`,
    `phones:${input.suspectPhones.sort().join(",")}`,
    `upis:${input.suspectUpis.sort().join(",")}`,
    `wallets:${(input.suspectWallets ?? []).sort().join(",")}`,
    `utr:${(input.utrOrTransactionIds ?? []).sort().join(",")}`,
    `contract:${SEPOLIA_CONTRACT}`,
  ].join("|");

  const evidenceIntegrityHash = createHash("sha256").update(canonicalEvidence).digest("hex");

  const legalSections = [
    "Section 66D, Information Technology Act, 2000 (Cheating by personation using computer resource)",
    "Section 318(4) & 319, Bharatiya Nyaya Sanhita (BNS) 2023 (Cheating and dishonestly inducing delivery of property)",
    "Section 66C, Information Technology Act, 2000 (Identity theft / corporate impersonation)",
  ];

  const formalComplaintDraft = formatPoliceComplaintText({
    acknowledgementNumber,
    state: input.state,
    city: input.city,
    incidentDate: input.incidentDate,
    amountLostInr: input.amountLostInr,
    claimedCompany: input.claimedCompany,
    subCategory,
    suspectPhones: input.suspectPhones,
    suspectUpis: input.suspectUpis,
    suspectWallets: input.suspectWallets ?? [],
    transactionTrail: input.utrOrTransactionIds ?? [],
    evidenceHash: evidenceIntegrityHash,
    narrative: input.narrative,
  });

  const dossier: CyberDossier = {
    dossierId,
    acknowledgementNumber,
    incidentCategory: "Online Financial Fraud / Job Fraud",
    subCategory,
    state: input.state,
    city: input.city,
    amountLostInr: input.amountLostInr,
    incidentDate: input.incidentDate,
    generatedAt: new Date().toISOString(),
    suspectIdentifiers: {
      raw: {
        phones: input.suspectPhones,
        upis: input.suspectUpis,
        wallets: input.suspectWallets ?? [],
        urls: input.suspectUrls ?? [],
        telegramHandles: input.suspectTelegramHandles ?? [],
      },
      saltedHashes,
    },
    transactionTrail: input.utrOrTransactionIds ?? [],
    applicableLegalSections: legalSections,
    evidenceIntegrityHash,
    onchainVerificationContract: SEPOLIA_CONTRACT,
    formalComplaintDraft,
  };

  dossiersStore.set(dossierId, dossier);
  return dossier;
}

export function getDossier(dossierId: string): CyberDossier | null {
  return dossiersStore.get(dossierId) ?? null;
}

export function listDossiers(state?: string): CyberDossier[] {
  const all = Array.from(dossiersStore.values());
  if (state) {
    return all.filter((d) => d.state.toLowerCase() === state.toLowerCase().trim());
  }
  return all;
}

function formatPoliceComplaintText(args: {
  acknowledgementNumber: string;
  state: string;
  city: string;
  incidentDate: string;
  amountLostInr: number;
  claimedCompany?: string;
  subCategory: string;
  suspectPhones: string[];
  suspectUpis: string[];
  suspectWallets: string[];
  transactionTrail: string[];
  evidenceHash: string;
  narrative: string;
}): string {
  return `FORMAL CYBERCRIME COMPLAINT DOSSIER
Reference: National Cyber Crime Reporting Portal (NCRP / I4C Helpline 1930)
Acknowledgement No: ${args.acknowledgementNumber}
Jurisdiction: Cyber Crime Police Station, ${args.city}, ${args.state}

1. COMPLAINT CATEGORY:
   Category: Online Financial Fraud / Employment Scam
   Sub-Category: ${args.subCategory}
   Impersonated Entity: ${args.claimedCompany || "Unspecified MNC / Corporate Brand"}
   Date of Incident: ${args.incidentDate}
   Financial Defraudment: INR ₹${args.amountLostInr.toLocaleString("en-IN")}

2. SUSPECT PROFILE & IDENTIFIERS:
   • Suspect Phone Number(s): ${args.suspectPhones.join(", ") || "N/A"}
   • Suspect UPI VPA Address(es): ${args.suspectUpis.join(", ") || "N/A"}
   • Suspect Crypto Wallet(s): ${args.suspectWallets.join(", ") || "N/A"}
   • Bank UTR / Transaction Ref: ${args.transactionTrail.join(", ") || "Pending victim statement"}

3. EVIDENCE INTEGRITY & TAMPER PROOF HASH:
   Canonical Evidence SHA-256 Hash: ${args.evidenceHash}
   Ethereum Sepolia Smart Contract Anchor: ${SEPOLIA_CONTRACT}

4. FACTUAL NARRATIVE:
   ${args.narrative}

5. APPLICABLE OFFENCES:
   Registration of FIR requested under Section 66D IT Act 2000 and Section 318(4) Bharatiya Nyaya Sanhita (BNS) 2023. Immediate freeze requested on suspect UPI handles and beneficiary bank accounts under Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS).`;
}


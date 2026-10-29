export type Verdict = "safe" | "suspicious" | "scam";

export type Severity = "low" | "medium" | "high" | "blocking";

export type IdentifierKind =
  | "phone"
  | "upi"
  | "email"
  | "domain"
  | "url"
  | "wallet"
  | "telegram";

export type Hit = {
  id: string;
  severity: Severity;
  reason: string;
};

export type FeeRequested = {
  amount: number | null;
  purpose: string | null;
};

/** Structured fields extracted from a message. */
export type Fields = {
  company_claimed: string | null;
  recruiter_name: string | null;
  phones: string[];
  emails: string[];
  upi_ids: string[];
  urls: string[];
  wallet_addresses: string[];
  telegram_handles: string[];
  role: string | null;
  salary_text: string | null;
  fee_requested: FeeRequested | null;
  asks_for: string[];
  channel: Channel;
  language: string;
};

export type Channel = "web" | "telegram" | "whatsapp" | "extension" | "email";

export type GraphResult = {
  linkedReports: number;
  cities: number;
  confirmedLinks: number;
  reportedCount: number;
  path: string[];
};

export type Reason = { id: string; text: string };

export type CheckResult = {
  checkId: string;
  verdict: Verdict;
  confidence: number;
  reasons: Reason[];
  graph: GraphResult;
  nextStep: string;
  demoSources: string[];
  shareUrl: string;
  cached: boolean;
};

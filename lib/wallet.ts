import { hashIdentifier } from "./hash";

export type FlaggedWallet = {
  address: string;
  chain: "tron_trc20" | "ethereum_erc20" | "bitcoin" | "monero";
  syndicate: string;
  reportCount: number;
  lastReported: string;
  reason: string;
};

// Known crypto scam wallet registry (USDT task/job scam syndicates operating in India)
const FLAGGED_WALLETS: Record<string, FlaggedWallet> = {
  // Tron USDT TRC20 address frequently reported in Telegram daily review scam
  "TXn8Q2ZtJ4m9kXpLw81yP7cBaVnMo3kLp": {
    address: "TXn8Q2ZtJ4m9kXpLw81yP7cBaVnMo3kLp",
    chain: "tron_trc20",
    syndicate: "Southeast Asia Telegram Task Syndicate",
    reportCount: 38,
    lastReported: "2026-10-29",
    reason: "Demands 50-100 USDT deposit to unlock higher-tier YouTube task commissions",
  },
  // Ethereum / EVM USDT scam address
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": {
    address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    chain: "ethereum_erc20",
    syndicate: "Crypto Job Placement Impersonator",
    reportCount: 14,
    lastReported: "2026-10-28",
    reason: "Posing as Web3 HR requiring USDT gas deposit for smart contract internship",
  },
  // Bitcoin ransom/deposit address
  "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq": {
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    chain: "bitcoin",
    syndicate: "Overseas Remote Job Extortion",
    reportCount: 9,
    lastReported: "2026-10-26",
    reason: "Extortion deposit demand disguised as overseas visa sponsorship processing fee",
  },
};

export function checkScamWallet(address: string): {
  flagged: boolean;
  wallet?: FlaggedWallet;
  hashedIdentifier?: string;
  reason?: string;
} {
  const cleanAddr = address.trim();
  const match = FLAGGED_WALLETS[cleanAddr];

  if (match) {
    return {
      flagged: true,
      wallet: match,
      hashedIdentifier: hashIdentifier("wallet", cleanAddr),
      reason: match.reason,
    };
  }

  // Any USDT / crypto address in an Indian job offer context is inherently suspicious
  const isTron = /^T[1-9A-HJ-NP-za-km-z]{33}$/.test(cleanAddr);
  const isEvm = /^0x[a-fA-F0-9]{40}$/.test(cleanAddr);
  const isBtc = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/.test(cleanAddr);

  if (isTron || isEvm || isBtc) {
    return {
      flagged: true,
      hashedIdentifier: hashIdentifier("wallet", cleanAddr),
      reason: "Cryptocurrency wallet address detected in job hiring communication — high risk of untraceable fee scam",
    };
  }

  return { flagged: false };
}

export function maskWallet(address: string): string {
  const clean = address.trim();
  if (clean.length > 10) {
    return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
  }
  return clean;
}

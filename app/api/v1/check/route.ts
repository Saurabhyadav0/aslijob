import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key";
import { runCheck } from "@/lib/check";
import { checkScamWallet } from "@/lib/wallet";
import { hashIdentifier } from "@/lib/hash";
import { queryFraudGraph } from "@/lib/tigergraph";
import type { IdentifierKind } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. API Key Authentication Gate
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization");
  const auth = validateApiKey(apiKey);

  if (!auth.valid || !auth.partner) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: auth.error ?? "Unauthorized API access",
        },
      },
      { status: 401 },
    );
  }

  // 2. Parse request payload
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "bad_request", message: "Request body must be JSON" } },
      { status: 400 },
    );
  }

  const { identifier, type, text } = body;

  // 3. Single Identifier Lookup (e.g. Bank verifying a beneficiary UPI/phone/wallet)
  if (identifier && type) {
    const saltedHash = hashIdentifier(type, identifier);
    let isFlagged = false;
    let reasons: string[] = [];
    let reportCount = 0;
    let riskScore = 10;

    // Check crypto wallet specifically
    if (type === "wallet" || /^T[1-9A-HJ-NP-za-km-z]{33}$/.test(identifier) || /^0x[a-fA-F0-9]{40}$/.test(identifier)) {
      const walletResult = checkScamWallet(identifier);
      if (walletResult.flagged) {
        isFlagged = true;
        reasons.push(walletResult.reason ?? "Flagged crypto wallet address");
        reportCount = walletResult.wallet?.reportCount ?? 5;
        riskScore = 90;
      }
    }

    // Graph neighbourhood lookup (TigerGraph / Postgres fallback)
    const validKind: IdentifierKind = (
      ["phone", "upi", "url", "email", "wallet", "telegram"].includes(type)
        ? type
        : "phone"
    ) as IdentifierKind;

    const graphRes = await queryFraudGraph([{ kind: validKind, value: identifier }]);
    if (graphRes.linkedReports > 0 || graphRes.confirmedLinks > 0) {
      isFlagged = true;
      riskScore = Math.max(riskScore, 85);
      reasons.push(
        `Connected to ${graphRes.linkedReports} confirmed scam reports across ${graphRes.cities} cities`,
      );
      reportCount = Math.max(reportCount, graphRes.linkedReports);
    }

    return NextResponse.json({
      status: isFlagged ? "flagged" : "clean",
      riskLevel: riskScore >= 75 ? "scam" : riskScore >= 40 ? "suspicious" : "safe",
      riskScore,
      saltedHash,
      reasons,
      reportCount,
      partner: {
        id: auth.partner.partnerId,
        tier: auth.partner.tier,
      },
      checkedAt: new Date().toISOString(),
    });
  }

  // 4. Full Text / Job Description Lookup (e.g. Job board screening a listing)
  if (text) {
    const result = await runCheck({
      text: String(text),
      channel: "web",
    });

    const isFlagged = result.verdict !== "safe";
    const riskScore =
      result.verdict === "scam"
        ? Math.round(result.confidence * 100)
        : result.verdict === "suspicious"
        ? Math.round(result.confidence * 75)
        : Math.round((1 - result.confidence) * 20);

    return NextResponse.json({
      status: isFlagged ? "flagged" : "clean",
      riskLevel: result.verdict,
      riskScore,
      confidence: result.confidence,
      reasons: result.reasons.map((r) => r.text),
      reportCount: result.graph.linkedReports,
      shareUrl: result.shareUrl,
      partner: {
        id: auth.partner.partnerId,
        tier: auth.partner.tier,
      },
      checkedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    {
      error: {
        code: "invalid_parameters",
        message: "Must provide either 'text' or both 'identifier' and 'type'",
      },
    },
    { status: 400 },
  );
}

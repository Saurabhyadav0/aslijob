import { NextResponse } from "next/server";
import { getCheck } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const check = getCheck(params.id);
  if (!check) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Check not found" } },
      { status: 404 },
    );
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format");
  const accept = req.headers.get("accept") ?? "";

  // Support JSON payload for UI consumers
  if (format === "json" || accept.includes("application/json")) {
    return NextResponse.json({
      checkId: check.checkId,
      verdict: check.verdict,
      confidence: check.confidence,
      headline: headlineFor(check.verdict),
      mainReason: check.reasons[0]?.text ?? "No red flags found",
      shareUrl: check.shareUrl,
      nextStep: check.nextStep,
    });
  }

  // Generate SVG Share Card image ready for WhatsApp/social groups
  const svg = generateCardSvg(check);
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function headlineFor(verdict: string): string {
  switch (verdict) {
    case "scam":
      return "⚠️ SCAM WARNING — DO NOT PAY";
    case "suspicious":
      return "⚠️ SUSPICIOUS OFFER — VERIFY FIRST";
    default:
      return "✅ NO IMMEDIATE RED FLAGS";
  }
}

function colorFor(verdict: string): { bg: string; badge: string; text: string } {
  switch (verdict) {
    case "scam":
      return { bg: "#7F1D1D", badge: "#EF4444", text: "#FFFFFF" };
    case "suspicious":
      return { bg: "#78350F", badge: "#F59E0B", text: "#FFFFFF" };
    default:
      return { bg: "#064E3B", badge: "#10B981", text: "#FFFFFF" };
  }
}

function generateCardSvg(check: ReturnType<typeof getCheck> & object): string {
  const colors = colorFor(check.verdict);
  const headline = headlineFor(check.verdict);
  const mainReason = escapeXml(check.reasons[0]?.text ?? "Stay cautious and verify with employer");
  const verdictUpper = check.verdict.toUpperCase();

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="${colors.bg}" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#cardGrad)" rx="24"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#334155" stroke-width="2" rx="16"/>

  <!-- Logo & Title -->
  <text x="80" y="110" font-family="system-ui, sans-serif" font-size="36" font-weight="800" fill="#F8FAFC">
    AsliJob <tspan fill="#38BDF8">| Scam Checker</tspan>
  </text>
  <text x="80" y="145" font-family="system-ui, sans-serif" font-size="20" fill="#94A3B8">
    Verified Job Fraud Intelligence (cybercrime.gov.in / 1930)
  </text>

  <!-- Verdict Badge -->
  <rect x="80" y="190" width="300" height="64" rx="12" fill="${colors.badge}"/>
  <text x="230" y="234" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="${colors.text}" text-anchor="middle">
    ${verdictUpper}
  </text>

  <!-- Headline -->
  <text x="80" y="310" font-family="system-ui, sans-serif" font-size="38" font-weight="700" fill="#F8FAFC">
    ${escapeXml(headline)}
  </text>

  <!-- Main Reason -->
  <text x="80" y="380" font-family="system-ui, sans-serif" font-size="28" fill="#E2E8F0">
    • ${mainReason}
  </text>

  ${check.graph?.confirmedLinks > 0 ? `
  <text x="80" y="430" font-family="system-ui, sans-serif" font-size="24" fill="#FCA5A5">
    • Connected to ${check.graph.confirmedLinks} confirmed scam reports across ${check.graph.cities} cities
  </text>` : ""}

  <!-- Footer Advice & Link -->
  <rect x="80" y="480" width="1040" height="70" rx="10" fill="#1E293B" opacity="0.8"/>
  <text x="110" y="525" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#38BDF8">
    ${escapeXml(check.nextStep)}
  </text>
  <text x="1100" y="525" font-family="system-ui, sans-serif" font-size="18" fill="#64748B" text-anchor="end">
    aslijob.in/r/${check.checkId.slice(0, 8)}
  </text>
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

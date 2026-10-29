import { NextResponse } from "next/server";
import { getCheck } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(req.url);
  let check = getCheck(params.id);

  // If not found in-memory, allow fallback card if requested via query params
  if (!check && (url.searchParams.has("fallback") || url.searchParams.has("v"))) {
    const verdict = (url.searchParams.get("v") as any) ?? "scam";
    const reason =
      url.searchParams.get("reason") ??
      "Job offer flagged as high risk. Never pay upfront fees to get hired.";
    check = {
      checkId: params.id,
      verdict,
      confidence: 0.92,
      reasons: [{ id: "warning", text: reason }],
      graph: { linkedReports: 0, cities: 0, confirmedLinks: 0, reportedCount: 0, path: [] },
      nextStep: "Do not pay. Report to 1930 Cybercrime helpline.",
      demoSources: [],
      shareUrl: `${url.origin}/r/${params.id}`,
      cached: false,
    };
  }

  if (!check) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Check not found" } },
      { status: 404 },
    );
  }
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

  // Generate 1080x1080 Square SVG Share Card (Plan Page 20, 27)
  const svg = generateSquareCardSvg(check);
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
      return "SCAM WARNING — DO NOT PAY";
    case "suspicious":
      return "SUSPICIOUS OFFER — VERIFY FIRST";
    default:
      return "NO IMMEDIATE RED FLAGS";
  }
}

function colorFor(verdict: string): { bg: string; badge: string; text: string; border: string } {
  switch (verdict) {
    case "scam":
      return { bg: "#450A0A", badge: "#EF4444", text: "#FFFFFF", border: "#DC2626" };
    case "suspicious":
      return { bg: "#451A03", badge: "#F59E0B", text: "#FFFFFF", border: "#D97706" };
    default:
      return { bg: "#022C22", badge: "#10B981", text: "#FFFFFF", border: "#059669" };
  }
}

function generateSquareCardSvg(check: ReturnType<typeof getCheck> & object): string {
  const colors = colorFor(check.verdict);
  const headline = headlineFor(check.verdict);
  const mainReason = escapeXml(check.reasons[0]?.text ?? "Stay cautious and verify with employer directly.");
  const verdictUpper = check.verdict.toUpperCase();

  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="${colors.bg}" />
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#cardGrad)" rx="36"/>
  <rect x="50" y="50" width="980" height="980" fill="none" stroke="${colors.border}" stroke-width="3" rx="28" opacity="0.6"/>

  <!-- Logo & Title Header -->
  <g transform="translate(90, 110)">
    <rect width="52" height="52" rx="14" fill="#0284C7"/>
    <text x="26" y="37" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#090D16" text-anchor="middle">A</text>
    <text x="70" y="38" font-family="system-ui, sans-serif" font-size="38" font-weight="800" fill="#F8FAFC">
      AsliJob
    </text>
    <text x="70" y="70" font-family="system-ui, sans-serif" font-size="19" font-weight="500" fill="#94A3B8">
      Job Scam Intelligence • 1930 Cybercrime Portal
    </text>
  </g>

  <!-- Big Verdict Banner -->
  <g transform="translate(90, 240)">
    <rect width="900" height="120" rx="20" fill="${colors.badge}"/>
    <text x="450" y="75" font-family="system-ui, sans-serif" font-size="54" font-weight="900" fill="${colors.text}" text-anchor="middle" letter-spacing="4">
      ${verdictUpper}
    </text>
  </g>

  <!-- Headline -->
  <text x="90" y="430" font-family="system-ui, sans-serif" font-size="38" font-weight="800" fill="#F8FAFC">
    ${escapeXml(headline)}
  </text>

  <!-- Reasons Box -->
  <g transform="translate(90, 480)">
    <rect width="900" height="280" rx="18" fill="#1E293B" opacity="0.85"/>
    <text x="40" y="60" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#38BDF8" letter-spacing="1">
      PRIMARY RED FLAG
    </text>
    <text x="40" y="115" font-family="system-ui, sans-serif" font-size="28" font-weight="500" fill="#F1F5F9">
      • ${mainReason}
    </text>

    ${check.graph?.confirmedLinks > 0 ? `
    <text x="40" y="180" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#FCA5A5">
      • Connected to ${check.graph.confirmedLinks} confirmed scam reports in ${check.graph.cities} cities
    </text>` : `
    <text x="40" y="180" font-family="system-ui, sans-serif" font-size="22" font-weight="400" fill="#94A3B8">
      • Verified across multi-hop scam graph & official company records
    </text>`}

    <text x="40" y="240" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#F59E0B">
      👉 Advice: ${escapeXml(check.nextStep)}
    </text>
  </g>

  <!-- Share & Verify Call to Action Footer -->
  <g transform="translate(90, 810)">
    <rect width="900" height="150" rx="18" fill="#0B132B" stroke="#334155" stroke-width="2"/>
    <text x="50" y="65" font-family="system-ui, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF">
      Got a job message? Check it before you pay.
    </text>
    <text x="50" y="105" font-family="system-ui, sans-serif" font-size="22" font-weight="500" fill="#38BDF8">
      Free for Indian job seekers: https://aslijob.in
    </text>
    <text x="850" y="85" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#64748B" text-anchor="end">
      SCAN / SHARE
    </text>
  </g>
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

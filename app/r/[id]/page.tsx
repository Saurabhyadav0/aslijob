import Link from "next/link";
import { getCheck } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function ResultPage({ params }: { params: { id: string } }) {
  const check = getCheck(params.id);

  if (!check) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Check Not Found</h1>
          <p className="text-slate-400 mb-6">
            This scam report or check may have expired or is not stored in memory.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 font-medium text-slate-950 transition"
          >
            Check a new offer
          </Link>
        </div>
      </main>
    );
  }

  const badgeColors: Record<string, string> = {
    scam: "bg-red-500/10 text-red-400 border-red-500/30",
    suspicious: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    safe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="max-w-xl w-full my-6 space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            Asli<span className="text-sky-400">Job</span>
          </Link>
          <span className="text-xs uppercase tracking-wider text-slate-400">
            Scam Risk Assessment
          </span>
        </div>

        {/* Verdict Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span
              className={`px-3.5 py-1 text-sm font-semibold uppercase tracking-wider border rounded-full ${
                badgeColors[check.verdict] ?? "bg-slate-800 text-slate-200"
              }`}
            >
              {check.verdict}
            </span>
            <span className="text-xs text-slate-400">
              Confidence: {Math.round(check.confidence * 100)}%
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              {check.verdict === "scam"
                ? "🚨 Confirmed Scam Signal"
                : check.verdict === "suspicious"
                ? "⚠️ Suspicious Signals Detected"
                : "✅ No Red Flags Found"}
            </h2>
            <p className="mt-1.5 text-slate-400 text-sm">{check.nextStep}</p>
          </div>

          {/* Reasons */}
          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reasons & Red Flags
            </h3>
            <ul className="space-y-2">
              {check.reasons.map((r, i) => (
                <li
                  key={i}
                  className="text-sm bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-300 flex items-start space-x-2"
                >
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fraud graph links if present */}
          {(check.graph.confirmedLinks > 0 || check.graph.reportedCount > 0) && (
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 text-xs text-red-200 space-y-1">
              <p className="font-semibold text-red-300">🕸️ Fraud Network Correlation:</p>
              <p>
                Linked to {check.graph.linkedReports || check.graph.reportedCount} reports across{" "}
                {check.graph.cities || 1} cities.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `⚠️ AsliJob Warning: ${check.reasons[0]?.text ?? "Scam alert"}. Check details: ${check.shareUrl}?ref=wa`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <span>💬</span>
              <span>Share on WhatsApp</span>
            </a>

            <Link
              href={`/report?checkId=${check.checkId}`}
              className="flex-1 text-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <span>🚨</span>
              <span>Report to 1930</span>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <a
              href={`/api/share/${check.checkId}`}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline"
            >
              🖼️ Open Warning Image Card
            </a>
            <Link href="/" className="text-slate-400 hover:text-slate-200">
              Check another offer →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

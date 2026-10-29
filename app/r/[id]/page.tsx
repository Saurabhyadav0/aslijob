import { notFound } from "next/navigation";
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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center">
      <div className="max-w-xl w-full my-8 space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Asli<span className="text-sky-400">Job</span>
          </Link>
          <span className="text-xs uppercase tracking-wider text-slate-400">
            Fraud Risk Assessment
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
                ? "Confirmed / High-Risk Scam"
                : check.verdict === "suspicious"
                ? "Suspicious Signals Detected"
                : "No Red Flags Found"}
            </h2>
            <p className="mt-1 text-slate-400 text-sm">{check.nextStep}</p>
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
          {check.graph.confirmedLinks > 0 && (
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 text-xs text-red-200 space-y-1">
              <p className="font-semibold">Fraud Network Correlation:</p>
              <p>
                Linked to {check.graph.linkedReports} confirmed reports in{" "}
                {check.graph.cities} cities.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={`/api/share/${check.checkId}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-sm transition"
            >
              Open Warning Card Image
            </a>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 font-medium text-sm text-center transition"
            >
              Check another offer
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

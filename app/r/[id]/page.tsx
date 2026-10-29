import Link from "next/link";
import { getCheck } from "@/lib/store";
import GraphView from "@/components/GraphView";

export const dynamic = "force-dynamic";

export default function ResultPage({ params }: { params: { id: string } }) {
  const check = getCheck(params.id);

  if (!check) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/80 border border-white/[0.08] rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="text-3xl">🔍</div>
          <h1 className="text-xl font-bold text-white">Check Record Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            This verification link may have expired or is not stored in active memory.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 font-bold text-xs text-slate-950 transition-all duration-150 active:scale-95 shadow-md shadow-sky-500/20"
          >
            Check a new offer
          </Link>
        </div>
      </main>
    );
  }

  const badgeColors: Record<string, { badge: string; banner: string; glow: string; icon: string }> = {
    scam: {
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      banner: "bg-rose-950/30 border-rose-500/30",
      glow: "shadow-[0_0_30px_-5px_rgba(244,63,94,0.2)]",
      icon: "✕",
    },
    suspicious: {
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      banner: "bg-amber-950/30 border-amber-500/30",
      glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]",
      icon: "!",
    },
    safe: {
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      banner: "bg-emerald-950/30 border-emerald-500/30",
      glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]",
      icon: "✓",
    },
  };

  const style = badgeColors[check.verdict] ?? badgeColors.suspicious;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="max-w-xl w-full my-6 space-y-6">
        {/* Brand */}
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-black text-slate-950 shadow-md shadow-sky-500/20 ring-1 ring-white/20">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Asli<span className="text-sky-400">Job</span>
            </span>
          </Link>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Scam Risk Assessment
          </span>
        </header>

        {/* Verdict Box */}
        <div className={`rounded-3xl border ${style.banner} ${style.glow} p-6 sm:p-8 space-y-6 shadow-xl`}>
          <div className="flex items-center justify-between">
            <span
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider border rounded-full ${style.badge}`}
            >
              {check.verdict}
            </span>
            <span className="text-xs font-bold text-slate-400 tabular-nums">
              Confidence: {Math.round(check.confidence * 100)}%
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Fraud Signals Detected
            </h2>
            <ul className="space-y-2">
              {check.reasons.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-slate-900/80 p-4 text-xs text-slate-200 leading-relaxed shadow-sm"
                >
                  <span className="text-sky-400 font-bold mt-0.5">•</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2-Hop Network Graph */}
          <GraphView graph={check.graph} centralLabel={check.checkId.slice(0, 10)} />

          {/* Next Step */}
          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/40 p-4 text-xs font-semibold text-sky-200 leading-relaxed">
            👉 {check.nextStep}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `⚠️ AsliJob Warning Alert: ${check.reasons[0]?.text ?? "Scam warning"}. Details: ${check.shareUrl}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition-all duration-150 active:scale-[0.96] shadow-sm flex items-center justify-center gap-2"
            >
              <span>💬</span>
              <span>Warn Friends on WhatsApp</span>
            </a>

            <Link
              href="/"
              className="flex-1 text-center rounded-2xl border border-white/10 bg-slate-800 hover:bg-slate-700 py-3 text-xs font-bold text-white transition-all duration-150 active:scale-[0.96] shadow-sm flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              <span>Check Another Offer</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

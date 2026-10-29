import { verifyLetter } from "@/lib/letter";
import Link from "next/link";

export default function DirectVerifyPage({ params }: { params: { id: string } }) {
  const result = verifyLetter(params.id);

  return (
    <main className="space-y-6 py-6 pb-20">
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
          Onchain EAS Attestation
        </span>
      </header>

      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white sm:text-3xl">Offer Letter Verification</h1>
          <p className="font-mono text-xs text-sky-400">Offer ID: {params.id}</p>
        </div>

        {result.valid ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 space-y-5 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 text-2xl font-black border border-emerald-500/30 shadow-sm">
                ✓
              </span>
              <div>
                <h2 className="text-lg font-black text-emerald-200">
                  Verified Authentic by {result.company}
                </h2>
                <p className="text-xs text-emerald-400 font-medium">
                  EAS Merkle Attestation on Base Sepolia
                </p>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-emerald-900/40 pt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-emerald-900/20">
                <span className="text-slate-400">Candidate Role:</span>
                <span className="font-bold text-slate-100">{result.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/20">
                <span className="text-slate-400">Issued On:</span>
                <span className="font-mono text-slate-100">{result.issuedAt}</span>
              </div>
              <div className="flex flex-col gap-1 py-1">
                <span className="text-slate-400">Base Sepolia EAS UID:</span>
                <code className="text-[11px] font-mono text-sky-400 break-all bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                  {result.easUid}
                </code>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-6 sm:p-8 space-y-4 shadow-[0_0_30px_-5px_rgba(244,63,94,0.2)]">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 text-2xl font-black border border-rose-500/30 shadow-sm">
                ✕
              </span>
              <div>
                <h2 className="text-lg font-black text-rose-200">
                  Not Issued by this Company
                </h2>
                <p className="text-xs text-rose-400 font-medium">
                  {result.reason ?? "Tampered or forged offer letter"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This letter ID was not found in the verified company Merkle root on Base Sepolia. Do not make any payments.
            </p>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all duration-150 active:scale-95 shadow-sm"
          >
            ← Check another offer or letter
          </Link>
        </div>
      </div>
    </main>
  );
}

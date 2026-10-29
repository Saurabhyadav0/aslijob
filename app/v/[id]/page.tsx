import { verifyLetter } from "@/lib/letter";
import Link from "next/link";

export default function DirectVerifyPage({ params }: { params: { id: string } }) {
  const result = verifyLetter(params.id);

  return (
    <main className="space-y-6 py-8">
      <header className="border-b border-slate-800/80 pb-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Asli<span className="text-sky-400">Job</span>
        </Link>
      </header>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Offer Letter Verification</h1>
        <p className="font-mono text-xs text-slate-400">ID: {params.id}</p>

        {result.valid ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-2xl font-black border border-emerald-500/40">
                ✓
              </span>
              <div>
                <h2 className="text-lg font-bold text-emerald-300">
                  Verified by {result.company}
                </h2>
                <p className="text-xs text-emerald-400/80">
                  EAS Merkle Attestation on Base Sepolia
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-emerald-900/40 pt-3 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-400">Role / Position:</span>{" "}
                <strong>{result.role}</strong>
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Attestation UID:</span>{" "}
                <code className="text-xs text-sky-400 break-all">{result.easUid}</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 text-2xl font-black border border-red-500/40">
                ✕
              </span>
              <div>
                <h2 className="text-lg font-bold text-red-300">
                  Not Issued by this Company
                </h2>
                <p className="text-xs text-red-400/80">
                  {result.reason ?? "Tampered or unverified offer letter"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
            ← Check another offer letter or job message
          </Link>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { translations, type Language } from "@/lib/i18n";
import type { VerifyResult } from "@/lib/letter";

export default function VerifyPage() {
  const [lang, setLang] = useState<Language>("en");
  const [letterId, setLetterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  async function handleVerify(overrideId?: string) {
    const idToVerify = overrideId ?? letterId;
    if (!idToVerify.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(idToVerify.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 pt-1">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-black text-slate-950 shadow-md shadow-sky-500/20 ring-1 ring-white/20">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Asli<span className="text-sky-400">Job</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-slate-900/90 p-1 text-xs">
          {(["en", "hi", "mr"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors duration-150 active:scale-95 ${
                lang === l ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
            </button>
          ))}
        </div>
      </header>

      {/* Title */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📜</span>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {t.letterVerifyTitle}
          </h1>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{t.letterVerifySubtitle}</p>
        <div className="flex items-center gap-2 pt-1 text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/40 px-3 py-1 font-mono text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sepolia Smart Contract:</span>
            <a
              href="https://sepolia.etherscan.io/address/0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline decoration-sky-400/50 hover:text-white"
            >
              0x6Fbc...D50f ↗
            </a>
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 rounded-2xl border border-white/[0.08] bg-slate-900/80 p-1 shadow-sm focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20">
            <input
              type="text"
              value={letterId}
              onChange={(e) => setLetterId(e.target.value)}
              placeholder={t.letterPlaceholder}
              className="w-full bg-transparent p-3 text-sm text-slate-100 placeholder-slate-500 outline-none font-mono"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={loading || !letterId.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition-all duration-150 hover:from-sky-300 hover:to-sky-400 active:scale-[0.96] disabled:opacity-40"
          >
            <span>🔍</span>
            <span>{loading ? "Checking EAS..." : "Verify Onchain"}</span>
          </button>
        </div>

        {/* Demo Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-0.5">
          <span className="font-medium text-slate-500">Test authentic letters:</span>
          <button
            type="button"
            onClick={() => {
              setLetterId("tcs-2026-4401");
              handleVerify("tcs-2026-4401");
            }}
            className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-emerald-300 font-mono text-[11px] hover:bg-emerald-950/60 transition-colors active:scale-95"
          >
            tcs-2026-4401 (Valid TCS)
          </button>
          <button
            type="button"
            onClick={() => {
              setLetterId("fake-infy-9999");
              handleVerify("fake-infy-9999");
            }}
            className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-rose-300 font-mono text-[11px] hover:bg-rose-950/60 transition-colors active:scale-95"
          >
            fake-infy-9999 (Forged)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs font-medium text-rose-300">
          ⚠️ {error}
        </div>
      )}
      

      {/* Verification Result Banner */}
      {result && (
        <section className="space-y-4 pt-2">
          {result.valid ? (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] p-6 space-y-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 text-2xl font-black border border-emerald-500/30 shadow-sm">
                  ✓
                </span>
                <div>
                  <h2 className="text-lg font-black text-emerald-200">
                    {result.company ? `Verified by ${result.company}` : t.letterValid}
                  </h2>
                  <p className="text-xs text-emerald-400 font-medium">
                    Anchored via Ethereum Attestation Service (EAS) on Base Sepolia
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-emerald-900/40 pt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-900/20">
                  <span className="text-slate-400">Position / Role:</span>
                  <span className="font-bold text-slate-100">{result.role}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/20">
                  <span className="text-slate-400">Offer ID:</span>
                  <span className="font-mono text-slate-100">{letterId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/20">
                  <span className="text-slate-400">Issued On:</span>
                  <span className="font-mono text-slate-100">{result.issuedAt}</span>
                </div>
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-slate-400">Base Sepolia EAS UID:</span>
                  <code className="text-[11px] font-mono text-sky-400 break-all bg-slate-950/60 p-2 rounded-xl border border-white/5">
                    {result.easUid}
                  </code>
                </div>
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-slate-400">Onchain Verifier Contract:</span>
                  <a
                    href="https://sepolia.etherscan.io/address/0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] font-mono text-emerald-400 break-all bg-slate-950/60 p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="truncate">0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f</span>
                    <span className="shrink-0 text-[10px] text-sky-400 font-sans font-semibold underline">View Contract on Etherscan ↗</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 shadow-[0_0_30px_-5px_rgba(244,63,94,0.2)] p-6 space-y-3">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 text-2xl font-black border border-rose-500/30 shadow-sm">
                  ✕
                </span>
                <div>
                  <h2 className="text-lg font-black text-rose-200">{t.letterInvalid}</h2>
                  <p className="text-xs text-rose-400 font-medium">
                    No matching EAS Merkle attestation registered on Base Sepolia.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                {result.reason ?? "This offer letter was never anchored by an authorized company recruiter key."}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

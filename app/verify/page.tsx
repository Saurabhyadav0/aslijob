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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-3 pt-2">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Asli<span className="text-sky-400">Job</span>
        </Link>
        <div className="flex gap-1 text-xs">
          {(["en", "hi", "mr"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded px-2 py-0.5 font-medium transition ${
                lang === l ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400"
              }`}
            >
              {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
            </button>
          ))}
        </div>
      </header>

      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📜</span>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t.letterVerifyTitle}</h1>
        </div>
        <p className="text-xs text-slate-400">{t.letterVerifySubtitle}</p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={letterId}
            onChange={(e) => setLetterId(e.target.value)}
            placeholder={t.letterPlaceholder}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 font-mono"
          />
          <button
            onClick={() => handleVerify()}
            disabled={loading || !letterId.trim()}
            className="rounded-xl bg-sky-500 px-5 text-sm font-bold text-slate-950 hover:bg-sky-400 transition disabled:opacity-40"
          >
            {loading ? "Checking..." : t.letterBtn}
          </button>
        </div>

        {/* Demo shortcuts */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Demo letters:</span>
          <button
            type="button"
            onClick={() => {
              setLetterId("TCS-2026-ENG-089");
              handleVerify("TCS-2026-ENG-089");
            }}
            className="rounded-md border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-emerald-300 hover:bg-emerald-950/60 transition"
          >
            TCS Offer Letter
          </button>
          <button
            type="button"
            onClick={() => {
              setLetterId("FAKE-LETTER-999");
              handleVerify("FAKE-LETTER-999");
            }}
            className="rounded-md border border-red-500/30 bg-red-950/30 px-2 py-0.5 text-red-300 hover:bg-red-950/60 transition"
          >
            Tampered Letter
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="animate-fadeIn space-y-4">
          {result.valid ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-xl font-black border border-emerald-500/40">
                  ✓
                </span>
                <div>
                  <div className="text-base font-bold text-emerald-300">
                    {t.letterValid}
                  </div>
                  <div className="text-xs text-emerald-400/80">
                    Onchain Base Sepolia EAS Attestation Confirmed
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-emerald-900/40 pt-3 text-xs">
                <div>
                  <span className="text-slate-400">Company:</span>
                  <p className="font-bold text-slate-200 text-sm">{result.company}</p>
                </div>
                <div>
                  <span className="text-slate-400">Designation / Role:</span>
                  <p className="font-bold text-slate-200 text-sm">{result.role}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">EAS Attestation UID:</span>
                  <p className="font-mono text-[11px] text-sky-400 truncate">
                    {result.easUid}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 text-xl font-black border border-red-500/40">
                  ✕
                </span>
                <div>
                  <div className="text-base font-bold text-red-300">
                    {t.letterInvalid}
                  </div>
                  <div className="text-xs text-red-400/80">
                    {result.reason ?? "No official record found in company registry"}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 border-t border-red-900/40 pt-2">
                ⚠️ Real companies in India (TCS, Infosys, Wipro, Accenture) issue offer letters directly from their career domains and do not demand payment.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 text-center">
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
          ← Back to Scam Checker
        </Link>
      </div>
    </div>
  );
}

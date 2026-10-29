"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations, type Language } from "@/lib/i18n";

function ReportContent() {
  const searchParams = useSearchParams();
  const checkId = searchParams.get("checkId") || "";

  const [lang, setLang] = useState<Language>("en");
  const [scamType, setScamType] = useState<"fee" | "task" | "fake_letter" | "overseas" | "other">("fee");
  const [amountLost, setAmountLost] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [complaintText, setComplaintText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkId) {
      setError("A valid check ID is required to report. Please run a check on the message first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkId,
          scamType,
          amountLost: amountLost ? parseInt(amountLost, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to submit report");
      setComplaintText(data.complaintText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (!complaintText) return;
    navigator.clipboard.writeText(complaintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="flex items-center gap-2 text-rose-400">
          <span className="text-xl">🚨</span>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {t.reportTitle}
          </h1>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{t.reportSubtitle}</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs font-semibold text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {!complaintText ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Check Reference */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 p-4 space-y-1 text-xs">
            <span className="text-slate-400 font-medium">Reporting for Check ID:</span>
            <div className="font-mono text-sky-400 truncate font-semibold">
              {checkId || "No check specified — please return to home"}
            </div>
          </div>

          {/* Scam Type Radio Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Scam Category
            </label>
            <div className="grid gap-2 text-xs">
              {[
                { id: "fee", label: "Registration / Training / Laptop Security Fee demand" },
                { id: "task", label: "Paid task / Telegram rating / Crypto arbitrage recharge" },
                { id: "fake_letter", label: "Forged offer letter impersonating TCS, Infosys, etc." },
                { id: "overseas", label: "Fake overseas / Canada / Dubai visa job package" },
                { id: "other", label: "Other deceptive recruitment fraud" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all duration-150 active:scale-[0.99] ${
                    scamType === opt.id
                      ? "border-sky-500/80 bg-sky-950/30 text-white ring-1 ring-sky-500/30 font-semibold"
                      : "border-white/[0.08] bg-slate-900/60 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="scamType"
                    value={opt.id}
                    checked={scamType === opt.id}
                    onChange={(e) => setScamType(e.target.value as any)}
                    className="accent-sky-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount Lost Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Amount Transferred / Demanded (₹ Optional)
            </label>
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/80 p-1 shadow-sm focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20">
              <input
                type="number"
                value={amountLost}
                onChange={(e) => setAmountLost(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full bg-transparent p-3 text-sm text-slate-100 placeholder-slate-500 outline-none tabular-nums"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !checkId}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 py-3.5 text-xs font-extrabold text-white transition-all duration-150 active:scale-[0.96] shadow-lg shadow-rose-600/20 disabled:opacity-40"
          >
            <span>🚨</span>
            <span>{submitting ? "Submitting to Fraud Graph..." : t.reportSubmit}</span>
          </button>
        </form>
      ) : (
        /* Ready 1930 Cybercrime Complaint Card */
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 text-xl font-black border border-emerald-500/30">
              ✓
            </span>
            <div>
              <h2 className="text-base font-extrabold text-white">Report Logged in Fraud Graph</h2>
              <p className="text-xs text-emerald-400 font-medium">Ready for National Cybercrime Portal (1930)</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your report has been logged and anchored into the shared fraud graph. Use this pre-filled 1930 Cybercrime complaint below:
          </p>

          <div className="rounded-2xl border border-white/[0.08] bg-slate-950/80 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto shadow-inner">
            {complaintText}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-2xl bg-sky-500 hover:bg-sky-400 py-3 text-xs font-bold text-slate-950 transition-all duration-150 active:scale-[0.96] shadow-sm flex items-center justify-center gap-2"
            >
              <span>📋</span>
              <span>{copied ? t.copied : t.btnCopy1930}</span>
            </button>

            <a
              href="tel:1930"
              className="flex-1 rounded-2xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-950/70 py-3 text-xs font-bold text-rose-200 transition-all duration-150 active:scale-[0.96] shadow-sm flex items-center justify-center gap-2"
            >
              <span>📞</span>
              <span>{t.btnCall1930}</span>
            </a>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-sky-400 hover:underline font-semibold">
              ← Check another offer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading complaint form...</div>}>
      <ReportContent />
    </Suspense>
  );
}

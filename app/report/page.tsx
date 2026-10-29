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
      setError("A valid check ID is required to report. Please check the message first.");
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
          <span className="text-2xl">🚨</span>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t.reportTitle}</h1>
        </div>
        <p className="text-xs text-slate-400">{t.reportSubtitle}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {!complaintText ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scam Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.reportTypeLabel}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "fee", label: "Registration / Training Fee" },
                { id: "task", label: "YouTube / Task Scam" },
                { id: "fake_letter", label: "Fake Offer Letter" },
                { id: "overseas", label: "Overseas Visa Fraud" },
                { id: "other", label: "Other Fraud" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setScamType(opt.id as any)}
                  className={`rounded-xl border p-3 text-left transition ${
                    scamType === opt.id
                      ? "border-sky-500 bg-sky-950/30 text-sky-200 font-semibold"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Lost Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.amountLostLabel}
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 2500"
              value={amountLost}
              onChange={(e) => setAmountLost(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !checkId}
            className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-3.5 text-sm font-bold text-white transition disabled:opacity-40"
          >
            {submitting ? "Submitting..." : t.reportSubmit}
          </button>
        </form>
      ) : (
        /* Ready 1930 Complaint Text Screen */
        <div className="space-y-4 animate-fadeIn">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300">
            ✅ <strong>{t.reportSuccess}</strong>. The suspect identifiers have been recorded in the fraud graph.
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Formal 1930 Complaint Draft</span>
              <span className="text-[11px] text-slate-500">Ready for cybercrime.gov.in</span>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs text-slate-300 leading-relaxed">
              {complaintText}
            </pre>
          </div>

          {/* Quick 1930 Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-400 py-3 text-xs font-bold text-slate-950 transition flex items-center justify-center gap-2"
            >
              <span>📋</span>
              <span>{copied ? t.copied : t.btnCopy1930}</span>
            </button>

            <a
              href="tel:1930"
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-3 text-xs font-bold text-white transition flex items-center justify-center gap-2 text-center"
            >
              <span>📞</span>
              <span>{t.btnCall1930}</span>
            </a>
          </div>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
              ← {t.btnCheckAnother}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading report form...</div>}>
      <ReportContent />
    </Suspense>
  );
}

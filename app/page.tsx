"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { translations, type Language } from "@/lib/i18n";
import type { CheckResult } from "@/lib/types";

const STYLES = {
  safe: {
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    banner: "bg-emerald-950/40 border-emerald-500/30",
    icon: "✓",
    labelKey: "verdictSafe" as const,
  },
  suspicious: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    banner: "bg-amber-950/40 border-amber-500/30",
    icon: "!",
    labelKey: "verdictSuspicious" as const,
  },
  scam: {
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
    banner: "bg-red-950/40 border-red-500/30",
    icon: "✕",
    labelKey: "verdictScam" as const,
  },
};

const SAMPLE_SCAM =
  "Congratulations! Selected for Amazon WFH Data Entry. Daily salary Rs 3,500. Pay Rs 1,500 refundable security deposit to hr.amazon@okhdfc or WhatsApp +91 9876543210 immediately. Limited seats!";

const SAMPLE_GENUINE =
  "Dear candidate, thank you for applying to Infosys. Your interview is scheduled for Friday at 10 AM. Please login to your candidate portal at career.infosys.com to check details.";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [tab, setTab] = useState<"paste" | "upload" | "direct">("paste");
  const [text, setText] = useState("");
  const [directInput, setDirectInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  // Check URL params for Android share_target (PWA)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sharedText = params.get("text") || params.get("title") || params.get("url");
      if (sharedText) {
        setText(sharedText);
        setTab("paste");
      }
    }
  }, []);

  // Animate checking steps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setCurrentStep(1);
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 350);
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  async function handleCheck(overridePayload?: Record<string, any>) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let body: any = {};
      if (overridePayload) {
        body = overridePayload;
      } else if (tab === "paste") {
        if (!text.trim()) throw new Error("Please enter text to check");
        body = { text, channel: "web", lang };
      } else if (tab === "direct") {
        if (!directInput.trim()) throw new Error("Please enter a phone number or UPI ID");
        const isPhone = /^[6-9]\d{9}$/.test(directInput.replace(/[\s+-]/g, ""));
        body = {
          identifier: {
            kind: isPhone ? "phone" : "upi",
            value: directInput.trim(),
          },
          channel: "web",
          lang,
        };
      }

      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Check failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selected);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData?.error?.message ?? "Failed to upload file");
      }

      await handleCheck({ fileId: uploadData.fileId, channel: "web", lang });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
      setLoading(false);
    }
  }

  const s = result ? STYLES[result.verdict] : null;

  return (
    <main className="space-y-6 pb-16">
      {/* Top Header & Language Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-3 pt-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 font-black text-slate-950">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Asli<span className="text-sky-400">Job</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs">
          {(["en", "hi", "mr"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded px-2.5 py-1 font-medium transition ${
                lang === l
                  ? "bg-sky-500 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
            </button>
          ))}
        </div>
      </header>

      {/* Live Counter & Scam Alert Strip */}
      <section className="flex flex-col sm:flex-row gap-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs">
        <div className="flex items-center gap-2 text-sky-400 font-medium">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t.bannerCount}</span>
        </div>
        <div className="hidden sm:inline text-slate-600">•</div>
        <div className="text-slate-400 truncate">
          ⚠️ <span className="text-slate-300">{t.bannerAlert}</span>
        </div>
      </section>

      {/* Main Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 sm:text-3xl">
          {t.title}
        </h1>
        <p className="text-sm text-slate-400">{t.subtitle}</p>
      </div>

      {/* Input Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs font-medium">
        <button
          onClick={() => {
            setTab("paste");
            setResult(null);
          }}
          className={`rounded-lg py-2 transition ${
            tab === "paste"
              ? "bg-slate-800 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.tabPaste}
        </button>
        <button
          onClick={() => {
            setTab("upload");
            setResult(null);
          }}
          className={`rounded-lg py-2 transition ${
            tab === "upload"
              ? "bg-slate-800 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.tabUpload}
        </button>
        <button
          onClick={() => {
            setTab("direct");
            setResult(null);
          }}
          className={`rounded-lg py-2 transition ${
            tab === "direct"
              ? "bg-slate-800 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.tabDirect}
        </button>
      </div>

      {/* Input Box based on Tab */}
      <section className="space-y-3">
        {tab === "paste" && (
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholderPaste}
              className="h-36 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {/* Quick Demo Shortcuts */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Try sample:</span>
              <button
                type="button"
                onClick={() => setText(SAMPLE_SCAM)}
                className="rounded-md border border-red-500/30 bg-red-950/30 px-2 py-0.5 text-red-300 hover:bg-red-950/60 transition"
              >
                Fake Amazon WFH
              </button>
              <button
                type="button"
                onClick={() => setText(SAMPLE_GENUINE)}
                className="rounded-md border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-emerald-300 hover:bg-emerald-950/60 transition"
              >
                Real Infosys Email
              </button>
            </div>
          </div>
        )}

        {tab === "upload" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-4 text-center transition hover:border-sky-500 hover:bg-slate-900"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="text-2xl mb-1">📸</div>
            <p className="text-sm font-medium text-slate-200">
              {file ? file.name : t.btnUpload}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">PNG, JPG or PDF up to 5MB</p>
          </div>
        )}

        {tab === "direct" && (
          <div className="space-y-2">
            <input
              type="text"
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              placeholder={t.placeholderDirect}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Try:</span>
              <button
                type="button"
                onClick={() => setDirectInput("9876543210")}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300 hover:bg-slate-700 transition"
              >
                9876543210
              </button>
              <button
                type="button"
                onClick={() => setDirectInput("fraud.recruiter@okhdfc")}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300 hover:bg-slate-700 transition"
              >
                fraud.recruiter@okhdfc
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        {tab !== "upload" && (
          <button
            onClick={() => handleCheck()}
            disabled={loading || (tab === "paste" ? !text.trim() : !directInput.trim())}
            className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400 disabled:opacity-40"
          >
            {loading ? t.btnChecking : t.btnCheck}
          </button>
        )}
      </section>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* F2: Checking Progression Steps */}
      {loading && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span>Analyzing message signals...</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {[t.step1, t.step2, t.step3, t.step4].map((stepText, idx) => {
              const stepNum = idx + 1;
              const isDone = currentStep > stepNum;
              const isActive = currentStep === stepNum;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 transition-all ${
                    isDone
                      ? "text-emerald-400 font-medium"
                      : isActive
                      ? "text-sky-300 font-medium"
                      : "text-slate-600"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isActive
                        ? "bg-sky-500/20 text-sky-400 animate-pulse"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? "✓" : stepNum}
                  </span>
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* F3: Verdict Result Card */}
      {result && s && !loading && (
        <section className="space-y-4">
          <div
            className={`rounded-2xl border ${s.banner} p-5 space-y-4 transition-all animate-fadeIn`}
          >
            {/* Header: Icon + Word + Confidence */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black border ${s.badge}`}
                >
                  {s.icon}
                </span>
                <div>
                  <div className="text-xl font-extrabold uppercase tracking-wide text-slate-100">
                    {t[s.labelKey]}
                  </div>
                  <div className="text-xs text-slate-400">
                    {Math.round(result.confidence * 100)}% confidence
                  </div>
                </div>
              </div>

              {result.cached && (
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  Cached
                </span>
              )}
            </div>

            {/* Reasons List */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.reasonsTitle}
              </h3>
              <ul className="space-y-2">
                {result.reasons.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/80 p-3 text-xs text-slate-200"
                  >
                    <span className="text-sky-400 font-bold mt-0.5">•</span>
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* F4: Scam Network View */}
            {(result.graph.confirmedLinks > 0 || result.graph.reportedCount > 0) && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3.5 space-y-1.5 text-xs text-red-200">
                <div className="flex items-center gap-1.5 font-bold text-red-300">
                  <span>🕸️</span>
                  <span>{t.networkTitle}</span>
                </div>
                <p>
                  {t.networkLinked(
                    result.graph.confirmedLinks || result.graph.reportedCount,
                    result.graph.cities || 1
                  )}
                </p>
                {result.graph.path.length > 0 && (
                  <div className="mt-1 text-[11px] text-red-300/80 truncate">
                    Trail: {result.graph.path.join(" → ")}
                  </div>
                )}
              </div>
            )}

            {/* Next Step Guidance */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs font-medium text-sky-300">
              👉 {result.nextStep}
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {/* WhatsApp Share Button */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `⚠️ AsliJob Scam Check Alert: ${result.reasons[0]?.text ?? "Suspicious offer"}. Details: ${result.shareUrl}?ref=wa`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
              >
                <span>💬</span>
                <span>{t.btnShare}</span>
              </a>

              {/* Report Button */}
              <Link
                href={`/report?checkId=${result.checkId}`}
                className="flex-1 text-center rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
              >
                <span>🚨</span>
                <span>{t.btnReport}</span>
              </Link>
            </div>

            {/* Share Card & Link Row */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <a
                href={`/api/share/${result.checkId}`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline"
              >
                🖼️ View Warning Image Card
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                {copied ? t.copied : "🔗 Copy Result Link"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Offer Letter Verification Banner */}
      <footer className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-200">{t.letterVerifyTitle}</div>
          <div className="text-[11px] text-slate-400">
            Check onchain Base Sepolia attestation for TCS, Infosys & Wipro.
          </div>
        </div>
        <Link
          href="/verify"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
        >
          {t.tabVerify} →
        </Link>
      </footer>
    </main>
  );
}

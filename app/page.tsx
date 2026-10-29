"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GraphView from "@/components/GraphView";
import { translations, type Language } from "@/lib/i18n";
import type { CheckResult } from "@/lib/types";

const STYLES = {
  safe: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    banner: "bg-emerald-950/30 border-emerald-500/30",
    glow: "shadow-[0_0_35px_-5px_rgba(16,185,129,0.22)]",
    icon: "✓",
    labelKey: "verdictSafe" as const,
  },
  suspicious: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    banner: "bg-amber-950/30 border-amber-500/30",
    glow: "shadow-[0_0_35px_-5px_rgba(245,158,11,0.22)]",
    icon: "!",
    labelKey: "verdictSuspicious" as const,
  },
  scam: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    banner: "bg-rose-950/30 border-rose-500/30",
    glow: "shadow-[0_0_35px_-5px_rgba(244,63,94,0.25)]",
    icon: "✕",
    labelKey: "verdictScam" as const,
  },
};

const SAMPLE_SCAM =
  "Congratulations! Selected for Amazon WFH Data Entry. Daily salary Rs 3,500. Pay Rs 1,500 refundable security deposit to hr.amazon@okhdfc or WhatsApp +91 9876543210 immediately. Limited seats!";

const SAMPLE_GENUINE =
  "Dear candidate, thank you for applying to Infosys. Your interview is scheduled for Friday at 10 AM. Please login to your candidate portal at career.infosys.com to check details.";

const LIVE_THREAT_FEED = [
  { company: "TCS India", fee: "₹2,500", type: "Laptop deposit fee", loc: "Pune", time: "2m ago", risk: "high" },
  { company: "Amazon WFH", fee: "₹1,500", type: "Telegram task recharge", loc: "Patna", time: "8m ago", risk: "high" },
  { company: "Infosys HR", fee: "₹4,200", type: "Forged appointment letter", loc: "Indore", time: "14m ago", risk: "high" },
  { company: "Flipkart Logistics", fee: "₹3,000", type: "Gate pass fee", loc: "Noida", time: "22m ago", risk: "medium" },
];

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
    <div className="space-y-8 pb-16">
      {/* Top Navbar */}
      <header className="flex items-center justify-between border-b border-white/[0.08] pb-4 pt-1">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-sm font-black text-slate-950 shadow-lg shadow-sky-500/20 ring-1 ring-white/20 transition-transform duration-150 group-hover:scale-105">
              A
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Asli<span className="text-sky-400">Job</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/5">
                Cyber Defense
              </span>
            </div>
          </Link>

          {/* Quick Nav Links on Desktop */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-400">
            <Link href="/pricing" className="hover:text-white transition-colors">
              Campus Plans (Dodo)
            </Link>
            <Link href="/verify" className="hover:text-white transition-colors">
              Base EAS Letters
            </Link>
            <a
              href="https://web.telegram.org/k/#@AsliJobBot"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 font-bold"
            >
              <span>🤖 Telegram Bot</span>
              <span className="text-[10px]">↗</span>
            </a>
          </nav>
        </div>

        {/* Language Switcher & 1930 Badge */}
        <div className="flex items-center gap-3">
          <a
            href="tel:1930"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-950/60 transition-colors shadow-sm"
          >
            <span>📞</span>
            <span>Helpline: 1930</span>
          </a>

          <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-slate-900/90 p-1 text-xs shadow-sm">
            {(["en", "hi", "mr"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-colors duration-150 active:scale-95 ${
                  lang === l
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Layout: Left Scanner, Right Threat Intel Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Scam Checker */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Alert Banner */}
          <section className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-900/70 backdrop-blur-md p-3.5 text-xs shadow-sm">
            <div className="flex items-center gap-2.5 text-sky-400 font-semibold tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="tabular-nums">{t.bannerCount}</span>
            </div>
            <div className="text-slate-400 text-right truncate pl-2">
              ⚠️ <span className="text-slate-300 font-medium">{t.bannerAlert}</span>
            </div>
          </section>

          {/* Hero Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-3 py-1 text-xs font-bold text-sky-300 shadow-sm">
              <span>🛡️</span> Zero-Fraud Job Offer Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {t.title}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              {t.subtitle}
            </p>
          </div>

          {/* Mode Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/[0.08] bg-slate-900/90 p-1.5 text-xs font-semibold shadow-inner">
            <button
              onClick={() => {
                setTab("paste");
                setResult(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all duration-150 active:scale-[0.98] ${
                tab === "paste"
                  ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span>📝</span>
              <span>{t.tabPaste}</span>
            </button>
            <button
              onClick={() => {
                setTab("upload");
                setResult(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all duration-150 active:scale-[0.98] ${
                tab === "upload"
                  ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span>📸</span>
              <span>{t.tabUpload}</span>
            </button>
            <button
              onClick={() => {
                setTab("direct");
                setResult(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all duration-150 active:scale-[0.98] ${
                tab === "direct"
                  ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span>🔍</span>
              <span>{t.tabDirect}</span>
            </button>
          </div>

          {/* Input Section */}
          <section className="space-y-4">
            {tab === "paste" && (
              <div className="space-y-3">
                <div className="relative rounded-2xl border border-white/[0.08] bg-slate-900/80 p-1 shadow-sm transition-all focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.placeholderPaste}
                    rows={5}
                    className="w-full rounded-xl bg-transparent p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed"
                  />
                </div>
                {/* Demo Cases Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">Quick test cases:</span>
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_SCAM)}
                    className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-rose-300 font-medium hover:bg-rose-950/60 transition-colors active:scale-95"
                  >
                    🚨 Fake Amazon WFH (₹1,500 Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_GENUINE)}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-emerald-300 font-medium hover:bg-emerald-950/60 transition-colors active:scale-95"
                  >
                    ✓ Real Infosys Email
                  </button>
                </div>
              </div>
            )}

            {tab === "upload" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-6 text-center transition-all duration-150 hover:border-sky-400 hover:bg-slate-900/80 active:scale-[0.99]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-3xl text-sky-400 mb-2 transition-transform duration-150 group-hover:scale-110">
                  📷
                </div>
                <p className="text-sm font-bold text-slate-200">
                  {file ? file.name : t.btnUpload}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Drop a screenshot of a WhatsApp/Telegram chat or upload an offer letter PDF (Gemini 2.5 Flash OCR)
                </p>
              </div>
            )}

            {tab === "direct" && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/[0.08] bg-slate-900/80 p-1 shadow-sm transition-all focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20">
                  <input
                    type="text"
                    value={directInput}
                    onChange={(e) => setDirectInput(e.target.value)}
                    placeholder={t.placeholderDirect}
                    className="w-full bg-transparent p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none font-mono"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">Try known targets:</span>
                  <button
                    type="button"
                    onClick={() => setDirectInput("9876543210")}
                    className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-slate-300 font-mono hover:bg-slate-700 transition-colors active:scale-95"
                  >
                    9876543210
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectInput("fraud.recruiter@okhdfc")}
                    className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-slate-300 font-mono hover:bg-slate-700 transition-colors active:scale-95"
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
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 py-4 pe-4 ps-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-sky-500/20 transition-all duration-150 hover:from-sky-300 hover:to-sky-400 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-base">{loading ? "⚡" : "🛡️"}</span>
                <span>{loading ? t.btnChecking : t.btnCheck}</span>
              </button>
            )}
          </section>

          {/* Error Banner */}
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs font-medium text-rose-300 flex items-center gap-2.5">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Progression Steps */}
          {loading && (
            <section className="rounded-3xl border border-white/[0.08] bg-slate-900/80 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
                </span>
                <span>Executing multi-tier verification...</span>
              </div>
              <div className="space-y-3 text-xs">
                {[t.step1, t.step2, t.step3, t.step4].map((stepText, idx) => {
                  const stepNum = idx + 1;
                  const isDone = currentStep > stepNum;
                  const isActive = currentStep === stepNum;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 transition-all duration-150 ${
                        isDone
                          ? "text-emerald-300 font-semibold"
                          : isActive
                          ? "text-sky-300 font-medium"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums ${
                          isDone
                            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                            : isActive
                            ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40 animate-pulse"
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

          {/* Verdict Result Card */}
          {result && s && !loading && (
            <section className="space-y-5 pt-2">
              <div className={`rounded-3xl border ${s.banner} ${s.glow} p-6 sm:p-7 space-y-5 transition-all`}>
                {/* Header: Icon + Word + Confidence */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black border ${s.badge} shadow-sm`}
                    >
                      {s.icon}
                    </span>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-white">
                        {t[s.labelKey]}
                      </div>
                      <div className="text-xs font-semibold text-slate-400 tabular-nums">
                        {Math.round(result.confidence * 100)}% confidence score
                      </div>
                    </div>
                  </div>

                  {result.cached && (
                    <span className="rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-300 shadow-sm">
                      ⚡ Instant Cache
                    </span>
                  )}
                </div>

                {/* Reasons List */}
                <div className="space-y-3 border-t border-white/[0.08] pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.reasonsTitle}
                  </h3>
                  <ul className="space-y-2.5">
                    {result.reasons.map((r, i) => (
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

                {/* Fraud Graph on Left when Result Displayed */}
                <GraphView graph={result.graph} centralLabel={directInput.slice(0, 10) || "Target"} />

                {/* Next Step Guidance */}
                <div className="rounded-2xl border border-sky-500/30 bg-sky-950/30 p-4 text-xs font-semibold text-sky-200 leading-relaxed shadow-sm">
                  👉 {result.nextStep}
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `⚠️ AsliJob Alert: ${result.reasons[0]?.text ?? "Suspicious offer"}. Verified at: ${result.shareUrl}?ref=wa`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-bold text-white transition-all duration-150 active:scale-[0.96] shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    <span>{t.btnShare}</span>
                  </a>

                  <Link
                    href={`/report?checkId=${result.checkId}`}
                    className="flex-1 text-center rounded-2xl bg-rose-600 hover:bg-rose-500 py-3.5 text-xs font-bold text-white transition-all duration-150 active:scale-[0.96] shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>🚨</span>
                    <span>{t.btnReport}</span>
                  </Link>
                </div>

                {/* Share Link Row */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                  <a
                    href={`/api/share/${result.checkId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline font-medium"
                  >
                    🖼️ Open High-Res Warning Card
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(result.shareUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-slate-400 hover:text-slate-200 transition-colors font-medium active:scale-95"
                  >
                    {copied ? t.copied : "🔗 Copy Result Link"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Live Threat Radar & Cyber Defense Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Telegram Bot Card */}
          <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-slate-900/80 to-slate-950 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                Official Telegram Bot
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live & Responding
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Forward any suspicious job message or payment request to <strong>@AsliJobBot</strong> to get an instant verdict without leaving Telegram.
            </p>
            <a
              href="https://web.telegram.org/k/#@AsliJobBot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 py-3 text-xs font-bold text-slate-950 transition-all duration-150 active:scale-[0.96] shadow-md shadow-sky-500/20"
            >
              <span>🤖</span>
              <span>Open @AsliJobBot in Telegram</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>

          {/* Default Graph View when no check active */}
          {!result && (
            <div className="space-y-2">
              <GraphView
                graph={{
                  linkedReports: 4,
                  cities: 4,
                  confirmedLinks: 3,
                  reportedCount: 4,
                  path: ["Phone 9800001111", "UPI tcs.hr@okhdfcbank", "FIR 2026/04 Pune"],
                }}
                centralLabel="Demo Target"
              />
            </div>
          )}

          {/* Live Scam Radar Feed */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 backdrop-blur-md p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Scam Wire (India)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5">
              {LIVE_THREAT_FEED.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.06] bg-slate-950/60 p-3.5 space-y-1 text-xs transition-colors hover:border-white/10"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">{item.company}</span>
                    <span className="text-rose-400 tabular-nums">{item.fee}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.type}</span>
                    <span className="text-slate-500">{item.loc} • {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Shield & Dodo Checkout Banner */}
          <div className="relative rounded-3xl border border-sky-500/40 bg-gradient-to-br from-sky-950/40 via-slate-900/80 to-slate-950 p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                Institutional Protection
              </span>
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-300">
                Dodo Payments Active
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Are you a College Placement Officer (TPO)?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shield your 2026 passing batch against fake recruitment syndicates. Campus-wide dashboard starting at ₹29/student/yr.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors pt-1"
            >
              <span>Explore College Batch Plan</span>
              <span>→</span>
            </Link>
          </div>

          {/* Onchain EAS Attestation Badge */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/50 p-5 space-y-2 shadow-sm text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <span>📜</span>
              <span>Base Sepolia Merkle Verification</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Authorized companies anchor offer-letter Merkle roots on Ethereum Attestation Service (EAS) on Base Sepolia.
            </p>
            <div className="pt-1">
              <Link
                href="/verify"
                className="text-slate-300 hover:text-white font-semibold underline text-[11px]"
              >
                Verify letter UID or QR code →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>🛡️ AsliJob • Hacker House Goa 2026</span>
          <span>•</span>
          <span>Zero-PII Hashed Database</span>
        </div>
        <div className="flex gap-4">
          <Link href="/pricing" className="text-sky-400 hover:underline">
            College Dashboard (Dodo)
          </Link>
          <Link href="/verify" className="hover:text-slate-300">
            EAS Letter Verify
          </Link>
          <a
            href="https://web.telegram.org/k/#@AsliJobBot"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 font-medium"
          >
            Telegram @AsliJobBot
          </a>
        </div>
      </footer>
    </div>
  );
}

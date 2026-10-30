"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GraphView from "@/components/GraphView";
import Sponsors from "@/components/Sponsors";
import VoiceInput from "@/components/VoiceInput";
import VoiceSpeaker from "@/components/VoiceSpeaker";
import {
  Shield,
  ShieldCheck,
  Check,
  AlertTriangle,
  XMark,
  Document,
  Camera,
  Search,
  Phone,
  Bot,
  Bolt,
  Share,
  Flag,
  Image as ImageIcon,
  LinkIcon,
  Certificate,
  Building,
  Activity,
  ArrowRight,
  ArrowUpRight,
  PulseDot,
} from "@/components/icons";
import { translations, type Language } from "@/lib/i18n";
import type { CheckResult } from "@/lib/types";

const STYLES = {
  safe: {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    banner: "border-emerald-500/25 bg-emerald-500/[0.04]",
    accent: "text-emerald-300",
    Icon: Check,
    labelKey: "verdictSafe" as const,
  },
  suspicious: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    banner: "border-amber-500/25 bg-amber-500/[0.04]",
    accent: "text-amber-300",
    Icon: AlertTriangle,
    labelKey: "verdictSuspicious" as const,
  },
  scam: {
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    banner: "border-rose-500/25 bg-rose-500/[0.04]",
    accent: "text-rose-300",
    Icon: XMark,
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

const TABS = [
  { id: "paste" as const, Icon: Document, key: "tabPaste" as const },
  { id: "upload" as const, Icon: Camera, key: "tabUpload" as const },
  { id: "direct" as const, Icon: Search, key: "tabDirect" as const },
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
      <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4 pt-1">
        <div className="flex items-center gap-7">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 shadow-lg shadow-sky-500/20 ring-1 ring-white/20 transition-transform duration-150 group-hover:scale-105">
              <Shield size={18} strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tightest text-white">
                Asli<span className="text-sky-400">Job</span>
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Fraud Intelligence
              </span>
            </span>
          </Link>

          {/* Quick Nav Links on Desktop */}
          <nav className="hidden items-center gap-5 text-xs font-semibold text-slate-400 md:flex">
            <Link href="/pricing" className="transition-colors hover:text-white">
              Campus Plans
            </Link>
            <Link href="/verify" className="transition-colors hover:text-white">
              Verify Letter
            </Link>
            <a
              href="https://web.telegram.org/k/#@AsliJobBot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-bold text-sky-400 transition-colors hover:text-sky-300"
            >
              Telegram Bot <ArrowUpRight size={12} strokeWidth={2.2} />
            </a>
          </nav>
        </div>

        {/* Language Switcher & 1930 Badge */}
        <div className="flex items-center gap-2.5">
          <a
            href="tel:1930"
            className="hidden items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/[0.06] px-3 py-1.5 text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/[0.12] sm:flex"
          >
            <Phone size={13} strokeWidth={2} />
            <span>1930</span>
          </a>

          <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.08] bg-slate-900/80 p-1 text-xs">
            {(["en", "hi", "mr"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors duration-150 active:scale-95 ${
                  lang === l ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Layout: Left Scanner, Right Threat Intel Hub */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Scam Checker */}
        <div className="space-y-6 lg:col-span-7">
          {/* Live Alert Banner */}
          <section className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-slate-900/60 px-4 py-2.5 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2.5 font-semibold text-slate-300">
              <PulseDot />
              <span className="tabular-nums">{t.bannerCount}</span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5 text-slate-400">
              <AlertTriangle size={13} className="shrink-0 text-amber-400" />
              <span className="truncate">{t.bannerAlert}</span>
            </div>
          </section>

          {/* Hero Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/[0.06] px-3 py-1 text-xs font-semibold text-sky-300">
              <ShieldCheck size={13} />
              Zero-fraud job-offer intelligence
            </div>
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tightest text-white sm:text-[2.6rem]">
              {t.title}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">{t.subtitle}</p>
          </div>

          {/* Mode Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.07] bg-slate-900/70 p-1 text-xs font-semibold">
            {TABS.map(({ id, Icon, key }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setResult(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 transition-all duration-150 active:scale-[0.98] ${
                  tab === id
                    ? "bg-slate-800 text-white ring-1 ring-white/10"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{t[key]}</span>
              </button>
            ))}
          </div>

          {/* Input Section */}
          <section className="space-y-4">
            {tab === "paste" && (
              <div className="space-y-3">
                <div className="relative rounded-xl border border-white/[0.08] bg-slate-900/70 transition-all focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/15">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.placeholderPaste}
                    rows={5}
                    className="w-full resize-none rounded-xl bg-transparent p-4 pb-12 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-500"
                  />
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                    <VoiceInput
                      lang={lang}
                      onTranscript={(spoken) => setText((prev) => (prev ? prev + " " + spoken : spoken))}
                      disabled={loading}
                    />
                  </div>
                </div>
                {/* Demo Cases Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">Try a sample:</span>
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_SCAM)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/[0.06] px-2.5 py-1 font-medium text-rose-300 transition-colors hover:bg-rose-500/[0.12] active:scale-95"
                  >
                    <AlertTriangle size={12} /> Fake Amazon WFH (₹1,500 fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_GENUINE)}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-2.5 py-1 font-medium text-emerald-300 transition-colors hover:bg-emerald-500/[0.12] active:scale-95"
                  >
                    <Check size={12} /> Real Infosys email
                  </button>
                </div>
              </div>
            )}

            {tab === "upload" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center transition-all duration-150 hover:border-sky-400/60 hover:bg-slate-900/80 active:scale-[0.99]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 transition-transform duration-150 group-hover:scale-110">
                  <Camera size={24} />
                </span>
                <p className="text-sm font-bold text-slate-200">{file ? file.name : t.btnUpload}</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Drop a WhatsApp / Telegram screenshot or an offer-letter PDF — OCR reads it automatically.
                </p>
              </div>
            )}

            {tab === "direct" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/70 transition-all focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/15">
                  <input
                    type="text"
                    value={directInput}
                    onChange={(e) => setDirectInput(e.target.value)}
                    placeholder={t.placeholderDirect}
                    className="w-full bg-transparent p-4 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">Known targets:</span>
                  <button
                    type="button"
                    onClick={() => setDirectInput("9876543210")}
                    className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1 font-mono text-slate-300 transition-colors hover:bg-slate-700 active:scale-95"
                  >
                    9876543210
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectInput("fraud.recruiter@okhdfc")}
                    className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1 font-mono text-slate-300 transition-colors hover:bg-slate-700 active:scale-95"
                  >
                    fraud.recruiter@okhdfc
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button — "scanner" treatment */}
            {tab !== "upload" && (
              <button
                onClick={() => handleCheck()}
                disabled={loading || (tab === "paste" ? !text.trim() : !directInput.trim())}
                className="btn-scan flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-sm font-extrabold uppercase tracking-wide text-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="corner tl" />
                <span className="corner tr" />
                <span className="corner bl" />
                <span className="corner br" />
                <span className={`text-sky-300 ${loading ? "animate-pulse" : ""}`}>
                  {loading ? <Bolt size={18} strokeWidth={2.4} /> : <ShieldCheck size={18} strokeWidth={2.4} />}
                </span>
                <span>{loading ? t.btnChecking : t.btnCheck}</span>
              </button>
            )}
          </section>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4 text-xs font-medium text-rose-300">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progression Steps */}
          {loading && (
            <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-slate-900/70 p-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                <PulseDot className="bg-sky-400" />
                <span>Running multi-tier verification</span>
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
                          ? "font-semibold text-emerald-300"
                          : isActive
                          ? "font-medium text-sky-300"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums ${
                          isDone
                            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
                            : isActive
                            ? "animate-pulse bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/40"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isDone ? <Check size={11} strokeWidth={3} /> : stepNum}
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
              <div className={`space-y-5 rounded-2xl border ${s.banner} p-6 shadow-xl sm:p-7`}>
                {/* Header: Icon + Word + Confidence */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${s.badge}`}
                    >
                      <s.Icon size={28} strokeWidth={2.4} />
                    </span>
                    <div>
                      <div className="text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                        {t[s.labelKey]}
                      </div>
                      <div className="text-xs font-semibold tabular-nums text-slate-400">
                        {Math.round(result.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <VoiceSpeaker
                      verdict={result.verdict}
                      confidence={result.confidence}
                      firstReason={result.reasons[0]?.text}
                      lang={lang}
                    />
                    {result.cached && (
                      <span className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-300">
                        <Bolt size={11} /> Cached
                      </span>
                    )}
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-3 border-t border-white/[0.07] pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.reasonsTitle}
                  </h3>
                  <ul className="space-y-2.5">
                    {result.reasons.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-slate-900/70 p-3.5 text-xs leading-relaxed text-slate-200"
                      >
                        <span className={`mt-0.5 shrink-0 ${s.accent}`}>
                          <ArrowRight size={13} strokeWidth={2.4} />
                        </span>
                        <span>{r.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fraud Graph */}
                <GraphView graph={result.graph} centralLabel={directInput.slice(0, 10) || "Target"} />

                {/* Next Step Guidance */}
                <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/25 bg-sky-500/[0.06] p-4 text-xs font-semibold leading-relaxed text-sky-200">
                  <ShieldCheck size={15} className="mt-px shrink-0" />
                  <span>{result.nextStep}</span>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `AsliJob Alert: ${result.reasons[0]?.text ?? "Suspicious offer"}. Verified at: ${result.shareUrl}?ref=wa`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition-all duration-150 hover:bg-emerald-500 active:scale-[0.97]"
                  >
                    <Share size={15} />
                    <span>{t.btnShare}</span>
                  </a>

                  <Link
                    href={`/report?checkId=${result.checkId}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white transition-all duration-150 hover:bg-rose-500 active:scale-[0.97]"
                  >
                    <Flag size={15} />
                    <span>{t.btnReport}</span>
                  </Link>
                </div>

                {/* Share Link Row */}
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3 text-xs text-slate-400">
                  <a
                    href={`/api/share/${result.checkId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-medium text-sky-400 transition-colors hover:text-sky-300"
                  >
                    <ImageIcon size={14} /> Warning card
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(result.shareUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 font-medium transition-colors hover:text-slate-200 active:scale-95"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <LinkIcon size={14} />}
                    {copied ? t.copied : "Copy link"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Live Threat Radar & Cyber Defense Feed */}
        <div className="space-y-5 lg:col-span-5">
          {/* Official Telegram Bot Card */}
          <div className="space-y-3 rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.08] via-slate-900/70 to-slate-950 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400">
                <Bot size={15} /> Telegram Bot
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              Forward any suspicious job message or payment request to <strong>@AsliJobBot</strong> for an
              instant verdict — without leaving Telegram.
            </p>
            <a
              href="https://web.telegram.org/k/#@AsliJobBot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 transition-all duration-150 hover:bg-sky-400 active:scale-[0.97]"
            >
              <Bot size={15} />
              <span>Open @AsliJobBot</span>
              <ArrowUpRight size={12} strokeWidth={2.2} />
            </a>
          </div>

          {/* Default Graph View when no check active */}
          {!result && (
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
          )}

          {/* Live Scam Radar Feed */}
          <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <Activity size={15} className="text-rose-400" /> Live scam wire · India
              </span>
              <PulseDot className="bg-rose-500" />
            </div>

            <div className="space-y-2">
              {LIVE_THREAT_FEED.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-slate-950/50 p-3 text-xs transition-colors hover:border-white/10"
                >
                  <span
                    className={`h-8 w-1 shrink-0 rounded-full ${
                      item.risk === "high" ? "bg-rose-500" : "bg-amber-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate text-white">{item.company}</span>
                      <span className="tabular-nums text-rose-400">{item.fee}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">{item.type}</span>
                      <span className="shrink-0 pl-2 text-slate-500">
                        {item.loc} · {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Shield & Dodo Checkout Banner */}
          <div className="space-y-3 rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Building size={15} /> For placement officers
            </div>
            <h3 className="text-sm font-extrabold text-white">
              Shield your 2026 batch from fake recruiters
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              A campus-wide verification dashboard for TPOs, from ₹29 / student / year.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 pt-0.5 text-xs font-bold text-sky-400 transition-colors hover:text-sky-300"
            >
              Explore campus plans <ArrowRight size={13} strokeWidth={2.2} />
            </Link>
          </div>

          {/* Onchain EAS Attestation Badge */}
          <div className="space-y-2 rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Certificate size={15} /> Onchain letter verification
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Authorized companies anchor offer-letter proofs on the Ethereum Attestation Service (Base Sepolia).
            </p>
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 pt-0.5 font-semibold text-slate-300 transition-colors hover:text-white"
            >
              Verify a letter UID or QR <ArrowRight size={12} strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="space-y-8 border-t border-white/[0.07] pt-8">
        {/* Sponsor / technology-partner strip */}
        <Sponsors />

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Shield size={13} className="text-slate-400" />
            <span>AsliJob · Hacker House Goa 2026</span>
            <span className="text-slate-700">·</span>
            <span>Zero-PII hashed store</span>
          </div>
          <div className="flex gap-5">
            <Link href="/pricing" className="transition-colors hover:text-slate-300">
              Campus plans
            </Link>
            <Link href="/verify" className="transition-colors hover:text-slate-300">
              Verify letter
            </Link>
            <a
              href="https://web.telegram.org/k/#@AsliJobBot"
              target="_blank"
              rel="noreferrer"
              className="font-medium transition-colors hover:text-slate-300"
            >
              @AsliJobBot
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
  Network,
  ArrowRight,
  ArrowUpRight,
} from "@/components/icons";
import { translations, type Language } from "@/lib/i18n";
import type { CheckResult } from "@/lib/types";

const STYLES = {
  safe: {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    banner: "border-emerald-500/25 bg-emerald-500/[0.04]",
    accent: "text-emerald-300",
    dot: "bg-emerald-400",
    Icon: Check,
    labelKey: "verdictSafe" as const,
  },
  suspicious: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    banner: "border-amber-500/25 bg-amber-500/[0.04]",
    accent: "text-amber-300",
    dot: "bg-amber-400",
    Icon: AlertTriangle,
    labelKey: "verdictSuspicious" as const,
  },
  scam: {
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    banner: "border-rose-500/25 bg-rose-500/[0.04]",
    accent: "text-rose-300",
    dot: "bg-rose-400",
    Icon: XMark,
    labelKey: "verdictScam" as const,
  },
};

const SAMPLE_SCAM =
  "Congratulations! Selected for Amazon WFH Data Entry. Daily salary Rs 3,500. Pay Rs 1,500 refundable security deposit to hr.amazon@okhdfc or WhatsApp +91 9876543210 immediately. Limited seats!";

const SAMPLE_GENUINE =
  "Dear candidate, thank you for applying to Infosys. Your interview is scheduled for Friday at 10 AM. Please login to your candidate portal at career.infosys.com to check details.";

const RECENT_REPORTS = [
  { company: "TCS India", fee: "₹2,500", type: "Laptop deposit fee", loc: "Pune", time: "2m ago" },
  { company: "Amazon WFH", fee: "₹1,500", type: "Telegram task recharge", loc: "Patna", time: "8m ago" },
  { company: "Infosys HR", fee: "₹4,200", type: "Forged appointment letter", loc: "Indore", time: "14m ago" },
  { company: "Flipkart Logistics", fee: "₹3,000", type: "Gate pass fee", loc: "Noida", time: "22m ago" },
];

const EXAMPLE_SIGNALS = ["Asks for a fee deposit", "Telegram-only communication", "Phone number linked to 4 reports"];

const HOW_IT_WORKS = [
  { Icon: Document, title: "Paste", desc: "Share the offer or recruiter message you want to check." },
  { Icon: Network, title: "Analyze against shared fraud graph", desc: "Compare suspicious patterns and linked reports." },
  { Icon: ShieldCheck, title: "Get verdict", desc: "See clear signals and a practical next step." },
];

const TABS = [
  { id: "paste" as const, Icon: Document, key: "tabPaste" as const },
  { id: "upload" as const, Icon: Camera, key: "tabUpload" as const },
  { id: "direct" as const, Icon: Search, key: "tabDirect" as const },
];

const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const LINK = "inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300";

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
        body = { identifier: { kind: isPhone ? "phone" : "upi", value: directInput.trim() }, channel: "web", lang };
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
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData?.error?.message ?? "Failed to upload file");
      await handleCheck({ fileId: uploadData.fileId, channel: "web", lang });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
      setLoading(false);
    }
  }

  const s = result ? STYLES[result.verdict] : null;

  return (
    <div className="pb-4">
      {/* ===== Header ===== */}
      <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/25 transition-transform duration-150 group-hover:scale-105">
            <Shield size={18} strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-extrabold tracking-tight text-white">AsliJob</span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Fraud Intelligence
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          <Link href="/pricing" className="transition-colors hover:text-white">Campus Plans</Link>
          <Link href="/verify" className="transition-colors hover:text-white">Verify Letter</Link>
          <a href="https://web.telegram.org/k/#@AsliJobBot" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
            Telegram Bot
          </a>
          <a href="tel:1930" className="rounded-full border border-rose-500/40 bg-rose-500/[0.06] px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/[0.12]">
            Cyber Helpline 1930
          </a>
        </nav>

        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-1 py-1 text-xs">
          {(["en", "hi", "mr"] as Language[]).map((l, i) => (
            <span key={l} className="flex items-center">
              {i > 0 && <span className="px-0.5 text-slate-600">/</span>}
              <button
                onClick={() => setLang(l)}
                className={`rounded-md px-2 py-1 font-semibold transition-colors ${
                  lang === l ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
              </button>
            </span>
          ))}
        </div>
      </header>

      {/* ===== Alert strip ===== */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] py-2.5 text-xs">
        <div className="flex min-w-0 items-center gap-2 text-slate-300">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
          <span className="truncate"><span className="font-semibold text-slate-200">Alert:</span> {t.bannerAlert.replace(/^Alert:\s*/i, "")}</span>
        </div>
        <span className="shrink-0 tabular-nums text-slate-400">{t.bannerCount}</span>
      </div>

      {/* ===== Hero ===== */}
      <section className="pt-14">
        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/[0.07] px-3 py-1 text-xs font-medium text-emerald-300">
          Free · No sign-up · EN · हिंदी · मराठी
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-[2.6rem]">
          {t.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">{t.subtitle}</p>
      </section>

      {/* ===== Check + Verdict ===== */}
      <section className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left: interactive checker */}
        <div className={`${CARD} p-6 lg:col-span-7`}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
            Check an offer <span className="text-slate-600">· Example experience</span>
          </div>

          {/* tabs */}
          <div className="mt-5 flex gap-6 border-b border-white/[0.08] text-sm">
            {TABS.map(({ id, Icon, key }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setResult(null); setError(null); }}
                className={`-mb-px flex items-center gap-1.5 border-b-2 pb-3 font-medium transition-colors ${
                  tab === id ? "border-emerald-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={15} /> <span className="hidden sm:inline">{t[key]}</span>
              </button>
            ))}
          </div>

          {/* inputs */}
          <div className="mt-5">
            {tab === "paste" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">Offer or recruiter message</label>
                <div className="relative rounded-xl border border-white/[0.1] bg-slate-950/50 transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/15">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the job offer, recruiter message or payment request here…"
                    rows={5}
                    className="w-full resize-none rounded-xl bg-transparent p-4 pb-12 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-500"
                  />
                  <div className="absolute bottom-2.5 right-2.5">
                    <VoiceInput lang={lang} onTranscript={(sp) => setText((p) => (p ? p + " " + sp : sp))} disabled={loading} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button onClick={() => setText(SAMPLE_SCAM)} className="rounded-full border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white">
                    Fake Amazon WFH (₹1,500 fee)
                  </button>
                  <button onClick={() => setText(SAMPLE_GENUINE)} className="rounded-full border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white">
                    Real Infosys email
                  </button>
                </div>
              </div>
            )}

            {tab === "upload" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-center transition-all hover:border-emerald-400/50 hover:bg-slate-950/70"
              >
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                  <Camera size={24} />
                </span>
                <p className="text-sm font-semibold text-slate-200">{file ? file.name : t.btnUpload}</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">Drop a WhatsApp / Telegram screenshot or an offer-letter PDF — OCR reads it automatically.</p>
              </div>
            )}

            {tab === "direct" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">Phone number or UPI ID</label>
                <div className="rounded-xl border border-white/[0.1] bg-slate-950/50 transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/15">
                  <input
                    type="text"
                    value={directInput}
                    onChange={(e) => setDirectInput(e.target.value)}
                    placeholder={t.placeholderDirect}
                    className="w-full bg-transparent p-4 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button onClick={() => setDirectInput("9876543210")} className="rounded-full border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 font-mono text-slate-300 transition-colors hover:border-white/20 hover:text-white">9876543210</button>
                  <button onClick={() => setDirectInput("fraud.recruiter@okhdfc")} className="rounded-full border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 font-mono text-slate-300 transition-colors hover:border-white/20 hover:text-white">fraud.recruiter@okhdfc</button>
                </div>
              </div>
            )}

            {tab !== "upload" && (
              <button
                onClick={() => handleCheck()}
                disabled={loading || (tab === "paste" ? !text.trim() : !directInput.trim())}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
              >
                {loading ? <Bolt size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? t.btnChecking : t.btnCheck}
              </button>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-3.5 text-xs font-medium text-rose-300">
                <AlertTriangle size={15} className="shrink-0" /> <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: verdict (example → loading → live) */}
        <div className="lg:col-span-5">
          {loading ? (
            <div className={`${CARD} space-y-4 p-6`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Bolt size={14} className="animate-spin" /> Running verification
              </div>
              <div className="space-y-3 text-xs">
                {[t.step1, t.step2, t.step3, t.step4].map((stepText, idx) => {
                  const n = idx + 1, done = currentStep > n, active = currentStep === n;
                  return (
                    <div key={idx} className={`flex items-center gap-3 ${done ? "text-emerald-300" : active ? "text-slate-100" : "text-slate-500"}`}>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${done ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40" : active ? "animate-pulse bg-white/10 text-white" : "bg-white/5"}`}>
                        {done ? <Check size={11} strokeWidth={3} /> : n}
                      </span>
                      <span>{stepText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : result && s ? (
            <div className={`rounded-2xl border ${s.banner} p-6`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Verdict</span>
                <span className={`rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase ${s.badge}`}>{t[s.labelKey]}</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tabular-nums text-white">{Math.round(result.confidence * 100)}</span>
                <span className="text-xl font-semibold text-slate-500">/ 100</span>
                <span className="ml-1 text-xs font-medium uppercase tracking-wide text-slate-500">risk</span>
              </div>
              <ul className="mt-5 space-y-px">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 border-t border-white/[0.07] py-3 text-sm text-slate-200 first:border-t-0">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4"><GraphView graph={result.graph} centralLabel={directInput.slice(0, 10) || "Target"} /></div>
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="text-sm font-semibold text-white">What to do now</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{result.nextStep}</p>
              </div>
              <div className="mt-4 flex gap-2.5">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`AsliJob Alert: ${result.reasons[0]?.text ?? "Suspicious offer"}. Verified at: ${result.shareUrl}?ref=wa`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.97]"
                >
                  <Share size={14} /> {t.btnShare}
                </a>
                <Link href={`/report?checkId=${result.checkId}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/[0.06] py-2.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/[0.12] active:scale-[0.97]">
                  <Flag size={14} /> {t.btnReport}
                </Link>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                <a href={`/api/share/${result.checkId}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-slate-200">
                  <ImageIcon size={13} /> Warning card
                </a>
                <div className="flex items-center gap-3">
                  <VoiceSpeaker verdict={result.verdict} confidence={result.confidence} firstReason={result.reasons[0]?.text} lang={lang} />
                  <button onClick={() => { navigator.clipboard.writeText(result.shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-slate-200">
                    {copied ? <Check size={13} className="text-emerald-400" /> : <LinkIcon size={13} />} {copied ? t.copied : "Copy link"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Example verdict (static preview)
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-6 shadow-[0_0_40px_-12px_rgba(244,63,94,0.3)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Example verdict</span>
                <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold uppercase text-rose-300">Scam</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tabular-nums text-white">92</span>
                <span className="text-xl font-semibold text-slate-500">/ 100</span>
                <span className="ml-1 text-xs font-medium uppercase tracking-wide text-slate-500">risk</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">Here&apos;s what the warning signals suggest.</p>
              <ul className="mt-4 space-y-px">
                {EXAMPLE_SIGNALS.map((sig) => (
                  <li key={sig} className="flex items-center gap-2.5 border-t border-white/[0.07] py-3 text-sm text-slate-200 first:border-t-0">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" /> {sig}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="text-sm font-semibold text-white">What to do now</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Do not pay. Report on{" "}
                  <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">cybercrime.gov.in</a>{" "}
                  or call <a href="tel:1930" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">1930</a>.
                </p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">Illustrative result only. This demo does not check live reports.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="mt-20">
        <h2 className="text-xl font-bold text-white">How it works</h2>
        <div className="relative mt-8 grid gap-10 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ Icon, title, desc }, i) => (
            <div key={title} className="relative">
              {i > 0 && <span className="absolute -left-5 top-5 hidden h-px w-5 border-t border-dashed border-white/20 sm:block" />}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Fraud network + Recent reports ===== */}
      <section className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`${CARD} p-6`}>
          <h2 className="text-lg font-bold text-white">Fraud network</h2>
          <p className="mt-0.5 text-sm text-slate-400">Signals shared across reports</p>
          <div className="mt-5">
            <GraphView
              graph={{ linkedReports: 4, cities: 4, confirmedLinks: 3, reportedCount: 4, path: ["Phone 9800001111", "UPI tcs.hr@okhdfcbank", "FIR 2026/04 Pune"] }}
              centralLabel="You"
            />
          </div>
        </div>

        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-rose-400" />
            <h2 className="text-lg font-bold text-white">Recent scam reports · India</h2>
          </div>
          <div className="mt-4">
            {RECENT_REPORTS.map((item) => (
              <div key={item.company} className="flex items-start gap-3 border-t border-white/[0.07] py-3.5 first:border-t-0">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-100">{item.company} <span className="text-slate-400">{item.fee} {item.type}</span></div>
                  <div className="mt-0.5 text-xs text-slate-500">{item.loc} {item.time}</div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/report" className={`${LINK} mt-4`}>View all reports <ArrowUpRight size={12} /></Link>
        </div>
      </section>

      {/* ===== More ways ===== */}
      <section className="mt-16">
        <h2 className="text-xl font-bold text-white">More ways to stay one step ahead</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className={`${CARD} p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"><Bot size={18} /></span>
            <h3 className="mt-4 text-base font-semibold text-white">Telegram Bot</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">Forward any suspicious message to @AsliJobBot for an instant verdict</p>
            <a href="https://web.telegram.org/k/#@AsliJobBot" target="_blank" rel="noreferrer" className={`${LINK} mt-6`}>Open @AsliJobBot <ArrowUpRight size={12} /></a>
          </div>
          <div className={`${CARD} p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"><Certificate size={18} /></span>
            <h3 className="mt-4 text-base font-semibold text-white">Onchain letter verification</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">Offer-letter proofs anchored on Ethereum Attestation Service</p>
            <Link href="/verify" className={`${LINK} mt-6`}>Verify a letter UID or QR <ArrowUpRight size={12} /></Link>
          </div>
          <div className={`${CARD} p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"><Building size={18} /></span>
            <h3 className="mt-4 text-base font-semibold text-white">For placement officers</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">Shield your 2026 batch from fake recruiters</p>
            <p className="mt-2 text-sm font-semibold text-amber-400">from ₹29 / student / year</p>
            <Link href="/pricing" className={`${LINK} mt-4`}>Explore campus plans <ArrowUpRight size={12} /></Link>
          </div>
        </div>
      </section>

      {/* ===== Sponsors ===== */}
      <section className="mt-20">
        <Sponsors />
      </section>

      {/* ===== Footer ===== */}
      <footer className="mt-16 border-t border-white/[0.07] pt-8">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-white">About</Link>
          <Link href="/" className="transition-colors hover:text-white">Safety</Link>
          <Link href="/" className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/" className="transition-colors hover:text-white">Terms</Link>
          <Link href="/" className="transition-colors hover:text-white">Contact</Link>
          <Link href="/report" className="transition-colors hover:text-white">Report a scam</Link>
          <a href="tel:1930" className="transition-colors hover:text-white">Cyber Helpline 1930</a>
        </nav>
        <div className="mt-6 flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <span>AsliJob · Hacker House Goa 2026 · Zero-PII hashed store</span>
          <span>We never ask for payment to check an offer.</span>
        </div>
      </footer>
    </div>
  );
}

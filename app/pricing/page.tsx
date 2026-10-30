"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PricingContent() {
  const [studentCount, setStudentCount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("status") === "success";

  const pricePerStudent = 29; // Rs 29/student/year (Plan Page 33)
  const annualTotal = (studentCount * pricePerStudent).toLocaleString("en-IN");
  const usdtEquivalent = Math.round((studentCount * pricePerStudent) / 88); // ~USDT at 88 INR

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/dodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCount,
          collegeName: "Campus Placement Cohort",
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to initiate checkout. Please check connection.");
      }
    } catch {
      alert("Checkout error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-8 py-4 pb-20">
      {/* Header */}
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
          Campus & Enterprise
        </span>
      </header>

      {/* Payment Success Notification */}
      {isSuccess && (
        <div className="rounded-3xl border border-emerald-500/40 bg-emerald-950/40 p-5 text-center text-xs text-emerald-200 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]">
          🎉 <strong>Payment Successful via Dodo!</strong> Your college cohort protection plan is now active. Check your email for API keys.
        </div>
      )}

      {/* Hero Section */}
      <div className="space-y-3 text-center pt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/50 px-3.5 py-1 text-xs font-bold text-sky-400 shadow-sm">
          <span>🎓</span> For TPOs & College Placement Cells
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Protect Your Entire Batch From Job Fraud
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Fraud rings target freshers with fake offer letters and ₹2,500–₹25,000 upfront fees. Empower your campus with real-time scam immunity.
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="grid gap-6 sm:grid-cols-2 pt-2">
        {/* Job Seeker Plan (Free) */}
        <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 backdrop-blur-md p-6 space-y-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Job Seekers & Students
              </span>
              <div className="mt-2 text-3xl font-black text-white">
                ₹0 <span className="text-xs font-normal text-slate-400">/ forever free</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                For individual freshers verifying WhatsApp offers, recruiter numbers, and UPI handles.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/[0.08] pt-4">
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">✓</span>
                <span>Unlimited text & WhatsApp message checks</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">✓</span>
                <span>Offer letter PDF & screenshot OCR</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">✓</span>
                <span>1-tap 1930 Cybercrime complaint draft</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">✓</span>
                <span>2-hop fraud graph cluster lookup</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">✓</span>
                <span>
                  Telegram bot access (
                  <a
                    href="https://web.telegram.org/k/#@AsliJobBot"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline font-bold"
                  >
                    @AsliJobBot
                  </a>
                  )
                </span>
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="block w-full text-center rounded-2xl border border-white/10 bg-slate-800 py-3 text-xs font-bold text-white transition-all duration-150 hover:bg-slate-700 active:scale-[0.96] shadow-sm"
          >
            Use Free Checker
          </Link>
        </div>

        {/* Campus Placement Protection Plan (Paid via Dodo) */}
        <div className="relative rounded-3xl border-2 border-sky-500/50 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 space-y-5 shadow-xl shadow-sky-500/10 flex flex-col justify-between">
          <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
            Institutional
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                College Batch Protection Plan
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-3xl font-black text-white tabular-nums">
                  ₹{annualTotal}
                </div>
                <span className="text-xs text-slate-400 font-medium">/ year + tax</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                ₹{pricePerStudent}/student/year for institutional coverage.
              </p>
            </div>

            {/* Interactive Student Slider */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Cohort Batch Size:</span>
                <span className="text-sky-400 tabular-nums">{studentCount} Students</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-medium text-slate-500">
                <span>100</span>
                <span>1,000</span>
                <span>2,500</span>
                <span>5,000</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/[0.08] pt-4">
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">✓</span>
                <span>Campus-wide placement officer dashboard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">✓</span>
                <span>Early threat radar for gangs targeting your college</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">✓</span>
                <span>1-click broadcast warnings to all placed students</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">✓</span>
                <span>Direct EAS onchain offer-letter issuing badges</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">✓</span>
                <span>Priority 1930 Cybercrime escalation desk</span>
              </li>
            </ul>
          </div>

          {/* Payment Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 py-3.5 pe-4 ps-3.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all duration-150 hover:from-sky-300 hover:to-sky-400 active:scale-[0.96] disabled:opacity-50"
            >
              <span>💳</span>
              <span>{loading ? "Preparing Checkout..." : "Pay via Dodo (Cards / UPI)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCryptoModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800/90 py-3 text-xs font-bold text-slate-200 transition-all duration-150 hover:bg-slate-700 active:scale-[0.96] shadow-sm"
            >
              <span>🍰</span>
              <span>Pay with Cake Wallet / Crypto (~${usdtEquivalent} USDT / XMR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cake Wallet / Web3 Payment Modal */}
      {showCryptoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍰</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Cake Wallet / Web3 Checkout</h3>
                  <p className="text-[11px] text-slate-400">Institutional Plan • {studentCount} Students</p>
                </div>
              </div>
              <button
                onClick={() => setShowCryptoModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-slate-950/70 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Calculated Amount:</span>
                <span className="text-emerald-400 tabular-nums">~{usdtEquivalent} USDT / {((studentCount * pricePerStudent) / (160 * 88)).toFixed(3)} XMR</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Send to our verified cold vault via Cake Wallet. Instant onchain verification via tx hash.
              </p>
            </div>

            {/* Address & Cake Cash Handle Details */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Cake Cash Handle (Direct Send):</span>
                <div className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-950/40 p-2.5 font-mono text-xs text-sky-300 font-bold select-all">
                  <span>saurabhyadav@cake.cash</span>
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Verified</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">USDT / Web3 (Base Sepolia / Polygon / EVM):</span>
                <div className="rounded-xl border border-white/5 bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300 break-all select-all">
                  0x56177EE8E42135f9f38A0ee1Ce8eB38C4Bc3581C
                </div>
              </div>
            </div>

            {/* Deep-link Action */}
            <div className="space-y-2 pt-2">
              <a
                href="https://cakewallet.com"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-slate-950 transition-all duration-150 active:scale-[0.96]"
              >
                <span>🍰</span>
                <span>Send to saurabhyadav@cake.cash in Cake Wallet</span>
              </a>
              <p className="text-[10px] text-slate-500 text-center">
                After transfer, forward tx hash to <strong>@AsliJobBot</strong> or email billing@aslijob.in to activate instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading plan details...</div>}>
      <PricingContent />
    </Suspense>
  );
}

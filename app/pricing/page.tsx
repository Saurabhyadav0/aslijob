"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [studentCount, setStudentCount] = useState(1200);

  const pricePerStudent = 29; // Rs 29/student/year (Plan Page 33: Rs 20 to 50)
  const annualTotal = (studentCount * pricePerStudent).toLocaleString("en-IN");

  return (
    <main className="space-y-8 py-8 pb-16">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Asli<span className="text-sky-400">Job</span>
        </Link>
        <span className="text-xs uppercase tracking-wider text-slate-400">
          Campus & Enterprise Plans
        </span>
      </header>

      {/* Hero */}
      <div className="space-y-2 text-center">
        <span className="rounded-full border border-sky-500/30 bg-sky-950/40 px-3 py-1 text-xs font-semibold text-sky-400">
          For TPOs & Placement Cells
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Protect Your Entire Batch From Job Fraud
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Scammers steal Rs 15,000 to Rs 60,000 from freshers in fake registration and laptop deposits. Keep your campus safe.
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Job Seeker Plan (Free) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Seekers & Freshers</span>
            <div className="mt-2 text-3xl font-extrabold text-white">₹0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
            <p className="mt-1 text-xs text-slate-400">For students checking suspicious job offers before paying.</p>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Unlimited text & message checks
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Screenshot & PDF offer parsing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> 2-hop scam network graph lookup
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Ready 1930 Cybercrime complaint draft
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Offer letter onchain EAS verification
            </li>
          </ul>

          <Link
            href="/"
            className="block w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Start Checking Free
          </Link>
        </div>

        {/* College & TPO Plan (Paid) */}
        <div className="rounded-2xl border-2 border-sky-500/50 bg-sky-950/20 p-6 space-y-5 relative shadow-lg shadow-sky-950/50">
          <span className="absolute -top-3 right-6 rounded-full bg-sky-500 px-3 py-0.5 text-[11px] font-bold text-slate-950">
            Dodo Payments Powered
          </span>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">College Placement Cells</span>
            <div className="mt-2 text-3xl font-extrabold text-white">
              ₹29 <span className="text-xs font-normal text-slate-400">/ student / year</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Complete placement protection dashboard & batch threat intelligence.
            </p>
          </div>

          {/* Calculator */}
          <div className="rounded-xl border border-sky-900/40 bg-slate-900/80 p-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Batch size:</span>
              <strong className="text-sky-400">{studentCount} Students</strong>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between border-t border-slate-800 pt-1 text-[11px] text-slate-400">
              <span>Estimated Annual Plan:</span>
              <span className="font-bold text-emerald-400">₹{annualTotal} / year</span>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300 border-t border-sky-900/40 pt-4">
            <li className="flex items-center gap-2">
              <span className="text-sky-400">✓</span> Real-time campus fraud alerts (viaSocket)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sky-400">✓</span> Student scam report dashboard & gang tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sky-400">✓</span> 1-click batch WhatsApp alert broadcasts
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sky-400">✓</span> Verified recruiter domain whitelist
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sky-400">✓</span> Dedicated TPO support & weekly report
            </li>
          </ul>

          <a
            href="https://test.dodopayments.com"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-xl bg-sky-500 py-3 text-center text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
          >
            Request College Pilot via Dodo
          </a>
        </div>
      </div>

      <div className="pt-4 text-center">
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
          ← Back to Scam Checker
        </Link>
      </div>
    </main>
  );
}

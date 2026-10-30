"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CampusThreat, CollegeProfile, BroadcastLog } from "@/lib/college";

export default function CollegeDashboardPage() {
  const [collegeId, setCollegeId] = useState("coep-pune");
  const [profile, setProfile] = useState<CollegeProfile | null>(null);
  const [threats, setThreats] = useState<CampusThreat[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Broadcast modal state
  const [showModal, setShowModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchThreats(collegeId);
  }, [collegeId]);

  async function fetchThreats(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/college/threats?collegeId=${id}`);
      const data = await res.json();
      if (data.ok) {
        setProfile(data.college);
        setThreats(data.threats);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to load threats:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenBroadcast(threat?: CampusThreat) {
    if (threat) {
      setBroadcastTitle(`🚨 URGENT: Fake ${threat.impersonatedCompany} Job Scam Alert`);
      setBroadcastMsg(
        `Dear Batch, ${threat.reportCount} students reported receiving fake offers claiming to be from ${threat.impersonatedCompany} demanding Rs ${threat.feeRequested} via ${threat.syndicateHandle}. DO NOT PAY any money. Genuine recruiters NEVER charge registration fees. Check all suspicious messages at aslijob.vercel.app.`
      );
    } else {
      setBroadcastTitle("🚨 Placement Cell Warning: Job Scam Syndicate Alert");
      setBroadcastMsg(
        "Notice to all students: Multiple fake job messages demanding registration deposits have been reported. Forward any suspicious recruiter messages to @AsliJobBot on Telegram or check them on aslijob.vercel.app before paying."
      );
    }
    setBroadcastSuccess(null);
    setShowModal(true);
  }

  async function handleSendBroadcast() {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/college/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId,
          title: broadcastTitle,
          message: broadcastMsg,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setBroadcastSuccess(data.message);
      } else {
        alert(data.error?.message ?? "Broadcast failed");
      }
    } catch {
      alert("Failed to send broadcast warning.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 font-black text-lg shadow-md shadow-sky-500/20">
              A
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Campus Placement Shield</h1>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  Campus Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {profile?.name} • Verified Domain: <span className="text-sky-400 font-mono">@{profile?.domain}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none font-semibold cursor-pointer"
            >
              <option value="coep-pune">COEP Tech, Pune</option>
              <option value="vjti-mumbai">VJTI, Mumbai</option>
            </select>
            <button
              onClick={() => handleOpenBroadcast()}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white transition-all duration-150 active:scale-95 shadow-md shadow-rose-600/20"
            >
              <span>📢</span>
              <span>Warn Entire Batch</span>
            </button>
          </div>
        </header>

        {/* Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student Reports</span>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 tabular-nums">{metrics.totalReports}</div>
              <span className="text-[10px] text-slate-500">Flagged this placement cycle</span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Syndicates</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">{metrics.activeThreats}</div>
              <span className="text-[10px] text-slate-500">Targeting campus students</span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Batch Size</span>
              <div className="text-2xl sm:text-3xl font-black text-sky-400 tabular-nums">{metrics.batchSize}</div>
              <span className="text-[10px] text-slate-500">Students monitored</span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Prevented Loss</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                ₹{metrics.preventedLossRupees.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Direct student money saved</span>
            </div>
          </div>
        )}

        {/* Active Campus Threats Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🚨</span>
              <span>Scam Syndicates Targeting Your Students</span>
            </h2>
            <span className="text-xs text-slate-400">Live TigerGraph 2-Hop Correlation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threats.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5 space-y-3.5 shadow-sm hover:border-rose-500/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      {t.riskLevel === "critical" ? "⚠️ CRITICAL ALERT" : "HIGH RISK"}
                    </span>
                    <h3 className="text-base font-black text-white">{t.impersonatedCompany}</h3>
                  </div>
                  <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-300 tabular-nums">
                    {t.reportCount} reports
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Demand Type:</span>
                    <span className="font-semibold">{t.scamType}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Fee Demanded:</span>
                    <span className="font-mono text-rose-300 font-bold">₹{t.feeRequested}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-400">Syndicate Handle:</span>
                    <span className="font-mono text-sky-400">{t.syndicateHandle}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBroadcast(t)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-200 transition-colors"
                >
                  <span>📢</span>
                  <span>Broadcast Warning for This Threat</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcast Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📢</span>
                  <span>Broadcast Warning to All Students</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {broadcastSuccess ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
                    ✓
                  </div>
                  <p className="text-sm font-bold text-emerald-300">{broadcastSuccess}</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Alert Headline</label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-slate-100 outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Broadcast Message</label>
                    <textarea
                      rows={5}
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-slate-100 outline-none resize-none focus:border-sky-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Recipients: <strong>{profile?.batchSize} Students</strong> (WhatsApp & Portal)
                    </span>
                    <button
                      onClick={handleSendBroadcast}
                      disabled={sending}
                      className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50"
                    >
                      {sending ? "Broadcasting..." : "Confirm & Send"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


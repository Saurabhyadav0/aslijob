import React from "react";
import type { GraphResult } from "@/lib/types";
import { Network } from "@/components/icons";

type GraphViewProps = {
  graph: GraphResult;
  centralLabel?: string;
};

export default function GraphView({ graph, centralLabel = "Target" }: GraphViewProps) {
  const hasLinks = graph.confirmedLinks > 0 || graph.reportedCount > 0;

  return (
    <div className="space-y-3.5 rounded-2xl border border-white/[0.07] bg-slate-900/70 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-400">
            <Network size={14} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Fraud network · 2-hop
          </span>
        </div>
        <span className="text-[11px] font-medium tabular-nums text-slate-400">
          {graph.cities} {graph.cities === 1 ? "city" : "cities"} · {graph.linkedReports || graph.reportedCount} reports
        </span>
      </div>

      {/* SVG Canvas with Concentric Inner Radius */}
      <div className="relative flex justify-center bg-slate-950/80 border border-white/[0.06] rounded-xl p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 500 240" className="w-full h-48 select-none">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="scamGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="safeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
            {/* Background grid */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.25" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connecting Edges */}
          {hasLinks ? (
            <>
              {/* Center to Intermediate */}
              <line x1="250" y1="120" x2="160" y2="70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" opacity="0.8" />
              <line x1="250" y1="120" x2="340" y2="70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" opacity="0.8" />
              <line x1="250" y1="120" x2="250" y2="190" stroke="#38BDF8" strokeWidth="1.5" opacity="0.7" />

              {/* Intermediate to Scam Reports */}
              <line x1="160" y1="70" x2="80" y2="50" stroke="#EF4444" strokeWidth="2" opacity="0.9" />
              <line x1="160" y1="70" x2="100" y2="130" stroke="#EF4444" strokeWidth="2" opacity="0.9" />
              <line x1="340" y1="70" x2="420" y2="50" stroke="#EF4444" strokeWidth="2" opacity="0.9" />
              <line x1="340" y1="70" x2="400" y2="130" stroke="#EF4444" strokeWidth="2" opacity="0.9" />
            </>
          ) : (
            <>
              <line x1="250" y1="120" x2="170" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.7" />
              <line x1="250" y1="120" x2="330" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.7" />
            </>
          )}

          {/* Center Target Node */}
          <circle cx="250" cy="120" r="32" fill="url(#nodeGlow)" />
          <circle cx="250" cy="120" r="16" fill="#0284C7" stroke="#38BDF8" strokeWidth="2.5" />
          <text x="250" y="124" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="0.5" fill="#FFFFFF">TARGET</text>
          <text x="250" y="148" textAnchor="middle" fontSize="9" fill="#94A3B8" fontWeight="500">{centralLabel}</text>

          {/* Linked Network Nodes */}
          {hasLinks ? (
            <>
              {/* Hop 1 Nodes (UPI / Web) */}
              <circle cx="160" cy="70" r="13" fill="#D97706" stroke="#FBBF24" strokeWidth="2" />
              <text x="160" y="73" textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF">UPI ID</text>
              <text x="160" y="93" textAnchor="middle" fontSize="8" fill="#FBBF24" fontWeight="600">Shared Pay</text>

              <circle cx="340" cy="70" r="13" fill="#D97706" stroke="#FBBF24" strokeWidth="2" />
              <text x="340" y="73" textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF">SITE</text>
              <text x="340" y="93" textAnchor="middle" fontSize="8" fill="#FBBF24" fontWeight="600">Fake Portal</text>

              {/* Hop 2 Nodes (Confirmed Scam Reports) */}
              <circle cx="80" cy="50" r="22" fill="url(#scamGlow)" />
              <circle cx="80" cy="50" r="13" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="80" y="53" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#FFFFFF">SCAM 1</text>
              <text x="80" y="73" textAnchor="middle" fontSize="8" fill="#FCA5A5">Pune FIR</text>

              <circle cx="100" cy="130" r="12" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="100" y="133" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#FFFFFF">SCAM 2</text>
              <text x="100" y="152" textAnchor="middle" fontSize="8" fill="#FCA5A5">Patna Report</text>

              <circle cx="420" cy="50" r="22" fill="url(#scamGlow)" />
              <circle cx="420" cy="50" r="13" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="420" y="53" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#FFFFFF">SCAM 3</text>
              <text x="420" y="73" textAnchor="middle" fontSize="8" fill="#FCA5A5">Indore FIR</text>

              <circle cx="400" cy="130" r="12" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="400" y="133" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#FFFFFF">SCAM 4</text>
              <text x="400" y="152" textAnchor="middle" fontSize="8" fill="#FCA5A5">Noida Case</text>

              {/* Hop 1 Node bottom (Phone) */}
              <circle cx="250" cy="190" r="12" fill="#0369A1" stroke="#38BDF8" strokeWidth="2" />
              <text x="250" y="193" textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF">TEL</text>
              <text x="250" y="212" textAnchor="middle" fontSize="8" fill="#7DD3FC">Virtual VoIP</text>
            </>
          ) : (
            <>
              {/* Isolated Safe State */}
              <circle cx="170" cy="120" r="16" fill="url(#safeGlow)" />
              <circle cx="170" cy="120" r="10" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
              <text x="170" y="123" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF">CLEAN</text>

              <circle cx="330" cy="120" r="16" fill="url(#safeGlow)" />
              <circle cx="330" cy="120" r="10" fill="#047857" stroke="#10B981" strokeWidth="1.5" />
              <text x="330" y="123" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF">ISOLATED</text>
              <text x="250" y="80" textAnchor="middle" fontSize="10" fill="#6EE7B7" fontWeight="600">No linked fraud clusters found in 2-hop radius</text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

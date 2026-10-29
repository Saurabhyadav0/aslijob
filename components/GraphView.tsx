import React from "react";
import type { GraphResult } from "@/lib/types";

type GraphViewProps = {
  graph: GraphResult;
  centralLabel?: string;
};

export default function GraphView({ graph, centralLabel = "Checked Target" }: GraphViewProps) {
  const hasLinks = graph.confirmedLinks > 0 || graph.reportedCount > 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">🕸️</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Fraud Network Graph (2-Hop Analysis)
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {graph.cities} {graph.cities === 1 ? "City" : "Cities"} • {graph.linkedReports || graph.reportedCount} Reports
        </span>
      </div>

      {/* Interactive SVG Diagram */}
      <div className="relative flex justify-center bg-slate-900/80 border border-slate-800 rounded-lg p-2 overflow-hidden">
        <svg viewBox="0 0 500 240" className="w-full h-48 select-none">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="scamGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background grid */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connecting Edges */}
          {hasLinks ? (
            <>
              {/* Center to Intermediate */}
              <line x1="250" y1="120" x2="160" y2="70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="250" y1="120" x2="340" y2="70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="250" y1="120" x2="250" y2="190" stroke="#38BDF8" strokeWidth="1.5" />

              {/* Intermediate to Scam Reports */}
              <line x1="160" y1="70" x2="80" y2="50" stroke="#EF4444" strokeWidth="2" />
              <line x1="160" y1="70" x2="100" y2="130" stroke="#EF4444" strokeWidth="2" />
              <line x1="340" y1="70" x2="420" y2="50" stroke="#EF4444" strokeWidth="2" />
              <line x1="340" y1="70" x2="400" y2="130" stroke="#EF4444" strokeWidth="2" />
            </>
          ) : (
            <>
              <line x1="250" y1="120" x2="180" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,4" />
              <line x1="250" y1="120" x2="320" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,4" />
            </>
          )}

          {/* Center Target Node */}
          <circle cx="250" cy="120" r="28" fill="url(#nodeGlow)" />
          <circle cx="250" cy="120" r="16" fill="#0284C7" stroke="#38BDF8" strokeWidth="3" />
          <text x="250" y="124" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF">TARGET</text>
          <text x="250" y="150" textAnchor="middle" fontSize="9" fill="#94A3B8">{centralLabel}</text>

          {/* Linked Network Nodes */}
          {hasLinks ? (
            <>
              {/* Hop 1 Nodes (UPI / Web) */}
              <circle cx="160" cy="70" r="13" fill="#D97706" stroke="#FBBF24" strokeWidth="2" />
              <text x="160" y="74" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">UPI ID</text>
              <text x="160" y="93" textAnchor="middle" fontSize="8" fill="#FBBF24">Shared Pay</text>

              <circle cx="340" cy="70" r="13" fill="#D97706" stroke="#FBBF24" strokeWidth="2" />
              <text x="340" y="74" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">SITE</text>
              <text x="340" y="93" textAnchor="middle" fontSize="8" fill="#FBBF24">Fake Portal</text>

              {/* Hop 2 Nodes (Confirmed Scam Reports) */}
              <circle cx="80" cy="50" r="20" fill="url(#scamGlow)" />
              <circle cx="80" cy="50" r="12" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="80" y="54" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">SCAM 1</text>
              <text x="80" y="73" textAnchor="middle" fontSize="8" fill="#FCA5A5">Pune FIR</text>

              <circle cx="100" cy="130" r="12" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="100" y="134" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">SCAM 2</text>
              <text x="100" y="152" textAnchor="middle" fontSize="8" fill="#FCA5A5">Patna Report</text>

              <circle cx="420" cy="50" r="20" fill="url(#scamGlow)" />
              <circle cx="420" cy="50" r="12" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="420" y="54" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">SCAM 3</text>
              <text x="420" y="73" textAnchor="middle" fontSize="8" fill="#FCA5A5">Indore FIR</text>

              <circle cx="400" cy="130" r="12" fill="#B91C1C" stroke="#EF4444" strokeWidth="2" />
              <text x="400" y="134" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">SCAM 4</text>
              <text x="400" y="152" textAnchor="middle" fontSize="8" fill="#FCA5A5">Bangalore</text>
            </>
          ) : (
            <>
              <circle cx="180" cy="120" r="10" fill="#065F46" stroke="#10B981" strokeWidth="2" />
              <text x="180" y="138" textAnchor="middle" fontSize="8" fill="#6EE7B7">No Scam Links</text>

              <circle cx="320" cy="120" r="10" fill="#065F46" stroke="#10B981" strokeWidth="2" />
              <text x="320" y="138" textAnchor="middle" fontSize="8" fill="#6EE7B7">Clean Domain</text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" />
          <span>Checked Number</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Shared Identifiers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Confirmed Scam Reports</span>
        </div>
      </div>
    </div>
  );
}

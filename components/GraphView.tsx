"use client";

import React, { useMemo, useState } from "react";
import type { GraphResult } from "@/lib/types";
import { Network } from "@/components/icons";

type GraphViewProps = {
  graph: GraphResult;
  centralLabel?: string;
};

type Kind = "target" | "identifier" | "report" | "clean";
type Node = { id: string; label: string; sub: string; kind: Kind; x: number; y: number };

const KIND_COLOR: Record<Kind, { fill: string; ring: string; text: string }> = {
  target: { fill: "#059669", ring: "#34D399", text: "Checked identifier" },
  identifier: { fill: "#B45309", ring: "#FBBF24", text: "Shared pivot" },
  report: { fill: "#9F1239", ring: "#FB7185", text: "Confirmed scam report" },
  clean: { fill: "#047857", ring: "#34D399", text: "No fraud links" },
};

const W = 520;
const H = 280;

/** Pick a human label for the shared pivot node from the real BFS path. */
function pivotFrom(path: string[]): string {
  const hit = path.find((p) => /upi|@|portal|http|\b[6-9]\d{9}\b|phone|tel/i.test(p));
  return hit ?? path[1] ?? "Shared UPI / number";
}

export default function GraphView({ graph, centralLabel = "Target" }: GraphViewProps) {
  const hasLinks = graph.confirmedLinks > 0 || graph.reportedCount > 0;
  const [hover, setHover] = useState<Node | null>(null);

  const nodes = useMemo<Node[]>(() => {
    const target: Node = {
      id: "t",
      label: centralLabel.length > 16 ? centralLabel.slice(0, 15) + "…" : centralLabel,
      sub: "You checked this",
      kind: "target",
      x: 86,
      y: H / 2,
    };

    if (!hasLinks) {
      return [
        target,
        { id: "c1", label: "Clean", sub: "Not in any report", kind: "clean", x: 300, y: 96 },
        { id: "c2", label: "Isolated", sub: "No 2-hop links", kind: "clean", x: 300, y: 184 },
      ];
    }

    const pivot: Node = {
      id: "p",
      label: pivotFrom(graph.path),
      sub: "Links the cluster",
      kind: "identifier",
      x: 232,
      y: H / 2,
    };

    const count = Math.min(6, Math.max(graph.linkedReports, graph.reportedCount, graph.confirmedLinks, 3));
    const reportLabels = graph.path.filter((p) => /report|fir|case|r\d|scam/i.test(p));
    const reports: Node[] = Array.from({ length: count }).map((_, i) => {
      const top = 46;
      const bottom = H - 46;
      const y = count === 1 ? H / 2 : top + (i * (bottom - top)) / (count - 1);
      return {
        id: `r${i}`,
        label: reportLabels[i] ?? `Report #${i + 1}`,
        sub: i < graph.confirmedLinks ? "Confirmed" : "Reported",
        kind: "report",
        x: 410,
        y,
      };
    });

    return [target, pivot, ...reports];
  }, [graph, centralLabel, hasLinks]);

  const target = nodes[0];
  const pivot = hasLinks ? nodes[1] : null;
  const leaves = hasLinks ? nodes.slice(2) : nodes.slice(1);

  const radius = (k: Kind) => (k === "target" ? 20 : k === "identifier" ? 15 : 12);

  return (
    <div className="space-y-3 rounded-2xl border border-white/[0.07] bg-slate-900/70 p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
            <Network size={14} />
          </span>
          <div className="leading-tight">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Fraud network</div>
            <div className="text-[10px] font-medium text-slate-500">2-hop BFS · live on TigerGraph</div>
          </div>
        </div>
        <span className="rounded-full border border-orange-500/25 bg-orange-500/[0.07] px-2 py-0.5 text-[10px] font-bold text-orange-300">
          TigerGraph
        </span>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-slate-950/70 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full select-none">
          <defs>
            <radialGradient id="gTarget" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gReport" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>
            <pattern id="gGrid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>

          <rect width={W} height={H} fill="url(#gGrid)" />

          {/* Edges */}
          {hasLinks && pivot && (
            <>
              <line
                x1={target.x}
                y1={target.y}
                x2={pivot.x}
                y2={pivot.y}
                stroke="#38BDF8"
                strokeWidth={2}
                className="edge-flow"
                opacity={0.85}
              />
              {leaves.map((n) => (
                <line
                  key={`e-${n.id}`}
                  x1={pivot.x}
                  y1={pivot.y}
                  x2={n.x}
                  y2={n.y}
                  stroke={hover && hover.id !== n.id ? "#475569" : "#FB7185"}
                  strokeWidth={hover?.id === n.id ? 2.4 : 1.6}
                  className="edge-flow"
                  opacity={hover && hover.id !== n.id ? 0.35 : 0.8}
                />
              ))}
            </>
          )}
          {!hasLinks &&
            leaves.map((n) => (
              <line
                key={`e-${n.id}`}
                x1={target.x}
                y1={target.y}
                x2={n.x}
                y2={n.y}
                stroke="#34D399"
                strokeWidth={1.4}
                strokeDasharray="4 5"
                opacity={0.6}
              />
            ))}

          {/* Nodes */}
          {nodes.map((n) => {
            const c = KIND_COLOR[n.kind];
            const r = radius(n.kind);
            const dim = hover && hover.id !== n.id && n.kind === "report";
            return (
              <g
                key={n.id}
                className={n.kind === "report" ? "node-float" : undefined}
                style={{ transformBox: "fill-box", transformOrigin: "center", cursor: "pointer" }}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                opacity={dim ? 0.5 : 1}
              >
                {(n.kind === "target" || n.kind === "report") && (
                  <circle cx={n.x} cy={n.y} r={r + 12} fill={`url(#${n.kind === "target" ? "gTarget" : "gReport"})`} />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={hover?.id === n.id ? r + 2 : r}
                  fill={c.fill}
                  stroke={c.ring}
                  strokeWidth={2}
                />
                {n.kind === "target" && (
                  <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">
                    YOU
                  </text>
                )}
                <text x={n.x} y={n.y + r + 13} textAnchor="middle" fontSize="9" fontWeight="600" fill="#CBD5E1">
                  {n.label.length > 16 ? n.label.slice(0, 15) + "…" : n.label}
                </text>
              </g>
            );
          })}

          {/* Hover tooltip (SVG, scales with viewBox) */}
          {hover && (
            <g pointerEvents="none">
              <rect
                x={Math.min(Math.max(hover.x - 70, 6), W - 146)}
                y={hover.y - radius(hover.kind) - 44}
                width={140}
                height={30}
                rx={7}
                fill="#0b1220"
                stroke={KIND_COLOR[hover.kind].ring}
                strokeWidth={1}
                opacity={0.97}
              />
              <text
                x={Math.min(Math.max(hover.x - 70, 6), W - 146) + 10}
                y={hover.y - radius(hover.kind) - 29}
                fontSize="9.5"
                fontWeight="700"
                fill="#fff"
              >
                {hover.label.length > 18 ? hover.label.slice(0, 17) + "…" : hover.label}
              </text>
              <text
                x={Math.min(Math.max(hover.x - 70, 6), W - 146) + 10}
                y={hover.y - radius(hover.kind) - 19}
                fontSize="8"
                fill={KIND_COLOR[hover.kind].ring}
              >
                {KIND_COLOR[hover.kind].text}
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-3 text-[9px] font-semibold text-slate-400">
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-500" /> You</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" /> Pivot</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-rose-500" /> Report</span>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { v: graph.linkedReports || graph.reportedCount, l: "Linked reports" },
          { v: graph.cities, l: graph.cities === 1 ? "City" : "Cities" },
          { v: graph.confirmedLinks, l: "Confirmed" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-white/[0.06] bg-slate-950/50 py-2">
            <div className="text-base font-extrabold tabular-nums text-white">{s.v}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{s.l}</div>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-slate-600">Hover a node to inspect · tap on mobile</p>
    </div>
  );
}

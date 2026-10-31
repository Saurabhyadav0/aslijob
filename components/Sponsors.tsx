import React from "react";

/**
 * Hacker House Goa 2026 — partners & supporters.
 * Clean, left-aligned wordmark row to sit quietly above the footer.
 */

type Partner = { name: string; href: string };

const PARTNERS: Partner[] = [
  { name: "Wispr Flow", href: "https://wisprflow.ai/" },
  { name: "Cake Wallet", href: "https://cakewallet.com/" },
  { name: "AI Grants", href: "https://aigrants.in/" },
  { name: "Dodo Payments", href: "https://dodopayments.com/" },
  { name: "Edge City", href: "https://www.edgecity.live/" },
  { name: "Socket", href: "https://socket.dev/" },
  { name: "TigerGraph", href: "https://www.tigergraph.com/" },
];

export default function Sponsors() {
  return (
    <div>
      <h2 className="text-xl font-bold text-white">In good company</h2>
      <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-4">
        {PARTNERS.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
          >
            {p.name}
          </a>
        ))}
      </div>
      <p className="mt-6 text-xs text-slate-500">Hacker House Goa 2026</p>
    </div>
  );
}

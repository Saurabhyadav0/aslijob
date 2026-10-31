import React from "react";

/**
 * Hacker House Goa 2026 — partners & supporters.
 * Real partner wordmarks shown on light chips so every logo stays legible on
 * the dark footer. Muted at rest, full colour on hover.
 */

type Partner = {
  name: string;
  tag: string;
  href: string;
  src: string;
};

const PARTNERS: Partner[] = [
  { name: "Wispr Flow", tag: "Voice AI", href: "https://wisprflow.ai/", src: "/sponsors/wisprflow.png" },
  { name: "Cake Wallet", tag: "Privacy wallet", href: "https://cakewallet.com/", src: "/sponsors/cakewallet.png" },
  { name: "AI Grants", tag: "Grants", href: "https://aigrants.in/", src: "/sponsors/aigrants.png" },
  { name: "Dodo Payments", tag: "Payments", href: "https://dodopayments.com/", src: "/sponsors/dodopayments.png" },
  { name: "Edge City", tag: "Community", href: "https://www.edgecity.live/", src: "/sponsors/edgecity.png" },
  { name: "Socket", tag: "OSS security", href: "https://socket.dev/", src: "/sponsors/socket.png" },
  { name: "TigerGraph", tag: "Graph database", href: "https://www.tigergraph.com/", src: "/sponsors/tigergraph.png" },
];

function Logo({ p }: { p: Partner }) {
  return (
    <a
      href={p.href}
      target="_blank"
      rel="noreferrer"
      title={`${p.name} · ${p.tag}`}
      className="group flex h-16 items-center justify-center rounded-xl border border-white/10 bg-white/90 px-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-black/30"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.src}
        alt={p.name}
        loading="lazy"
        className="max-h-7 w-auto max-w-[130px] object-contain opacity-90 transition duration-200 group-hover:opacity-100"
      />
    </a>
  );
}

export default function Sponsors() {
  return (
    <section className="space-y-6">
      <div className="space-y-1 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          In good company
        </p>
        <p className="text-xs text-slate-500">
          Partners &amp; supporters of Hacker House Goa 2026
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {PARTNERS.map((p) => (
          <Logo key={p.name} p={p} />
        ))}
      </div>
    </section>
  );
}

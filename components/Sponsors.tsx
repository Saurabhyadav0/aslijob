import React from "react";

/**
 * Hacker House Goa 2026 — technology partners / sponsor stack.
 * Inline-SVG brand marks (no external assets) so the strip renders offline
 * and stays crisp on every screen. Monochrome by default, brand tint on hover.
 */

type Partner = {
  name: string;
  href: string;
  color: string;
  glyph: React.ReactNode;
};

const PARTNERS: Partner[] = [
  {
    name: "TigerGraph",
    href: "https://www.tigergraph.com",
    color: "#F6821F",
    glyph: (
      <>
        <circle cx="5" cy="12" r="2.3" />
        <circle cx="16" cy="6" r="2.3" />
        <circle cx="16" cy="18" r="2.3" />
        <path d="M7 11 14 6.8M7 13l7 4.2M16 8.3v7.4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </>
    ),
  },
  {
    name: "Base",
    href: "https://base.org",
    color: "#2563EB",
    glyph: (
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-1.2 9H3.2a8.9 8.9 0 0 1 .3-2h7.3v2Z" />
    ),
  },
  {
    name: "Supabase",
    href: "https://supabase.com",
    color: "#3ECF8E",
    glyph: <path d="M13 2 4 13h7l-1 9 10-12h-7l1-8Z" />,
  },
  {
    name: "Vercel",
    href: "https://vercel.com",
    color: "#e2e8f0",
    glyph: <path d="M12 4 21 20H3L12 4Z" />,
  },
  {
    name: "Telegram",
    href: "https://web.telegram.org/k/#@AsliJobBot",
    color: "#2AABEE",
    glyph: <path d="M21 4 2.5 11.2c-.9.3-.9 1.6 0 1.9l4.6 1.5 1.8 5.3c.3.8 1.3 1 1.9.3l2.4-2.5 4.6 3.4c.7.5 1.6.1 1.8-.7L22 5.1c.2-.9-.6-1.5-1-1.1Zm-4 3.5-7 6.3-.3 3.3" />
  },
  {
    name: "Dodo Payments",
    href: "https://dodopayments.com",
    color: "#A78BFA",
    glyph: (
      <>
        <rect x="3.5" y="6.5" width="17" height="11" rx="2.5" />
        <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="7.5" cy="14" r="1" />
      </>
    ),
  },
  {
    name: "viaSocket",
    href: "https://viasocket.com",
    color: "#38BDF8",
    glyph: (
      <>
        <path d="M11 3 5 12h5l-1 9 8-11h-5l1-7Z" />
      </>
    ),
  },
  {
    name: "Gemini",
    href: "https://deepmind.google/technologies/gemini/",
    color: "#C084FC",
    glyph: <path d="M12 2c.6 5.3 2.7 7.4 8 8-5.3.6-7.4 2.7-8 8-.6-5.3-2.7-7.4-8-8 5.3-.6 7.4-2.7 8-8Z" />,
  },
];

function Mark({ p }: { p: Partner }) {
  return (
    <a
      href={p.href}
      target="_blank"
      rel="noreferrer"
      title={p.name}
      className="group flex items-center gap-2 whitespace-nowrap text-slate-500 transition-colors duration-200"
      style={{ ["--brand" as any]: p.color }}
    >
      <span className="text-slate-500 transition-colors duration-200 group-hover:text-[var(--brand)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          {p.glyph}
        </svg>
      </span>
      <span className="text-[13px] font-bold tracking-tight text-slate-400 transition-colors duration-200 group-hover:text-slate-100">
        {p.name}
      </span>
    </a>
  );
}

export default function Sponsors() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-700" />
        Powered by · Hacker House Goa 2026
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-700" />
      </div>

      {/* Desktop: static centered row. Mobile: auto-scrolling marquee. */}
      <div className="hidden flex-wrap items-center justify-center gap-x-8 gap-y-4 md:flex">
        {PARTNERS.map((p) => (
          <Mark key={p.name} p={p} />
        ))}
      </div>

      <div className="relative overflow-hidden md:hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-8 py-1">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <Mark key={`${p.name}-${i}`} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

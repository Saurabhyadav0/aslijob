import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AsliJob — Check a job offer before you pay",
  description:
    "Paste a job message, number or UPI and get Safe / Suspicious / Scam in seconds, backed by a shared fraud graph.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#060a14] font-sans text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Background: clean, near-flat dark with one soft accent glow + faint arc */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-emerald-500/[0.05] blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-10%,rgba(16,185,129,0.04)_0%,transparent_55%)]" />
          <svg className="absolute -right-24 top-10 h-[420px] w-[520px] opacity-[0.07]" viewBox="0 0 520 420" fill="none" aria-hidden="true">
            <path d="M520 20 C 360 60, 240 160, 220 420" stroke="white" strokeWidth="1" />
            <path d="M520 90 C 380 130, 280 220, 270 420" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        <div className="mx-auto min-h-screen w-full max-w-5xl px-5 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}

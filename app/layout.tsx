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
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {/* Background: animated command-center scene — aurora + panning grid + scanline */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* drifting aurora blobs */}
          <div className="aurora aurora-1 -top-40 -left-32 h-[520px] w-[520px] bg-sky-500/30" />
          <div className="aurora aurora-2 top-1/3 -right-40 h-[560px] w-[560px] bg-fuchsia-600/20" />
          <div className="aurora aurora-3 bottom-0 left-1/4 h-[480px] w-[480px] bg-indigo-600/20" />

          {/* panning grid, faded toward edges */}
          <div
            className="grid-pan absolute inset-0 opacity-60"
            style={{
              maskImage: "radial-gradient(ellipse 90% 70% at 50% 15%, #000 35%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 15%, #000 35%, transparent 100%)",
            }}
          />

          {/* sweeping scanline */}
          <div className="scanline" />

          {/* vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,transparent_40%,rgba(2,6,23,0.6)_100%)]" />
        </div>

        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </body>
    </html>
  );
}

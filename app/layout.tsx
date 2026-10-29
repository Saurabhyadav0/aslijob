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
        {/* Subtle Background Glow Mesh */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/10 via-blue-600/5 to-transparent blur-3xl opacity-70" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-t from-emerald-500/5 to-transparent blur-3xl opacity-50" />
        </div>

        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </body>
    </html>
  );
}

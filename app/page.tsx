"use client";

import { useState } from "react";

type Reason = { id: string; text: string };
type CheckResult = {
  verdict: "safe" | "suspicious" | "scam";
  confidence: number;
  reasons: Reason[];
  graph: { linkedReports: number; cities: number };
  nextStep: string;
  demoSources: string[];
};

const STYLE: Record<string, { box: string; label: string; icon: string }> = {
  safe: { box: "bg-safe", label: "Safe", icon: "✓" },
  suspicious: { box: "bg-suspicious", label: "Suspicious", icon: "!" },
  scam: { box: "bg-scam", label: "Scam", icon: "✕" },
};

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, channel: "web", lang: "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Check failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const s = result ? STYLE[result.verdict] : null;

  return (
    <main className="py-8">
      <h1 className="text-2xl font-bold">Got a job offer? Check it before you pay.</h1>
      <p className="mt-1 text-gray-600">
        Paste the message, number or link. We tell you if it looks like a scam, and why.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a WhatsApp/Telegram job message, recruiter email, number or UPI ID…"
        className="mt-4 h-40 w-full rounded-xl border border-gray-300 p-3 text-base outline-none focus:border-gray-500"
      />

      <button
        onClick={check}
        disabled={loading || !text.trim()}
        className="mt-3 w-full rounded-xl bg-gray-900 py-3 text-base font-semibold text-white disabled:opacity-40"
      >
        {loading ? "Checking…" : "Check this"}
      </button>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-scam">{error}</p>}

      {result && s && (
        <section className="mt-6">
          <div className={`flex items-center gap-3 rounded-xl ${s.box} p-4 text-white`}>
            <span className="text-2xl font-bold" aria-hidden>
              {s.icon}
            </span>
            <div>
              <div className="text-lg font-bold">{s.label}</div>
              <div className="text-sm opacity-90">
                {Math.round(result.confidence * 100)}% confidence
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {result.reasons.map((r) => (
              <li key={r.id} className="rounded-lg bg-white p-3 shadow-sm">
                {r.text}
              </li>
            ))}
          </ul>

          <p className="mt-4 font-semibold">{result.nextStep}</p>

          {result.demoSources.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">demo data: {result.demoSources.join(", ")}</p>
          )}
        </section>
      )}
    </main>
  );
}

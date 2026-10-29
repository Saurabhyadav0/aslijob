import type { AiVerdict } from "./score";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

/**
 * Calls Gemini Flash to get an AI verdict on difficult or unstructured messages.
 * Uses a strict 2-second timeout and falls back safely to rules-only mode.
 */
export async function getGeminiVerdict(
  text: string,
  ruleSummary: string,
): Promise<AiVerdict> {
  if (!GEMINI_API_KEY || !text.trim()) {
    return { verdict: "safe", confidence: 0.5 };
  }

  const prompt = `You are AsliJob, an Indian job-offer scam detector.
Analyze this message for job fraud, phishing, fee-to-get-hired demands, or task scams.
Rules detected: ${ruleSummary || "None"}

Message:
"""
${text.slice(0, 1000)}
"""

Respond ONLY with valid JSON in this exact shape:
{"verdict": "safe" | "suspicious" | "scam", "confidence": 0.0 to 1.0}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { verdict: "safe", confidence: 0.5 };
    }

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return { verdict: "safe", confidence: 0.5 };

    const parsed = JSON.parse(content);
    if (parsed.verdict === "scam" || parsed.verdict === "suspicious" || parsed.verdict === "safe") {
      return {
        verdict: parsed.verdict,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
      };
    }
  } catch {
    // Graceful fallback to rules-only
  }

  return { verdict: "safe", confidence: 0.5 };
}

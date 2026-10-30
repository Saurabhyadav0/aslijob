import { describe, it, expect } from "vitest";
import { translations, getSpeechLanguage, formatSpokenVerdict, type Language } from "@/lib/i18n";

describe("Indian Languages and Voice (F08)", () => {
  it("maintains complete key parity across English, Hindi, and Marathi", () => {
    const enKeys = Object.keys(translations.en).sort();
    const hiKeys = Object.keys(translations.hi).sort();
    const mrKeys = Object.keys(translations.mr).sort();

    expect(hiKeys).toEqual(enKeys);
    expect(mrKeys).toEqual(enKeys);
    expect(enKeys.length).toBeGreaterThanOrEqual(40);
  });

  it("verifies speech language code mappings for Indian locales", () => {
    expect(getSpeechLanguage("hi")).toBe("hi-IN");
    expect(getSpeechLanguage("mr")).toBe("mr-IN");
    expect(getSpeechLanguage("en")).toBe("en-IN");
  });

  it("formats spoken verdicts in Hindi with proper urgent caution", () => {
    const scamSpeech = formatSpokenVerdict("scam", 0.95, "पंजीकरण शुल्क मांगा गया है", "hi");
    expect(scamSpeech).toContain("सावधान");
    expect(scamSpeech).toContain("घोटाला");
    expect(scamSpeech).toContain("95 प्रतिशत");

    const susSpeech = formatSpokenVerdict("suspicious", 0.86, "टेलीग्राम पर जाने को कहा", "hi");
    expect(susSpeech).toContain("चेतावनी");
    expect(susSpeech).toContain("संदिग्ध");
    expect(susSpeech).toContain("86 प्रतिशत");

    const safeSpeech = formatSpokenVerdict("safe", 0.5, undefined, "hi");
    expect(safeSpeech).toContain("सुरक्षित");
  });

  it("formats spoken verdicts in Marathi correctly", () => {
    const mrScam = formatSpokenVerdict("scam", 0.9, "फीस मागितली", "mr");
    expect(mrScam).toContain("सावधान");
    expect(mrScam).toContain("फसवणूक");

    const mrSus = formatSpokenVerdict("suspicious", 0.85, "संशयास्पद मेसेज", "mr");
    expect(mrSus).toContain("इशारा");
    expect(mrSus).toContain("संशयास्पद");
  });

  it("formats spoken verdicts in English accurately", () => {
    const enScam = formatSpokenVerdict("scam", 0.92, "Rs 2500 registration fee requested", "en");
    expect(enScam).toContain("Warning!");
    expect(enScam).toContain("confirmed scam");
    expect(enScam).toContain("92 percent");
    expect(enScam).toContain("Do not send any money");
  });
});


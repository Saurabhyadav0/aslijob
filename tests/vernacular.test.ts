import { describe, it, expect } from "vitest";
import {
  translations,
  getSpeechLanguage,
  formatSpokenVerdict,
  SUPPORTED_LANGUAGES,
  Language,
} from "@/lib/i18n";

describe("Pan-India Vernacular Expansion (F20)", () => {
  it("supports 8 Pan-India languages", () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(8);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(["en", "hi", "mr", "ta", "te", "kn", "bn", "gu"]);
  });

  it("maintains 100% key parity across all language translation dictionaries", () => {
    const baseKeys = Object.keys(translations.en).sort();

    const languages: Language[] = ["hi", "mr", "ta", "te", "kn", "bn", "gu"];
    for (const lang of languages) {
      const langKeys = Object.keys(translations[lang]).sort();
      expect(langKeys).toEqual(baseKeys);
    }
  });

  it("maps language codes to appropriate BCP-47 speech tags for Indian accents", () => {
    expect(getSpeechLanguage("en")).toBe("en-IN");
    expect(getSpeechLanguage("hi")).toBe("hi-IN");
    expect(getSpeechLanguage("mr")).toBe("mr-IN");
    expect(getSpeechLanguage("ta")).toBe("ta-IN");
    expect(getSpeechLanguage("te")).toBe("te-IN");
    expect(getSpeechLanguage("kn")).toBe("kn-IN");
    expect(getSpeechLanguage("bn")).toBe("bn-IN");
    expect(getSpeechLanguage("gu")).toBe("gu-IN");
  });

  it("formats spoken speech synthesis verdicts across South and East Indian languages", () => {
    // Tamil
    const spokenTa = formatSpokenVerdict("scam", 0.95, "முன்பணம் கேட்கப்பட்டது", "ta");
    expect(spokenTa).toContain("எச்சரிக்கை");
    expect(spokenTa).toContain("95");
    expect(spokenTa).toContain("மோசடி");

    // Telugu
    const spokenTe = formatSpokenVerdict("scam", 0.9, "ఫీజు డిమాండ్", "te");
    expect(spokenTe).toContain("హెచ్చరిక");
    expect(spokenTe).toContain("90");
    expect(spokenTe).toContain("మోసం");

    // Kannada
    const spokenKn = formatSpokenVerdict("scam", 0.88, undefined, "kn");
    expect(spokenKn).toContain("ಎಚ್ಚರಿಕೆ");
    expect(spokenKn).toContain("88");

    // Bengali
    const spokenBn = formatSpokenVerdict("scam", 0.92, undefined, "bn");
    expect(spokenBn).toContain("সাবধান");
    expect(spokenBn).toContain("92");

    // Gujarati
    const spokenGu = formatSpokenVerdict("scam", 0.89, undefined, "gu");
    expect(spokenGu).toContain("સાવધાન");
    expect(spokenGu).toContain("89");
  });
});

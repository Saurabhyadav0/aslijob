"use client";

import React, { useState, useEffect } from "react";
import { type Language, translations, getSpeechLanguage, formatSpokenVerdict } from "@/lib/i18n";
import type { Verdict } from "@/lib/types";

type VoiceSpeakerProps = {
  verdict: Verdict;
  confidence: number;
  firstReason?: string;
  lang: Language;
};

export default function VoiceSpeaker({ verdict, confidence, firstReason, lang }: VoiceSpeakerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, []);

  function toggleSpeech() {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const textToSpeak = formatSpokenVerdict(verdict, confidence, firstReason, lang);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = getSpeechLanguage(lang);
    utterance.rate = 0.95; // slightly slower for maximum clarity

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      title={isSpeaking ? t.stopSpeaking : t.speakVerdict}
      aria-label={isSpeaking ? t.stopSpeaking : t.speakVerdict}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 active:scale-95 ${
        isSpeaking
          ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 animate-pulse ring-2 ring-sky-300"
          : "border border-white/10 bg-slate-800/80 text-sky-400 hover:bg-slate-700 hover:text-sky-300"
      }`}
    >
      <span className="text-sm">{isSpeaking ? "⏹️" : "🔊"}</span>
      <span>{isSpeaking ? t.speaking : t.speakVerdict}</span>
    </button>
  );
}


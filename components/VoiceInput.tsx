"use client";

import React, { useState, useEffect, useRef } from "react";
import { type Language, translations, getSpeechLanguage } from "@/lib/i18n";

type VoiceInputProps = {
  lang: Language;
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

export default function VoiceInput({ lang, onTranscript, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const t = translations[lang];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechLanguage(lang);

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== "no-speech") {
          setErrorMessage(event.error === "not-allowed" ? "Microphone access denied" : "Speech error");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [lang, onTranscript]);

  function toggleListening() {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = getSpeechLanguage(lang);
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  }

  if (!isSupported) {
    return null; // Silently hide if browser does not support Web Speech
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? t.micListening : t.micBtn}
        aria-label={isListening ? t.micListening : t.micBtn}
        className={`group relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
          isListening
            ? "bg-rose-500 text-white ring-2 ring-rose-400/50 shadow-lg shadow-rose-500/30 animate-pulse"
            : "border border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
        } disabled:opacity-40`}
      >
        <span className="text-sm">{isListening ? "🔴" : "🎙️"}</span>
        <span className="hidden sm:inline">{isListening ? t.micListening : t.micBtn}</span>
      </button>

      {errorMessage && (
        <span className="absolute -top-7 left-0 whitespace-nowrap rounded-lg bg-rose-950 border border-rose-500/30 px-2 py-0.5 text-[10px] text-rose-300">
          {errorMessage}
        </span>
      )}
    </div>
  );
}


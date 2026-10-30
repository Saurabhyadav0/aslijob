export type DeepfakeAudioMetrics = {
  pitchVarianceHz?: number; // Natural human speech is typically > 25 Hz; AI models often < 14 Hz
  breathPauseCount?: number; // AI synthetic voice clones rarely produce authentic respiratory pauses
  durationSeconds?: number;
  transcript?: string;
  meetingLink?: string;
  audioSignatureBase64?: string;
};

export type DeepfakeAnalysisResult = {
  isSynthetic: boolean;
  deepfakeRiskScore: number; // 0 - 100
  verdict: "AI_GENERATED_VOICE_CLONE" | "SUSPICIOUS_SYNTHETIC" | "NATURAL_HUMAN";
  detectedArtifacts: string[];
  acousticSignatures: {
    pitchFlatness: "abnormally_flat" | "natural";
    respiratoryRealism: "synthetic_no_pauses" | "natural_breathing";
    knownAvatarPlatform?: "heygen" | "synthesia" | "elevenlabs" | "telegram_bot_tts";
  };
  recommendation: string;
};

const SYNTHETIC_RECRUITER_SCRIPT_TRIGGERS = [
  /daily income will be credited after you pay/i,
  /telegram verification task manager/i,
  /youtube like task coordinator/i,
  /hr manager kindly send deposit/i,
  /automated screening avatar/i,
];

const KNOWN_AVATAR_DOMAINS = [
  { match: /heygen\.com|heygen\.ai/i, name: "heygen" as const },
  { match: /synthesia\.io/i, name: "synthesia" as const },
  { match: /elevenlabs\.io/i, name: "elevenlabs" as const },
];

/**
 * Evaluates audio acoustic indicators and interview transcripts for AI deepfake voice clones.
 */
export function detectVoiceCloneRisk(metrics: DeepfakeAudioMetrics): DeepfakeAnalysisResult {
  const artifacts: string[] = [];
  let riskScore = 0;

  // 1. Acoustic Metric: Pitch Variance
  let pitchFlatness: "abnormally_flat" | "natural" = "natural";
  if (typeof metrics.pitchVarianceHz === "number") {
    if (metrics.pitchVarianceHz < 15) {
      riskScore += 40;
      pitchFlatness = "abnormally_flat";
      artifacts.push(
        `Abnormally flat acoustic pitch variance (${metrics.pitchVarianceHz.toFixed(
          1,
        )} Hz vs natural human >25 Hz) indicating neural vocoder / TTS model`,
      );
    } else if (metrics.pitchVarianceHz < 22) {
      riskScore += 20;
      pitchFlatness = "abnormally_flat";
      artifacts.push("Borderline synthetic pitch variance");
    }
  }

  // 2. Acoustic Metric: Respiratory Breathing Pauses
  let respiratoryRealism: "synthetic_no_pauses" | "natural_breathing" = "natural_breathing";
  if (typeof metrics.breathPauseCount === "number" && typeof metrics.durationSeconds === "number") {
    const expectedBreaths = Math.max(1, Math.floor(metrics.durationSeconds / 5)); // humans breathe ~12-20 times/min (~1 per 3-5 sec)
    if (metrics.durationSeconds > 10 && metrics.breathPauseCount === 0) {
      riskScore += 35;
      respiratoryRealism = "synthetic_no_pauses";
      artifacts.push(
        "Complete lack of natural respiratory/breathing acoustic pauses in continuous voice stream",
      );
    } else if (metrics.breathPauseCount < expectedBreaths * 0.3) {
      riskScore += 15;
      artifacts.push("Unusually low respiratory frequency");
    }
  }

  // 3. Transcript Scam Signatures
  if (metrics.transcript) {
    for (const pattern of SYNTHETIC_RECRUITER_SCRIPT_TRIGGERS) {
      if (pattern.test(metrics.transcript)) {
        riskScore += 35;
        artifacts.push(`Automated cybercrime syndicate audio script detected: "${metrics.transcript.slice(0, 40)}..."`);
        break;
      }
    }
  }

  // 4. Video Interview / Avatar Link Analysis
  let knownAvatarPlatform: "heygen" | "synthesia" | "elevenlabs" | "telegram_bot_tts" | undefined;
  if (metrics.meetingLink) {
    for (const item of KNOWN_AVATAR_DOMAINS) {
      if (item.match.test(metrics.meetingLink)) {
        riskScore += 45;
        knownAvatarPlatform = item.name;
        artifacts.push(`Interview link utilizes pre-recorded synthetic AI avatar platform: ${item.name}`);
        break;
      }
    }
    if (/t\.me\/(.*bot|\+)/i.test(metrics.meetingLink)) {
      riskScore += 25;
      knownAvatarPlatform = "telegram_bot_tts";
      artifacts.push("Redirects interview to anonymous Telegram audio stream");
    }
  }

  // Cap riskScore at 100
  const finalScore = Math.min(100, riskScore);
  const isSynthetic = finalScore >= 60;
  const verdict: "AI_GENERATED_VOICE_CLONE" | "SUSPICIOUS_SYNTHETIC" | "NATURAL_HUMAN" =
    finalScore >= 70
      ? "AI_GENERATED_VOICE_CLONE"
      : finalScore >= 40
      ? "SUSPICIOUS_SYNTHETIC"
      : "NATURAL_HUMAN";

  const recommendation = isSynthetic
    ? "🚨 ALERT: High probability of an AI-generated synthetic voice clone or deepfake avatar. Legitimate corporate HRs never conduct anonymous AI avatar interviews. Do not pay any registration fee or download remote APKs."
    : finalScore >= 40
    ? "⚠️ CAUTION: Voice sample displays unnatural acoustic uniformity. Request an in-person or official MS Teams / Google Meet video interview from the corporate domain."
    : "✅ Acoustic properties match natural human speech patterns.";

  return {
    isSynthetic,
    deepfakeRiskScore: finalScore,
    verdict,
    detectedArtifacts: artifacts,
    acousticSignatures: {
      pitchFlatness,
      respiratoryRealism,
      knownAvatarPlatform,
    },
    recommendation,
  };
}


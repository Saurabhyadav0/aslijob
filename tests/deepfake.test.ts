import { describe, it, expect } from "vitest";
import { detectVoiceCloneRisk } from "@/lib/deepfake";
import { POST as deepfakePost } from "@/app/api/check/deepfake/route";
import { NextRequest } from "next/server";

describe("AI Deepfake Recruiter & Voice Clone Detection (F21)", () => {
  describe("Acoustic Signature & Script Analysis", () => {
    it("flags synthetic voice clones with flat pitch and zero respiratory pauses", () => {
      const result = detectVoiceCloneRisk({
        pitchVarianceHz: 11.2, // abnormally flat
        breathPauseCount: 0, // unnatural unbroken stream
        durationSeconds: 25,
        transcript: "Hello, I am the HR Manager kindly send deposit to proceed.",
      });

      expect(result.isSynthetic).toBe(true);
      expect(result.deepfakeRiskScore).toBeGreaterThanOrEqual(70);
      expect(result.verdict).toBe("AI_GENERATED_VOICE_CLONE");
      expect(result.acousticSignatures.pitchFlatness).toBe("abnormally_flat");
      expect(result.acousticSignatures.respiratoryRealism).toBe("synthetic_no_pauses");
      expect(result.detectedArtifacts.length).toBeGreaterThanOrEqual(2);
      expect(result.recommendation).toContain("ALERT");
    });

    it("verifies natural human recruiter voice samples", () => {
      const result = detectVoiceCloneRisk({
        pitchVarianceHz: 32.5, // natural human inflection
        breathPauseCount: 6,
        durationSeconds: 25,
        transcript: "Welcome to the interview, please tell us about your experience in React.",
      });

      expect(result.isSynthetic).toBe(false);
      expect(result.deepfakeRiskScore).toBeLessThan(30);
      expect(result.verdict).toBe("NATURAL_HUMAN");
      expect(result.acousticSignatures.pitchFlatness).toBe("natural");
      expect(result.acousticSignatures.respiratoryRealism).toBe("natural_breathing");
    });

    it("detects synthetic AI video avatar interview platforms", () => {
      const result = detectVoiceCloneRisk({
        meetingLink: "https://app.heygen.com/share/avatar-interview-session-88219",
      });

      expect(result.deepfakeRiskScore).toBeGreaterThanOrEqual(40);
      expect(result.acousticSignatures.knownAvatarPlatform).toBe("heygen");
      expect(result.detectedArtifacts.some((a) => a.includes("heygen"))).toBe(true);
    });
  });

  describe("Deepfake HTTP API Endpoint", () => {
    it("POST /api/check/deepfake evaluates metrics and returns full analysis", async () => {
      const req = new NextRequest("https://aslijob.vercel.app/api/check/deepfake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchVarianceHz: 10.5,
          breathPauseCount: 0,
          durationSeconds: 30,
          transcript: "YouTube like task coordinator will credit daily earnings.",
        }),
      });

      const res = await deepfakePost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.analysis.isSynthetic).toBe(true);
      expect(data.analysis.verdict).toBe("AI_GENERATED_VOICE_CLONE");
      expect(data.checkedAt).toBeDefined();
    });
  });
});

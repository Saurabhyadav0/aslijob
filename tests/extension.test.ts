import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { runCheck } from "@/lib/check";

describe("Chrome Extension (F12)", () => {
  const extensionDir = resolve(process.cwd(), "extension");
  const manifestPath = resolve(extensionDir, "manifest.json");

  it("manifest.json exists and adheres to Manifest V3 specification", () => {
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toContain("AsliJob");
    expect(manifest.permissions).toContain("contextMenus");
    expect(manifest.host_permissions).toContain("https://aslijob.vercel.app/*");

    const contentScript = manifest.content_scripts?.[0];
    expect(contentScript).toBeDefined();
    expect(contentScript.matches).toEqual(
      expect.arrayContaining([
        "https://*.linkedin.com/*",
        "https://*.naukri.com/*",
        "https://mail.google.com/*",
      ]),
    );
  });

  it("enforces Rule 8 (One check API): background & popup route to POST /api/check", () => {
    const backgroundJs = readFileSync(resolve(extensionDir, "background.js"), "utf-8");
    const popupJs = readFileSync(resolve(extensionDir, "popup.js"), "utf-8");

    // Both scripts must call the shared check endpoint
    expect(backgroundJs).toContain("/api/check");
    expect(backgroundJs).toContain('channel: "extension"');

    expect(popupJs).toContain("/api/check");
    expect(popupJs).toContain('channel: "extension"');

    // Neither script should duplicate local check scoring
    expect(backgroundJs).not.toContain("finalVerdict");
    expect(popupJs).not.toContain("finalVerdict");
  });

  it("executes check pipeline with channel: 'extension'", async () => {
    const result = await runCheck({
      text: "Congratulations! You are selected for TCS. Pay Rs 2,500 security deposit.",
      channel: "extension",
    });

    expect(result.checkId).toBeDefined();
    expect(result.verdict).toBe("suspicious");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.reasons[0].id).toBe("fee_requested");
  });
});

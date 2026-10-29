import { describe, it, expect, beforeEach } from "vitest";
import { runCheck } from "@/lib/check";
import { clearStore, getCheck } from "@/lib/store";
import { GET as shareGet } from "@/app/api/share/[id]/route";

describe("Share Warning Card & Result Page (F05 / U18)", () => {
  beforeEach(() => {
    clearStore();
  });

  it("U18: persists check result and generates shareable warning card", async () => {
    const check = await runCheck({
      text: "Pay 3500 registration fee to 9876543210 for Infosys job offer",
    });

    // 1. Result data is persisted
    const stored = getCheck(check.checkId);
    expect(stored).not.toBeNull();
    expect(stored?.checkId).toBe(check.checkId);
    expect(stored?.verdict).toBe("suspicious");

    // 2. GET /api/share/[id] returns an SVG image
    const imgReq = new Request(`http://localhost:3000/api/share/${check.checkId}`);
    const imgRes = await shareGet(imgReq, { params: { id: check.checkId } });
    expect(imgRes.status).toBe(200);
    expect(imgRes.headers.get("Content-Type")).toBe("image/svg+xml");
    const svgText = await imgRes.text();
    expect(svgText).toContain("<svg");
    expect(svgText).toContain("AsliJob");
    expect(svgText).toContain("SUSPICIOUS");

    // 3. GET /api/share/[id]?format=json returns card metadata
    const jsonReq = new Request(`http://localhost:3000/api/share/${check.checkId}?format=json`);
    const jsonRes = await shareGet(jsonReq, { params: { id: check.checkId } });
    expect(jsonRes.status).toBe(200);
    const meta = await jsonRes.json();
    expect(meta).toHaveProperty("headline");
    expect(meta).toHaveProperty("mainReason");
    expect(meta.verdict).toBe("suspicious");
  });

  it("returns 404 for nonexistent check ID", async () => {
    const req = new Request("http://localhost:3000/api/share/nonexistent-id");
    const res = await shareGet(req, { params: { id: "nonexistent-id" } });
    expect(res.status).toBe(404);
  });
});

import { describe, it, expect } from "vitest";
import { GET as getThreats } from "@/app/api/college/threats/route";
import { POST as postBroadcast, GET as getHistory } from "@/app/api/college/broadcast/route";
import { getCollegeProfile, getCampusThreats, setCollegePlan } from "@/lib/college";

describe("College Placement Dashboard (F09)", () => {
  it("GET /api/college/threats returns campus metrics and live threats", async () => {
    const req = new Request("http://localhost:3000/api/college/threats?collegeId=coep-pune");
    const res = await getThreats(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.college.id).toBe("coep-pune");
    expect(data.college.domain).toBe("coep.ac.in");
    expect(data.metrics.totalReports).toBeGreaterThanOrEqual(1);
    expect(data.metrics.batchSize).toBe(1250);
    expect(Array.isArray(data.threats)).toBe(true);
    expect(data.threats.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/college/broadcast successfully triggers batch warning for pro campus", async () => {
    const req = new Request("http://localhost:3000/api/college/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collegeId: "coep-pune",
        title: "🚨 URGENT: Fake TCS Offer Letter Scam Alert",
        message:
          "Attention students: A fake recruiter claiming to be TCS is asking for Rs 2500 laptop deposit. Genuine recruiters never charge fees. Verify offers on aslijob.vercel.app.",
        channels: ["whatsapp_broadcast", "campus_portal"],
      }),
    });

    const res = await postBroadcast(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.broadcast.recipientCount).toBe(1250);
    expect(data.broadcast.channels).toContain("whatsapp_broadcast");

    // Verify broadcast history
    const historyReq = new Request("http://localhost:3000/api/college/broadcast?collegeId=coep-pune");
    const historyRes = await getHistory(historyReq);
    const historyData = await historyRes.json();
    expect(historyData.history.length).toBeGreaterThanOrEqual(1);
  });

  it("enforces paid plan gating: blocks unverified free trial from batch broadcast", async () => {
    const req = new Request("http://localhost:3000/api/college/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collegeId: "trial-college",
        title: "Test Warning Alert",
        message: "Testing message broadcast from unverified trial college without pro subscription.",
      }),
    });

    // We simulate a college on a free trial plan
    setCollegePlan("trial-college", "free_trial");

    const res = await postBroadcast(req);
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.error.code).toBe("payment_required");
  });
});

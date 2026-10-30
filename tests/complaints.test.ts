import { describe, it, expect } from "vitest";
import { generateCyberDossier, getDossier, listDossiers } from "@/lib/complaints";
import { POST as dossierPost, GET as dossierGet } from "@/app/api/complaints/dossier/route";
import { GET as exportGet } from "@/app/api/complaints/export/route";
import { NextRequest } from "next/server";

describe("National Cybercrime 1930 / I4C Dossier Generator (F15)", () => {
  it("generates structured law enforcement complaint dossier with evidence hash", () => {
    const dossier = generateCyberDossier({
      state: "Maharashtra",
      city: "Pune",
      jobScamType: "task_fraud",
      claimedCompany: "Amazon India",
      suspectPhones: ["+91 98220 12345", "+91 97110 54321"],
      suspectUpis: ["task.commission@okhdfcbank", "hr.ops@icici"],
      suspectWallets: ["TXn8Q2ZtJ4m9kXpLw81yP7cBaVnMo3kLp"],
      amountLostInr: 12500,
      utrOrTransactionIds: ["UTR410294810294", "UTR410294810295"],
      incidentDate: "2026-10-29",
      narrative:
        "Victim was lured via Telegram channel promising daily video review earnings. After paying Rs 12,500 security fee to unlock funds, suspect blocked victim.",
    });

    expect(dossier.acknowledgementNumber).toContain("/I4C/JOB/MA/");
    expect(dossier.subCategory).toContain("Video Review Task Scam");
    expect(dossier.evidenceIntegrityHash).toBeDefined();
    expect(dossier.evidenceIntegrityHash.length).toBe(64); // SHA-256
    expect(dossier.suspectIdentifiers.saltedHashes.length).toBeGreaterThan(0);
    expect(dossier.applicableLegalSections).toContain(
      "Section 66D, Information Technology Act, 2000 (Cheating by personation using computer resource)",
    );
    expect(dossier.formalComplaintDraft).toContain("FORMAL CYBERCRIME COMPLAINT DOSSIER");
    expect(dossier.formalComplaintDraft).toContain("Helpline 1930");
  });

  it("retrieves and filters stored dossiers", () => {
    const d1 = generateCyberDossier({
      state: "Karnataka",
      city: "Bengaluru",
      jobScamType: "fake_offer_letter",
      claimedCompany: "Infosys",
      suspectPhones: ["+91 99887 76655"],
      suspectUpis: ["infy.campus@upi"],
      amountLostInr: 5000,
      incidentDate: "2026-10-28",
      narrative: "Forged Infosys offer letter requesting training fees.",
    });

    const fetched = getDossier(d1.dossierId);
    expect(fetched).not.toBeNull();
    expect(fetched?.city).toBe("Bengaluru");

    const karnatakaDossiers = listDossiers("Karnataka");
    expect(karnatakaDossiers.some((d) => d.dossierId === d1.dossierId)).toBe(true);
  });

  it("POST /api/complaints/dossier creates complaint via API", async () => {
    const req = new NextRequest("https://aslijob.vercel.app/api/complaints/dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: "Delhi NCR",
        city: "New Delhi",
        jobScamType: "interview_security_deposit",
        claimedCompany: "Wipro",
        suspectPhones: ["+91 98110 00112"],
        suspectUpis: ["wipro.gatepass@sbi"],
        amountLostInr: 2500,
        narrative: "Scammer demanded laptop courier security deposit.",
      }),
    });

    const res = await dossierPost(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.dossier.acknowledgementNumber).toBeDefined();
    expect(data.dossier.city).toBe("New Delhi");
  });

  it("GET /api/complaints/export downloads formatted police complaint text", async () => {
    const dossier = generateCyberDossier({
      state: "Maharashtra",
      city: "Mumbai",
      jobScamType: "remote_app_extortion",
      suspectPhones: ["+91 91234 56789"],
      suspectUpis: ["support@paytm"],
      amountLostInr: 15000,
      incidentDate: "2026-10-30",
      narrative: "Instructed to install AnyDesk APK during remote job interview.",
    });

    const req = new NextRequest(
      `https://aslijob.vercel.app/api/complaints/export?id=${dossier.dossierId}&format=text`,
    );
    const res = await exportGet(req);

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("FORMAL CYBERCRIME COMPLAINT DOSSIER");
    expect(text).toContain("Section 66D IT Act 2000");
    expect(text).toContain("INR ₹15,000");
  });
});

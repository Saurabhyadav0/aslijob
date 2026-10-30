import { describe, it, expect, beforeEach } from "vitest";
import {
  getEmployerProfile,
  verifyEmployerDomain,
  getRecruiters,
  addRecruiter,
  revokeRecruiter,
  issueCompanyOfferLetter,
  getImpersonationAlerts,
  updateAlertStatus,
} from "@/lib/employer";
import { verifyLetter, clearLetters } from "@/lib/letter";

describe("Employer Portal & Recruiter Governance (F10)", () => {
  beforeEach(() => {
    clearLetters();
  });

  it("proves company domain via DNS TXT / token challenge", () => {
    const employer = getEmployerProfile("wipro");
    expect(employer.isDomainVerified).toBe(false);

    // Invalid token should fail
    const invalidResult = verifyEmployerDomain("wipro", "wrong-token-abc");
    expect(invalidResult.verified).toBe(false);
    expect(invalidResult.message).toContain("token mismatch");

    // Valid token should verify
    const validResult = verifyEmployerDomain("wipro", employer.verificationToken);
    expect(validResult.verified).toBe(true);
    expect(getEmployerProfile("wipro").isDomainVerified).toBe(true);
  });

  it("enforces domain match on recruiter email and issues cryptographic badges", () => {
    // Attempting to add a recruiter with non-matching domain should fail
    const fraudAttempt = addRecruiter("tcs", {
      name: "Fake Recruiter",
      email: "recruiter.fake@gmail.com",
      role: "Campus Recruiter",
    });
    expect(fraudAttempt.success).toBe(false);
    expect(fraudAttempt.error).toContain("must match verified company domain '@tcs.com'");

    // Genuine recruiter with matching domain succeeds
    const genuineAdd = addRecruiter("tcs", {
      name: "Vikram Malhotra",
      email: "vikram.m@tcs.com",
      role: "Campus Talent Lead",
      linkedinUrl: "https://linkedin.com/in/vikram-m",
    });
    expect(genuineAdd.success).toBe(true);
    expect(genuineAdd.recruiter?.status).toBe("active");
    expect(genuineAdd.recruiter?.domain).toBe("tcs.com");

    // Revoke badge
    if (genuineAdd.recruiter) {
      const revoked = revokeRecruiter("tcs", genuineAdd.recruiter.id);
      expect(revoked).toBe(true);
      const list = getRecruiters("tcs");
      const found = list.find((r) => r.id === genuineAdd.recruiter?.id);
      expect(found?.status).toBe("revoked");
    }
  });

  it("issues verified offer letters anchored to Sepolia smart contract and verifiable by candidates", () => {
    // TCS is verified by default
    const issueRes = issueCompanyOfferLetter("tcs", {
      letterId: "TCS-PROD-2026-9901",
      candidateEmail: "candidate.aditya@college.edu",
      role: "Digital Specialist Engineer",
      salary: 900000,
      issueDate: "2026-10-30",
    });

    expect(issueRes.success).toBe(true);
    expect(issueRes.letter).toBeDefined();
    expect(issueRes.letter?.id).toBe("TCS-PROD-2026-9901");

    // Verify through candidate check pipeline
    const candidateVerification = verifyLetter("TCS-PROD-2026-9901", {
      company: "Tata Consultancy Services (TCS)",
      role: "Digital Specialist Engineer",
      candidateEmail: "candidate.aditya@college.edu",
      salary: 900000,
      issueDate: "2026-10-30",
    });

    expect(candidateVerification.valid).toBe(true);
    expect(candidateVerification.company).toBe("Tata Consultancy Services (TCS)");

    // Tampered letter check
    const tamperedCheck = verifyLetter("TCS-PROD-2026-9901", {
      company: "Tata Consultancy Services (TCS)",
      role: "Digital Specialist Engineer",
      candidateEmail: "candidate.aditya@college.edu",
      salary: 1500000, // Tampered salary
      issueDate: "2026-10-30",
    });
    expect(tamperedCheck.valid).toBe(false);
    expect(tamperedCheck.reason).toContain("altered or tampered");
  });

  it("monitors impersonation alerts and allows 1930 cybercrime reporting", () => {
    const alerts = getImpersonationAlerts("tcs");
    expect(alerts.length).toBeGreaterThan(0);
    const firstAlert = alerts[0];
    expect(firstAlert.scamIdentifier).toBeDefined();

    const reported = updateAlertStatus(firstAlert.id, "reported_1930");
    expect(reported).toBe(true);
    const updatedAlerts = getImpersonationAlerts("tcs");
    const found = updatedAlerts.find((a) => a.id === firstAlert.id);
    expect(found?.status).toBe("reported_1930");
  });
});


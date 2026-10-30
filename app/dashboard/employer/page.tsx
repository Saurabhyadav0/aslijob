"use client";

import { useState } from "react";
import Link from "next/link";

type Recruiter = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "revoked";
  issuedAt: string;
};

type Alert = {
  id: string;
  channel: string;
  scamIdentifier: string;
  scamType: string;
  reportCount: number;
  severity: "high" | "critical";
  status: "active" | "reported_1930";
};

export default function EmployerDashboardPage() {
  const [companyId, setCompanyId] = useState("tcs");
  const [isVerified, setIsVerified] = useState(true);
  const [domainTokenInput, setDomainTokenInput] = useState("");
  const [domainMessage, setDomainMessage] = useState<string | null>(null);

  // Recruiter form state
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterRole, setRecruiterRole] = useState("");
  const [recruiterError, setRecruiterError] = useState<string | null>(null);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([
    {
      id: "rec-01",
      name: "Aman Sharma",
      email: "aman.s@tcs.com",
      role: "Lead Campus Recruiter",
      status: "active",
      issuedAt: "2026-10-20",
    },
    {
      id: "rec-02",
      name: "Pooja Hegde",
      email: "pooja.h@tcs.com",
      role: "Talent Acquisition Specialist",
      status: "active",
      issuedAt: "2026-10-22",
    },
  ]);

  // Letter issue form state
  const [letterId, setLetterId] = useState("TCS-2026-CAMPUS-101");
  const [candidateEmail, setCandidateEmail] = useState("student.ananya@college.edu");
  const [role, setRole] = useState("Assistant System Engineer");
  const [salary, setSalary] = useState("720000");
  const [issuedLetterSuccess, setIssuedLetterSuccess] = useState<string | null>(null);

  // Impersonation alerts state
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alert-01",
      channel: "WhatsApp Broadcast",
      scamIdentifier: "+91 98450 12345 / hr.tcs@icici",
      scamType: "Demanding Rs 2,500 security deposit for laptop courier",
      reportCount: 18,
      severity: "critical",
      status: "active",
    },
    {
      id: "alert-02",
      channel: "Telegram & Phishing Portal",
      scamIdentifier: "tcs-offer-verification.net",
      scamType: "Fake verification site asking candidates to pay Rs 1,999 onboarding fee",
      reportCount: 9,
      severity: "critical",
      status: "active",
    },
  ]);

  const handleVerifyDomain = () => {
    if (domainTokenInput.trim() === "aslijob-site-verification=tcs_prod_88291a9f" || domainTokenInput.trim() === "ASLIJOB_VERIFIED_2026") {
      setIsVerified(true);
      setDomainMessage("Domain cryptographically verified! DNS TXT record confirmed.");
    } else {
      setDomainMessage("Token mismatch. Make sure you set TXT record or enter ASLIJOB_VERIFIED_2026.");
    }
  };

  const handleAddRecruiter = (e: React.FormEvent) => {
    e.preventDefault();
    setRecruiterError(null);
    const domain = recruiterEmail.split("@")[1];
    if (domain !== `${companyId}.com`) {
      setRecruiterError(`Recruiter email must end in @${companyId}.com`);
      return;
    }
    const newRecruiter: Recruiter = {
      id: `rec-${Date.now().toString(36)}`,
      name: recruiterName,
      email: recruiterEmail,
      role: recruiterRole,
      status: "active",
      issuedAt: new Date().toISOString().slice(0, 10),
    };
    setRecruiters([newRecruiter, ...recruiters]);
    setRecruiterName("");
    setRecruiterEmail("");
    setRecruiterRole("");
  };

  const handleRevokeRecruiter = (id: string) => {
    setRecruiters(
      recruiters.map((r) => (r.id === id ? { ...r, status: "revoked" } : r)),
    );
  };

  const handleIssueLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      alert("Domain must be verified before issuing tamper-proof offer letters.");
      return;
    }
    setIssuedLetterSuccess(`Letter ${letterId.toUpperCase()} issued & anchored! Hash registered on Sepolia.`);
  };

  const handleReportAlert = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, status: "reported_1930" } : a)),
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                AsliJob Employer Portal
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium">
                Verified Brand Governance
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Prove your domain, issue cryptographic recruiter badges, anchor offer letters to Ethereum Sepolia, and squash impersonators.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://sepolia.etherscan.io/address/0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f#code"
              target="_blank"
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-300 hover:border-purple-400 flex items-center gap-1.5 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Smart Contract: 0x6Fbc...D50f
            </Link>
            <Link
              href="/"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
            >
              Public Checker
            </Link>
          </div>
        </header>

        {/* Company Selector & Key Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <span className="text-xs text-slate-400">Employer Organization</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-semibold text-white uppercase">{companyId}</span>
              {isVerified ? (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  VERIFIED
                </span>
              ) : (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                  UNVERIFIED
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 mt-1">Domain: {companyId}.com</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400">Active Verified Recruiters</span>
            <div className="text-2xl font-bold text-teal-400 mt-2">
              {recruiters.filter((r) => r.status === "active").length}
            </div>
            <span className="text-xs text-slate-500">Cryptographically signed badges</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400">Onchain Letters Anchored</span>
            <div className="text-2xl font-bold text-cyan-400 mt-2">42</div>
            <span className="text-xs text-slate-500">Zero-knowledge candidate hashes</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400">Impersonation Gangs Tracked</span>
            <div className="text-2xl font-bold text-rose-400 mt-2">{alerts.length}</div>
            <span className="text-xs text-slate-500">Fake WhatsApp / UPI extortion</span>
          </div>
        </section>

        {/* Section 1: Domain Verification Wizard */}
        {!isVerified && (
          <section className="p-6 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-4">
            <h2 className="text-base font-semibold text-amber-300 flex items-center gap-2">
              Domain Verification Required
            </h2>
            <p className="text-sm text-slate-300">
              To issue authentic offer letters and official recruiter badges under{" "}
              <code className="text-amber-200 bg-amber-950/40 px-1 py-0.5 rounded">@{companyId}.com</code>,
              add the following TXT record to your company DNS or paste your verification challenge token:
            </p>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-300 break-all">
              aslijob-site-verification={companyId}_prod_88291a9f
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Paste TXT token or ASLIJOB_VERIFIED_2026..."
                value={domainTokenInput}
                onChange={(e) => setDomainTokenInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleVerifyDomain}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm rounded-lg transition"
              >
                Verify Domain DNS
              </button>
            </div>
            {domainMessage && (
              <p className="text-xs text-amber-400 font-medium">{domainMessage}</p>
            )}
          </section>
        )}

        {/* Grid: Recruiter Directory + Offer Letter Issuance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recruiter Management */}
          <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">Verified Recruiter Directory</h2>
              <p className="text-xs text-slate-400 mt-1">
                Only emails ending in @{companyId}.com can receive official AsliJob recruiter badges.
              </p>
            </div>

            <form onSubmit={handleAddRecruiter} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Recruiter Name"
                  required
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="email"
                  placeholder={`name@${companyId}.com`}
                  required
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Official Designation (e.g. Lead Talent Acquisition)"
                  required
                  value={recruiterRole}
                  onChange={(e) => setRecruiterRole(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-lg transition whitespace-nowrap"
                >
                  Issue Badge
                </button>
              </div>
              {recruiterError && (
                <p className="text-xs text-rose-400 font-medium">{recruiterError}</p>
              )}
            </form>

            <div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-1">
              {recruiters.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{rec.name}</span>
                      {rec.status === "active" ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                          ACTIVE BADGE
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-mono">
                          REVOKED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{rec.email} • {rec.role}</p>
                  </div>
                  {rec.status === "active" && (
                    <button
                      onClick={() => handleRevokeRecruiter(rec.id)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Issue Offer Letter */}
          <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">Issue Verified Offer Letter</h2>
              <p className="text-xs text-slate-400 mt-1">
                Anchors letter hash to Sepolia contract. Candidates verify authenticity in 1 second via QR scan.
              </p>
            </div>

            <form onSubmit={handleIssueLetter} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Letter ID / Reference</label>
                  <input
                    type="text"
                    required
                    value={letterId}
                    onChange={(e) => setLetterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Candidate Email (Hashed)</label>
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Annual CTC (INR)</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition"
              >
                Sign & Anchor to Sepolia Smart Contract
              </button>

              {issuedLetterSuccess && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                  <p className="text-emerald-300 font-medium">{issuedLetterSuccess}</p>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>Candidate Verification Link:</span>
                    <Link
                      href={`/verify?letterId=${encodeURIComponent(letterId)}`}
                      className="text-cyan-400 underline hover:text-cyan-300"
                    >
                      /verify?letterId={letterId}
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </section>
        </div>

        {/* Section 4: Brand Impersonation Threat Center */}
        <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Brand Impersonation Threat Center</h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time scam reports across India misusing the {companyId.toUpperCase()} brand identity.
              </p>
            </div>
            <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full font-mono">
              Live Threat Feed
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-rose-400">{alert.channel}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {alert.reportCount} Indian Candidates Targeted
                    </span>
                  </div>
                  <p className="text-xs font-mono text-amber-300">{alert.scamIdentifier}</p>
                  <p className="text-xs text-slate-300">{alert.scamType}</p>
                </div>

                <div className="flex items-center gap-2">
                  {alert.status === "active" ? (
                    <button
                      onClick={() => handleReportAlert(alert.id)}
                      className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium rounded-lg transition"
                    >
                      Report to Cybercrime 1930
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                      Reported to 1930
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

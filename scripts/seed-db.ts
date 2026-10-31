/**
 * Seed the Supabase Postgres database with realistic DEMO/TEST data.
 *
 * In demo mode the app serves from an in-memory store, so the Postgres tables
 * (created by `npm run migrate` / migrate-supabase.ts) start empty. This script
 * fills them so you can test the Supabase-backed read paths, dashboards and
 * lookups against real rows.
 *
 * It is IDEMPOTENT: checks / reports / offer_letters get deterministic ids and
 * every insert is an UPSERT, so re-running updates in place instead of
 * duplicating. It never truncates, so it will not touch rows it did not create.
 *
 *   DATABASE_URL=... npm run seed:db          # upsert demo rows
 *   DATABASE_URL=... npm run seed:db -- --wipe-demo   # delete rows seeded here first
 *
 * DATABASE_URL must be set (same Postgres connection string used by the
 * migration script). Source data lives in fixtures/ — fake/masked identifiers
 * only, never real PII.
 */
import { createHash } from "node:crypto";
import { connectAny } from "./_db";
import { hashIdentifier, hashMessage, maskValue, normaliseValue } from "../lib/hash";
import { hashCandidateEmail, computeLetterHash, computeMerkleRoot } from "../lib/letter";
import graphSeed from "../fixtures/graph_seed.json";
import scams from "../fixtures/scams.json";
import genuine from "../fixtures/genuine.json";
import letters from "../fixtures/letters.json";

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type Ident = { kind: string; value: string };
type GraphReport = {
  id: string;
  city: string;
  scam_type: string;
  status: "confirmed" | "unverified" | "rejected";
  identifiers: Ident[];
};
type Scam = { id: string; type: string; text: string };
type Genuine = { id: string; text: string };
type Letter = {
  id: string;
  company: string;
  role: string;
  candidateEmail: string;
  salary: number;
  issueDate: string;
  status: string;
};

/** Stable md5-derived UUID so re-seeding upserts instead of duplicating. */
function detUuid(key: string): string {
  const h = createHash("md5").update(`aslijob-seed:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

const REASONS: Record<string, { id: string; text: string }[]> = {
  fee: [
    { id: "fee_upfront", text: "Asks for an upfront or 'refundable' fee before joining — legitimate employers never charge candidates." },
    { id: "pressure", text: "Creates false urgency ('limited seats', 'before Monday') to rush payment." },
  ],
  fake_offer: [
    { id: "lookalike_domain", text: "Uses a look-alike careers domain and a personal WhatsApp/Gmail instead of the official company domain." },
    { id: "unofficial_contact", text: "Official recruiters contact you from a corporate email, not a mobile number." },
  ],
  task: [
    { id: "task_scam", text: "'Earn daily' task or recharge scheme on Telegram — a classic task-based fraud that escalates into deposits." },
    { id: "deposit", text: "Asks you to pay to 'unlock' tasks or withdraw earnings." },
  ],
  remote: [
    { id: "remote_access", text: "Asks you to install remote-access software (AnyDesk/TeamViewer) — a tactic to take over your device." },
  ],
  overseas: [
    { id: "overseas_fee", text: "Overseas job with a processing fee and document collection — a common advance-fee / trafficking pattern." },
    { id: "pii_aadhaar", text: "Requests Aadhaar and payment before any verified interview." },
  ],
  phishing: [
    { id: "phishing_pii", text: "Requests OTP, bank account and PAN — never share these; no employer needs them to onboard you." },
  ],
};

function verdictFor(type: string): { verdict: string; confidence: number } {
  if (type === "remote") return { verdict: "suspicious", confidence: 0.72 };
  if (type === "fee" || type === "fake_offer" || type === "task") return { verdict: "scam", confidence: 0.95 };
  if (type === "overseas" || type === "phishing") return { verdict: "scam", confidence: 0.97 };
  return { verdict: "suspicious", confidence: 0.6 };
}

// Which scam sample best represents each graph report (for check_id linkage).
const REPORT_TO_SCAM: Record<string, string> = {
  R1: "S1", R2: "S3", R3: "S3", R4: "S4", R5: "S5", R6: "S2",
};
const REPORT_AMOUNT: Record<string, number | null> = {
  R1: 2999, R2: 15000, R3: 5000, R4: 500, R5: 1200, R6: null,
};
function complaintFor(r: GraphReport): string {
  const city = r.city;
  const map: Record<string, string> = {
    fee: `Victim in ${city} was asked to pay a registration/deposit fee to confirm a job that never existed.`,
    fake_offer: `Victim in ${city} received a fake offer letter from a look-alike careers site and a personal number.`,
    task: `Victim in ${city} joined a Telegram 'task' group, paid to unlock tasks, and could not withdraw earnings.`,
  };
  return map[r.scam_type] ?? `Suspected job fraud reported from ${city}.`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const wipe = process.argv.includes("--wipe-demo");
  const client = await connectAny();

  try {
    await client.query("BEGIN");

    const scamList = scams as Scam[];
    const genuineList = genuine as Genuine[];
    const graphReports = (graphSeed as { reports: GraphReport[] }).reports;
    const letterList = letters as Letter[];

    // Deterministic ids for everything we create, so a wipe/upsert is surgical.
    const checkIds = [
      ...scamList.map((s) => detUuid(`check:${s.id}`)),
      ...genuineList.map((g) => detUuid(`check:${g.id}`)),
    ];
    const reportIds = graphReports.map((r) => detUuid(`report:${r.id}`));

    if (wipe) {
      console.log("[seed:db] Wiping previously seeded demo rows...");
      await client.query(`DELETE FROM public.report_identifiers WHERE report_id = ANY($1::uuid[])`, [reportIds]);
      await client.query(`DELETE FROM public.reports WHERE id = ANY($1::uuid[])`, [reportIds]);
      await client.query(`DELETE FROM public.checks WHERE id = ANY($1::uuid[])`, [checkIds]);
      await client.query(`DELETE FROM public.offer_letters WHERE id = ANY($1::text[])`, [letterList.map((l) => l.id)]);
    }

    // 1) CHECKS — one per scam + genuine fixture --------------------------------
    let nChecks = 0;
    for (const s of scamList) {
      const { verdict, confidence } = verdictFor(s.type);
      const reasons = REASONS[s.type] ?? [{ id: "generic", text: "Matches known job-scam patterns." }];
      await client.query(
        `INSERT INTO public.checks (id, message_hash, verdict, confidence, reasons, channel)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6)
         ON CONFLICT (id) DO UPDATE
           SET message_hash = EXCLUDED.message_hash, verdict = EXCLUDED.verdict,
               confidence = EXCLUDED.confidence, reasons = EXCLUDED.reasons`,
        [detUuid(`check:${s.id}`), hashMessage(s.text), verdict, confidence, JSON.stringify(reasons), "web"],
      );
      nChecks++;
    }
    for (const g of genuineList) {
      const reasons = [
        { id: "official_channel", text: "Uses the official company domain and an identifiable recruiter." },
        { id: "no_fee", text: "Explicitly states no fees are charged at any stage." },
      ];
      await client.query(
        `INSERT INTO public.checks (id, message_hash, verdict, confidence, reasons, channel)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6)
         ON CONFLICT (id) DO UPDATE
           SET message_hash = EXCLUDED.message_hash, verdict = EXCLUDED.verdict,
               confidence = EXCLUDED.confidence, reasons = EXCLUDED.reasons`,
        [detUuid(`check:${g.id}`), hashMessage(g.text), "safe", 0.92, JSON.stringify(reasons), "web"],
      );
      nChecks++;
    }

    // 2) IDENTIFIERS — aggregated from graph reports ---------------------------
    type Agg = { kind: string; value: string; reportCount: number; confirmed: number };
    const aggMap = new Map<string, Agg>();
    for (const r of graphReports) {
      for (const id of r.identifiers) {
        const key = `${id.kind}:${normaliseValue(id.kind, id.value)}`;
        const cur = aggMap.get(key) ?? { kind: id.kind, value: id.value, reportCount: 0, confirmed: 0 };
        cur.reportCount += 1;
        if (r.status === "confirmed") cur.confirmed += 1;
        aggMap.set(key, cur);
      }
    }
    const idByHash = new Map<string, string>(); // `${kind}:${hashed}` -> identifier uuid
    let nIdents = 0;
    for (const a of aggMap.values()) {
      const hashed = hashIdentifier(a.kind, a.value);
      const masked = maskValue(a.kind, a.value);
      const res = await client.query(
        `INSERT INTO public.identifiers (kind, hashed_val, masked_display, report_count, confirmed_links)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (kind, hashed_val) DO UPDATE
           SET masked_display = EXCLUDED.masked_display,
               report_count = EXCLUDED.report_count,
               confirmed_links = EXCLUDED.confirmed_links
         RETURNING id`,
        [a.kind, hashed, masked, a.reportCount, a.confirmed],
      );
      idByHash.set(`${a.kind}:${hashed}`, res.rows[0].id);
      nIdents++;
    }

    // 3) REPORTS + junction ----------------------------------------------------
    let nReports = 0;
    let nLinks = 0;
    for (const r of graphReports) {
      const reportId = detUuid(`report:${r.id}`);
      const checkId = detUuid(`check:${REPORT_TO_SCAM[r.id] ?? "S1"}`);
      await client.query(
        `INSERT INTO public.reports (id, check_id, scam_type, amount_lost, complaint_text, status, city)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE
           SET check_id = EXCLUDED.check_id, scam_type = EXCLUDED.scam_type,
               amount_lost = EXCLUDED.amount_lost, complaint_text = EXCLUDED.complaint_text,
               status = EXCLUDED.status, city = EXCLUDED.city`,
        [reportId, checkId, r.scam_type, REPORT_AMOUNT[r.id] ?? null, complaintFor(r), r.status, r.city],
      );
      nReports++;
      for (const id of r.identifiers) {
        const identId = idByHash.get(`${id.kind}:${hashIdentifier(id.kind, id.value)}`);
        if (!identId) continue;
        await client.query(
          `INSERT INTO public.report_identifiers (report_id, identifier_id)
           VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [reportId, identId],
        );
        nLinks++;
      }
    }

    // 4) OFFER LETTERS ---------------------------------------------------------
    let nLetters = 0;
    const leafHashes: string[] = [];
    const letterRows: { id: string; letterHash: string; emailHash: string; l: Letter }[] = [];
    for (const l of letterList) {
      const emailHash = hashCandidateEmail(l.candidateEmail);
      const letterHash = computeLetterHash({
        id: l.id, company: l.company, role: l.role,
        candidateEmailHash: emailHash, salary: l.salary, issueDate: l.issueDate,
      });
      letterRows.push({ id: l.id, letterHash, emailHash, l });
      // Only genuine letters belong in the honest attestation tree.
      if (l.status !== "tampered") leafHashes.push(letterHash);
    }
    const merkleRoot = computeMerkleRoot(leafHashes);
    for (const row of letterRows) {
      const tampered = row.l.status === "tampered";
      const easUid = tampered ? null : `0x${createHash("sha256").update(`eas:${row.id}`).digest("hex")}`;
      await client.query(
        `INSERT INTO public.offer_letters
           (id, letter_hash, company, role, candidate_email_hash, salary, issue_date, eas_uid, merkle_root)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE
           SET letter_hash = EXCLUDED.letter_hash, company = EXCLUDED.company, role = EXCLUDED.role,
               candidate_email_hash = EXCLUDED.candidate_email_hash, salary = EXCLUDED.salary,
               issue_date = EXCLUDED.issue_date, eas_uid = EXCLUDED.eas_uid, merkle_root = EXCLUDED.merkle_root`,
        [row.id, row.letterHash, row.l.company, row.l.role, row.emailHash, row.l.salary, row.l.issueDate, easUid, tampered ? null : merkleRoot],
      );
      nLetters++;
    }

    await client.query("COMMIT");

    console.log("\n[seed:db] Done. Rows upserted:");
    console.log(`  checks:             ${nChecks}`);
    console.log(`  identifiers:        ${nIdents}`);
    console.log(`  reports:            ${nReports}`);
    console.log(`  report_identifiers: ${nLinks}`);
    console.log(`  offer_letters:      ${nLetters}`);
    // Read-back: show the actual row counts now in the database.
    const tables = ["checks", "identifiers", "reports", "report_identifiers", "offer_letters"];
    console.log("\n[seed:db] Live row counts in database:");
    for (const tbl of tables) {
      const { rows } = await client.query(`SELECT count(*)::int AS n FROM public.${tbl}`);
      console.log(`  ${tbl.padEnd(19)} ${rows[0].n}`);
    }

    console.log("\nShared identifiers to test the graph: hr.jobs@upi (2 reports), quicktask@ybl (2), url tcs-careers-india.xyz (2).");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[seed:db] Error — rolled back:", err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();

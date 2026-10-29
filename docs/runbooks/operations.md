# Operations & Maintenance Runbook — AsliJob

This runbook details routine operations, batch jobs, evaluation standards, and incident response procedures for AsliJob maintainers.

---

## 1. Daily Operations Checklist

| Frequency | Task | Method / Command | Target SLA |
|---|---|---|---|
| **Daily (00:00 IST)** | EAS Merkle Attestation Cron | Automatically fired by Vercel Cron via `GET /api/cron/attest` | HTTP 200 with `root` and `letterCount` |
| **Every 6 Hours** | Sync Postgres Reports $\rightarrow$ TigerGraph | `npm run graph:sync` (or GitHub Actions scheduler) | < 30 seconds sync duration |
| **Weekly** | Run Detection Eval Benchmark | `npm run eval` | **100% scam catch, 0% false positives** |
| **As Reported** | Ingest Newly Reported Gangs | Add samples to `fixtures/scams.json` or live database | Updated within 2 hours |

---

## 2. Triggering Daily EAS Merkle Batch Attestations

The attestation job hashes all verified offer letters registered within the last 24 hours, builds a Merkle Tree, and publishes the Merkle Root to Base Sepolia via EAS.

### Automatic Trigger (Production)
Configured in `vercel.json` (`schedule: 30 18 * * *`). Vercel calls:
```bash
curl -X GET "https://aslijob.in/api/cron/attest" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Manual Trigger via CLI
To trigger an out-of-cycle batch attestation (e.g., after onboarding an enterprise cohort):
```bash
npx tsx scripts/attest-daily.ts
```

**Expected Console Output:**
```
[Attest Daily] Fetching unanchored offer letters...
[Attest Daily] Found 12 letters to anchor.
[Attest Daily] Merkle Root computed: 0xa9f8b76...
[Attest Daily] EAS Attestation published! UID: 0x48e1a...
[Attest Daily] Successfully updated 12 records with attestation UID.
```

---

## 3. Fraud Graph Synchronization (`npm run graph:sync`)

TigerGraph stores the connected fraud network. To sync recent reports from Postgres into TigerGraph:

```bash
npm run graph:sync
```

### How the Sync Works:
1. Queries `reports` joined with `report_identifiers` from Postgres.
2. Formats vertices `Report` and `Identifier`.
3. Upserts undirected edges `REPORT_IDENTIFIER`.
4. Executes a test `neighbourRisk` query to verify graph indexing.

---

## 4. Model Accuracy & Evaluation Benchmark (`npm run eval`)

Before deploying changes to rules (`lib/rules.ts`), extraction (`lib/extract.ts`), or prompts (`prompts/verdict.md`):

```bash
npm run eval
```

### Evaluation Criteria Gate:
- **Scam Detection Rate:** Must be $\ge 90\%$ (currently **100%** on benchmark suite).
- **False Positive Rate:** Must be **0%** on genuine job offers (`fixtures/genuine.json`).
- If any genuine offer is classified as `suspicious` or `scam`, the build is gated and must not be merged.

---

## 5. Adding New Scam Patterns (Operational Skill)

When a new scam template surfaces (e.g., a new Telegram task scheme or fraudulent payment gateway):

1. **Capture Raw Message:** Add the sanitized scam text to `fixtures/scams.json`.
2. **Identify the Pattern:** Determine whether it involves:
   - Specific phishing keywords (e.g., "like YouTube videos", "hotel rating review").
   - Suspicious free email domain pretending to be corporate.
   - Demands for "laptop security deposit" or "courier fee".
3. **Implement Rule:**
   - Add the rule to `lib/rules.ts` with appropriate severity:
     - `blocking`: Guarantees at least `suspicious` (e.g., payment demand).
     - `high` / `medium`: Weight score in `lib/score.ts`.
4. **Add Unit Test:** Add a test case in `tests/rules.test.ts`.
5. **Run Verification:**
   ```bash
   npm test && npm run eval
   ```

---

## 6. Investigating and Remediating False Positives

If a legitimate employer reports that their communications are marked as "Suspicious" or "Scam":

1. **Verify Company Credentials:**
   - Check MCA (Ministry of Corporate Affairs) records for valid CIN.
   - Confirm domain ownership via WHOIS / RDAP.
2. **Update Company Master Directory:**
   - Add company domain and CIN to `fixtures/companies.json` and Supabase `companies` table.
3. **Audit Rule Triggers:**
   - Run the flagged message through `POST /api/check`.
   - Inspect `reasons[]` array in the response to identify the offending rule (e.g., free email provider, unverified short link).
4. **Whitelist Adjustment:**
   - If the company was using an unlisted recruiter domain, add the domain to `companies.json`.
   - Verify with `npm test`.

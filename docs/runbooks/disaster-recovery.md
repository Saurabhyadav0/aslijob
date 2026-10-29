# Disaster Recovery & Fallbacks Runbook — AsliJob

This runbook outlines procedures for maintaining service availability during third-party dependency outages and details AsliJob's automated graceful fallback architecture.

---

## 1. High-Availability Fallback Architecture Matrix

AsliJob is engineered with zero single points of failure. Every external cloud dependency has an automatic in-process fallback:

| Dependency | Purpose | Failure Mode | Automatic Fallback Mechanism | User Impact |
|---|---|---|---|---|
| **TigerGraph** | Multi-hop fraud network lookup | Connection timeout / 5xx error | In-memory graph (`lib/graph.ts`) + Postgres direct query | Zero downtime; single-hop history checked; check succeeds |
| **Gemini AI / Vision** | Multimodal OCR screenshot parsing | API quota exhausted / rate limit | Local Regex OCR parser (`lib/extract.ts`) | Zero downtime; extracted text is parsed by rules |
| **RDAP / WHOIS** | Domain registration age check | Third-party registry slow (>1.5s) | `Promise.race` with 1500ms fallback (`lib/lookups.ts`) | Check completes in <2s; skips domain age if registry stalls |
| **Base Sepolia RPC** | Onchain EAS letter verification | Public RPC node timeout | Canonical SHA-256 local registry lookup (`lib/letter.ts`) | Letter verified against cryptographic hash; notes testnet status |
| **Supabase Postgres** | Persistent relational storage | Database unreachable | In-memory atomic store (`lib/store.ts`) | Transient checks continue uninterrupted |

---

## 2. Dependency Outage Recovery Procedures

### Scenario A: TigerGraph Instance Offline
- **Detection:** `GET /api/health` reports `graph: false`.
- **System Behavior:** `getGraph()` catches the network exception and serves risk scoring using the embedded in-TypeScript fraud graph engine.
- **Action Required:**
  1. Check TigerGraph Cloud console ([tgcloud.io](https://tgcloud.io)) to restart cluster if sleeping.
  2. Verify credentials in `TIGERGRAPH_HOST` and `TIGERGRAPH_TOKEN`.
  3. Once TigerGraph is healthy, run `npm run graph:sync` to push backlogged Postgres reports into the cluster.

### Scenario B: High Traffic Spikes (DDoS or Flash Crowd)
- **Detection:** Rapid influx of requests on `/api/check`.
- **System Behavior:** `lib/rate-limit.ts` enforces a sliding-window limit per IP (default: 30 requests per minute). Requests exceeding the threshold receive HTTP `429 Too Many Requests`.
- **Action Required:**
  - Adjust rate limits in `lib/rate-limit.ts` if legitimate bulk checking (e.g., college placement office batch run) requires higher throughput.

### Scenario C: Base Sepolia RPC Fails or Hard Forks
- **Detection:** `GET /api/cron/attest` fails with RPC network error.
- **System Behavior:** Unanchored letters remain queued in `offer_letters` table. Existing letters remain verifiable via their canonical letter hashes.
- **Action Required:**
  1. Switch `BASE_SEPOLIA_RPC` to an alternate RPC provider (e.g., Alchemy or Infura).
  2. Re-run batch attestation via `npx tsx scripts/attest-daily.ts`.

---

## 3. Demo Mode Activation (`DEMO_MODE=true`)

For pitch sessions, hackathon demos, air-gapped presentations, or local test environments where external cloud accounts should not be touched:

1. **Activate via Environment Variable:**
   ```bash
   DEMO_MODE="true"
   ```
2. **Behavior under Demo Mode:**
   - Pre-seeds in-memory stores with 10 real-world scam networks from `fixtures/graph_seed.json`.
   - Pre-loads authentic offer letters for TCS and Infosys, plus tampered counter-examples from `fixtures/letters.json`.
   - Simulates domain age lookups with deterministic fixtures.
   - All check, report, share, and verify endpoints function 100% offline.
3. **Verify Demo Health:**
   ```bash
   curl http://localhost:3000/api/health
   # Returns: { "ok": true, "db": true, "graph": true, "mode": "demo" }
   ```

---

## 4. Incident Severity Classification

| Level | Definition | Response SLA | Action |
|---|---|---|---|
| **SEV-1 (Critical)** | Core check API (`POST /api/check`) returning 500 errors across all channels | 15 minutes | Enable `DEMO_MODE=true` to restore core functionality; roll back recent deployment. |
| **SEV-2 (High)** | Telegram webhook or Report submission failing | 1 hour | Inspect logs on `/api/telegram` or `/api/report`; verify secrets and webhooks. |
| **SEV-3 (Low)** | Daily cron delayed or external RDAP slow | Next business day | Run batch CLI manually; verify external registry status. |

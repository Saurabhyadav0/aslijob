# Backend tasks — Saurabh (build lead)

Scope (from the plan): check API, rules, AI verdict, TigerGraph schema and sync,
EAS offer-letter flow, Vercel and Supabase setup, and the tests.
Skills to read first: `backend`, `database-architect`, `testing`, `security`,
`rbac-gate`, `infra`, plus the product skills `add-scam-pattern`, `graph-change`,
`eas-letter`, `run-eval`. Boundary = the API contract in [`README.md`](./README.md).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## B0 — Project, Supabase & Vercel setup  _(Phase 0)_
- [ ] `npx create-next-app@latest aslijob --ts --tailwind --app --eslint`
- [ ] package.json scripts: `dev build lint test e2e eval seed graph:sync`
- [ ] Install deps (supabase-js, zod, grammy, viem, ethers, eas-sdk, merkle-tree, openai, posthog, sentry, qrcode; dev: vitest, playwright, tsx)
- [ ] Create Supabase project; run the Postgres schema; **RLS on every table**
- [ ] Deploy to Vercel; CI runs tests on every PR
- [ ] `GET /api/health` → `{ ok, db, graph }`

## B1 — Check pipeline  _(F01)_
- [ ] `lib/extract.ts` (small model → company, recruiter, phones, emails, UPI, links, wallets, salary, fee, channel) + vision path for images/PDF
- [ ] `POST /api/upload` (<5MB) → `{ fileId }`, delete the file after the check
- [ ] `lib/check.ts`: extract → rules → lookups (parallel) → verdict → score → save, each outside call timeout-bounded
- [ ] `POST /api/check` returns the contract shape; cache by SHA-256 of normalised text (<300ms on a hit)
- [ ] Tests U9, U15, U19 — `npm run test -- check extract`

## B2 — Rules & scoring  _(F02)_
- [ ] `lib/rules.ts`: fee_requested (blocking), free_mail_recruiter, telegram_handoff, task_scam, remote_access (AnyDesk), urgency, early Aadhaar/bank ask
- [ ] `lib/score.ts`: rules + graph + model; blocking → ≥ Suspicious; 2+ confirmed links → Scam; never Scam from one unverified report
- [ ] `prompts/verdict.md` + JSON output (verdict, confidence, reasons, next_step)
- [ ] Tests **first**: U1–U8 (rules), U10–U12 (score) — `npm run test -- rules score`

## B3 — Fraud graph  _(F03)_
- [ ] TigerGraph Savanna workspace; GSQL vertices/edges + `neighbour_risk`; API token
- [ ] `lib/graph.ts`: 2-hop neighbour risk → linkedReports/cities/path
- [ ] `scripts/graph-sync.ts`: sync on each report + nightly full sync
- [ ] Postgres fallback when the graph is down; restart instance before demos
- [ ] Tests U13, U14, U16 — `npm run test -- graph`

## B4 — Report & 1930 complaint  _(F04)_
- [ ] `POST /api/report`: save report (hashed identifiers, no raw chat), update graph
- [ ] Build the 1930 complaint draft from the check
- [ ] viaSocket `report.created` / `scam.confirmed` webhooks (alert college, log case)
- [ ] Done-when: a new report changes the next check on a linked number — `npm run test -- report`

## B5 — Share card route & result data  _(F05)_
- [ ] Server card-image route (verdict + main reason + link), 1080×1080
- [ ] Result-page data for `/r/[id]`  — `npm run test -- share`
- [ ] (Card design & share button are Sumit's — see frontend F6)

## B6 — Verified offer letter  _(F06)_
- [ ] `scripts/register-schema.ts`: register the EAS letter-batch schema once; save `EAS_SCHEMA_UID`
- [ ] Daily `GET /api/cron/attest`: Merkle root of new letters → 1 attestation on Base Sepolia (`vercel.json` cron `30 18 * * *`)
- [ ] `GET /api/verify/:id`: recompute hash, check proof vs root
- [ ] Tests U17 (verifies), U18 (one digit changed fails) — `npm run test -- verify-letter`

## B7 — Hardening & launch gate  _(Phase 1 close)_
- [ ] `rate_limits` table + per-IP / per-TG-user limits (e.g. 20/hr) with a friendly message
- [ ] Turnstile on the report form; Sentry + PostHog (server)
- [ ] Deploy: every `.env.example` var in Vercel + `DEMO_MODE=true`
- [ ] Launch gate: `npm test`, `npm run e2e` on prod, `demo-ready` skill green, production-readiness checklist done

## Tests (Saurabh owns the harness)
- [ ] Vitest unit set U1–U20 + Playwright E1–E3 in GitHub Actions on every PR
- [ ] Done-for-hackathon: all U pass, E1–E3 on prod, ≥ 90% of `scams.json` caught, nothing in `genuine.json` marked Scam

## Phase 2–5 (backend)
- [ ] F08 voice/translation backend (aigi / Bhashini)
- [ ] F09 college dashboard API + Dodo Payments plan
- [ ] F10 employer portal + Base **mainnet** letters + impersonation alerts
- [ ] F11 WhatsApp Cloud API webhook (same pipeline)
- [ ] F13 wallet vertices + hashed public scam-signals API

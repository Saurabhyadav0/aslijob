# Backend tasks — Saurabh

Owns the API, the check pipeline, the fraud graph, onchain letters and the bot.
Skills to read first: `backend`, `database-architect`, `testing`, `security`,
`rbac-gate`, `infra`. Boundary = the API contract in [`README.md`](./README.md).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## B0 — Project & infra setup  _(no feature id; enables all)_
- [ ] `npx create-next-app@latest aslijob --ts --tailwind --app --eslint`
- [ ] Add scripts to package.json: `dev build lint test e2e eval seed graph:sync`
- [ ] Install deps: `@supabase/supabase-js zod grammy viem ethers @ethereum-attestation-service/eas-sdk @openzeppelin/merkle-tree openai posthog-* @sentry/nextjs qrcode`, dev `vitest @playwright/test tsx`
- [ ] Create Supabase project; run the Postgres schema; enable RLS on every table
- [ ] Write `.env.example` (DB URL/keys, model keys, TG secret, EAS vars, `DEMO_MODE`)
- [ ] `GET /api/health` returns `{ ok, db, graph }`

## B1 — Check pipeline  _(F01)_
- [ ] `lib/extract.ts`: small model pulls company, recruiter, phones, emails, UPI, links, wallets, salary, fee, channel
- [ ] Vision path for images/PDFs; `POST /api/upload` (<5MB) -> `{ fileId }`, auto-delete after check
- [ ] `lib/check.ts`: extract → rules → lookups (parallel) → verdict → score → save, each outside call timeout-bounded
- [ ] `POST /api/check` wired to the pipeline, returns the contract shape
- [ ] Cache by `message_hash` (same forward returns stored answer, <300ms)
- [ ] Tests: U9 (extract), U15/U19 (check route)  — `verification: npm run test -- check extract`

## B2 — Rules & scoring  _(F02)_
- [ ] `lib/rules.ts`: fee_requested (blocking), free_mail_recruiter, telegram_handoff, task_scam, remote_access (AnyDesk), urgency, early Aadhaar/bank ask
- [ ] `lib/score.ts`: combine rules + graph + model; blocking → ≥ Suspicious; 2+ confirmed links → Scam; never Scam from one unverified report
- [ ] Verdict prompt + JSON output (verdict, confidence, reasons)
- [ ] Tests first: U1–U8 (rules), U10–U12 (score) — `verification: npm run test -- rules score`

## B3 — Fraud graph  _(F03)_
- [ ] Create TigerGraph Savanna workspace; run GSQL vertices/edges + `neighbour_risk` query; make API token
- [ ] `lib/graph.ts`: query neighbour risk (2 hops), return linkedReports/cities/path
- [ ] Sync from Postgres on each new report + nightly full sync (`scripts/graph-sync.ts`)
- [ ] Postgres fallback when the graph is down; restart instance before demo
- [ ] Tests: U13/U14/U16 — `verification: npm run test -- graph`

## B4 — Report & 1930 complaint  _(F04)_
- [ ] `POST /api/report`: save report (hashed identifiers, no raw chat), update graph
- [ ] Build the 1930 complaint draft text from the check
- [ ] viaSocket webhook `report.created` / `scam.confirmed` (alert college, log case)
- [ ] Done-when: a new report changes the next check on a linked number — `verification: npm run test -- report`

## B5 — Share card + result data  _(F05)_
- [ ] Card image route (server-drawn verdict + main reason + link)
- [ ] Result page data for `/r/[id]`
- [ ] `verification: npm run test -- share`

## B6 — Verified offer letter (demo)  _(F06)_
- [ ] `scripts/register-schema.ts`: register EAS letter-batch schema once; save `EAS_SCHEMA_UID`
- [ ] Hash letter key fields; daily `GET /api/cron/attest` builds Merkle root → 1 attestation on Base Sepolia (`vercel.json` cron 30 18 * * *)
- [ ] `GET /api/verify/:id`: recompute hash, check Merkle proof vs root
- [ ] Done-when: demo letter verifies; same letter with one salary digit changed fails — `verification: npm run test -- verify-letter`

## B7 — Telegram bot  _(F07)_
- [ ] grammY webhook `POST /api/telegram`; verify `X-Telegram-Bot-Api-Secret-Token`
- [ ] Run the shared pipeline; reply with verdict, reasons, share link
- [ ] setWebhook to the deployed URL — `verification: npm run test -- telegram`

## B8 — Hardening & deploy  _(launch gate)_
- [ ] `rate_limits` table + middleware (ip/tg key)
- [ ] PostHog + Sentry (server)
- [ ] Deploy on Vercel: import repo, add every `.env.example` var + `DEMO_MODE=true`
- [ ] Launch gate: `npm test`, `npm run e2e` against prod, production-readiness skill

## Phase 2–5 (after hackathon)
- [ ] F08 languages/voice backend (aigi voice / Bhashini)
- [ ] F09 college dashboard API + Dodo Payments plan
- [ ] F10 employer portal (domain proof, recruiter badges, impersonation alerts)
- [ ] F11 WhatsApp Cloud API webhook
- [ ] F13 wallet vertices + public scam-signals API

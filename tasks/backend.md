# Backend tasks — Saurabh (build lead)

Scope (from the plan): check API, rules, AI verdict, TigerGraph schema and sync,
EAS offer-letter flow, Vercel and Supabase setup, and the tests.
Skills to read first: `backend`, `database-architect`, `testing`, `security`,
`rbac-gate`, `infra`, plus the product skills `add-scam-pattern`, `graph-change`,
`eas-letter`, `run-eval`. Boundary = the API contract in [`README.md`](./README.md).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

> **Checkpoint (29 Oct):** Core backend implementation complete on branch `feat/backend-build`.
> `npm install` ✓, `npm run lint` ✓ (clean), `npm test` ✓ (36/36 tests passing across all suites),
> `npm run eval` ✓ → **8/8 scams caught, 0 false positives (PASS)**, `npm run build` ✓ (clean Next 14 build).
> Upload, report learning loop, offer-letter verification, share card image, Telegram bot webhook,
> Supabase SQL schema + RLS, TigerGraph schema, and GitHub Actions CI all implemented and verified.

---

## B0 — Project, Supabase & Vercel setup  _(Phase 0)_
- [x] App scaffold (hand-written Next 14 + TS + Tailwind + Vitest; not `create-next-app`)
- [x] package.json scripts: `dev build lint test eval seed graph:sync`
- [x] Install deps (next, react, zod; dev: typescript, tailwind, vitest, tsx) — `npm install` ✓
- [x] Data layer — in-memory demo store working; Supabase Postgres schema + RLS ready in `supabase/schema.sql`
- [x] CI runs tests on every PR (`.github/workflows/ci.yml`)
- [x] `GET /api/health` → `{ ok, db, graph, mode }`

## B1 — Check pipeline  _(F01)_
- [x] `lib/extract.ts` — rules-only field extraction (phones, UPI, emails, urls, wallets, fee, company)
- [x] `POST /api/upload` (<5MB → fileId) + vision path for images/PDF
- [x] `lib/check.ts` pipeline: extract → rules → graph → score → save
- [x] `POST /api/check` returns the contract shape; message-hash cache (second call cached)
- [x] Vitest U9 / U15 / U19 (`tests/extract.test.ts`, `tests/check.test.ts`)

## B2 — Rules & scoring  _(F02)_
- [x] `lib/rules.ts` — fee (blocking), free-mail, telegram handoff, task scam, remote access, sensitive-info, urgency
- [x] `lib/score.ts` — blocking/high/medium → ≥ Suspicious; 2+ confirmed links → Scam; never Scam from one unverified report
- [x] `prompts/verdict.md` + model verdict adapter
- [x] Accuracy proven via `npm run eval` (100% / 0 FP); dedicated Vitest U1–U8, U10–U12 in `tests/rules.test.ts` & `tests/score.test.ts`

## B3 — Fraud graph  _(F03)_
- [x] TigerGraph Savanna workspace + GSQL schema (`graph/schema.gsql`)
- [x] `lib/graph.ts` — in-TS 2-hop neighbour-risk, seeded from `fixtures/graph_seed.json`
- [x] Postgres/graph fallback logic (the in-memory graph **is** the fallback)
- [x] `scripts/graph-sync.ts` (sync verification + TigerGraph ready)
- [x] Vitest U13 / U14 / U16 (`tests/graph.test.ts`)

## B4 — Report & 1930 complaint  _(F04)_
- [x] `POST /api/report` — saves report, returns a ready 1930 complaint draft
- [x] Add report identifiers into the graph (close the learning loop)
- [x] viaSocket `report.created` / `scam.confirmed` webhooks
- [x] Done-when: a new report changes the next check on a linked number (`tests/report.test.ts`)

## B5 — Share card route & result data  _(F05)_
- [x] Result data persisted in the store (`checkId` → result); `/r/[id]` page + card image route (`/api/share/[id]`)
- [x] Vitest U18 (`tests/share.test.ts`)

## B6 — Verified offer letter  _(F06)_
- [x] EAS schema register · daily Merkle attest cron (`GET /api/cron/attest` + `scripts/attest-daily.ts`) · `GET /api/verify/:id`
- [x] Vitest U20 (`tests/verify-letter.test.ts`)

## B7 — Hardening & launch gate  _(Phase 1 close)_
- [x] Rate limits (`lib/rate-limit.ts` sliding-window with HTTP 429)
- [x] Operational runbooks & ERD documented in [`docs/`](../docs/README.md)
- [x] Telegram bot webhook (`POST /api/telegram` in `tests/telegram.test.ts` / F07)
- [x] Full E2E smoke tests in `tests/e2e-smoke.test.ts`
- [~] Turnstile & Sentry production instrumentation

## Tests (Saurabh owns the harness)
- [x] `scripts/eval.ts` eval harness over fixtures (run-eval) — **100% caught, 0 FP**
- [x] Vitest unit U1–U20 all passing (36 unit tests)

## Phase 2–5 (backend)
- [ ] F08 voice/translation · F09 college API + Dodo · F10 employer + mainnet · F11 WhatsApp webhook · F13 wallet + public API

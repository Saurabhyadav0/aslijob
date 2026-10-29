# Backend tasks — Saurabh (build lead)

Scope (from the plan): check API, rules, AI verdict, TigerGraph schema and sync,
EAS offer-letter flow, Vercel and Supabase setup, and the tests.
Skills to read first: `backend`, `database-architect`, `testing`, `security`,
`rbac-gate`, `infra`, plus the product skills `add-scam-pattern`, `graph-change`,
`eas-letter`, `run-eval`. Boundary = the API contract in [`README.md`](./README.md).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

> **Checkpoint (29 Oct):** demo / rules-only MVP is live in code and runs with
> **no external accounts**. `npm install` ✓, `npx tsc --noEmit` ✓ (clean),
> `npm run eval` ✓ → **8/8 scams caught, 0 false positives (PASS)**.
> Not yet done: `npm run dev`/Vercel deploy, Supabase + TigerGraph + AI adapters,
> upload, offer-letter, Vitest/Playwright suites. Supabase→in-memory store and
> TigerGraph→in-TS graph are the working demo fallbacks.

---

## B0 — Project, Supabase & Vercel setup  _(Phase 0)_
- [~] App scaffold (hand-written Next 14 + TS + Tailwind + Vitest; not `create-next-app`)
- [x] package.json scripts: `dev build lint test eval seed graph:sync`
- [x] Install deps (next, react, zod; dev: typescript, tailwind, vitest, tsx) — `npm install` ✓
- [~] Data layer — **in-memory demo store** working; Supabase Postgres schema + RLS pending
- [ ] Deploy to Vercel; CI runs tests on every PR
- [x] `GET /api/health` → `{ ok, db, graph, mode }`

## B1 — Check pipeline  _(F01)_
- [x] `lib/extract.ts` — rules-only field extraction (phones, UPI, emails, urls, wallets, fee, company)
- [ ] `POST /api/upload` (<5MB → fileId) + vision path for images/PDF
- [x] `lib/check.ts` pipeline: extract → rules → graph → score → save
- [x] `POST /api/check` returns the contract shape; message-hash cache (second call cached)
- [ ] Vitest U9 / U15 / U19

## B2 — Rules & scoring  _(F02)_
- [x] `lib/rules.ts` — fee (blocking), free-mail, telegram handoff, task scam, remote access, sensitive-info, urgency
- [x] `lib/score.ts` — blocking/high/medium → ≥ Suspicious; 2+ confirmed links → Scam; never Scam from one unverified report
- [ ] `prompts/verdict.md` + real model verdict (adapter stub returns "safe" in demo)
- [~] Accuracy proven via `npm run eval` (100% / 0 FP); dedicated Vitest U1–U8, U10–U12 pending

## B3 — Fraud graph  _(F03)_
- [ ] TigerGraph Savanna workspace + GSQL schema + token
- [x] `lib/graph.ts` — in-TS 2-hop neighbour-risk, seeded from `fixtures/graph_seed.json`
- [x] Postgres/graph fallback logic (the in-memory graph **is** the fallback)
- [~] `scripts/graph-sync.ts` (stub; real sync pending TigerGraph)
- [ ] Vitest U13 / U14 / U16

## B4 — Report & 1930 complaint  _(F04)_
- [x] `POST /api/report` — saves report, returns a ready 1930 complaint draft
- [ ] Add report identifiers into the graph (close the learning loop)
- [ ] viaSocket `report.created` / `scam.confirmed` webhooks
- [~] Done-when: a new report changes the next check on a linked number

## B5 — Share card route & result data  _(F05)_
- [~] Result data persisted in the store (`checkId` → result); `/r/[id]` page + card image route pending

## B6 — Verified offer letter  _(F06)_
- [ ] EAS schema register · daily Merkle attest cron · `GET /api/verify/:id`

## B7 — Hardening & launch gate  _(Phase 1 close)_
- [ ] Rate limits · Turnstile · Sentry/PostHog · Vercel deploy · launch gate

## Tests (Saurabh owns the harness)
- [x] `scripts/eval.ts` eval harness over fixtures (run-eval) — **100% caught, 0 FP**
- [ ] Vitest unit U1–U20 + Playwright E1–E3 in CI

## Phase 2–5 (backend)
- [ ] F08 voice/translation · F09 college API + Dodo · F10 employer + mainnet · F11 WhatsApp webhook · F13 wallet + public API

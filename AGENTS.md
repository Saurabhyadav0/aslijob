# AsliJob — Agent Contract

AsliJob is a job-offer scam checker for Indian job seekers: paste or share a job
message, recruiter, number or payment request and get **Safe / Suspicious / Scam**
in seconds, with reasons in the user's own language, backed by a shared fraud
graph and onchain offer-letter verification.

**Stack:** TypeScript everywhere — Next.js (PWA) + Tailwind on Vercel, Supabase
(Postgres) as source of truth, TigerGraph for the fraud graph, EAS on Base for
onchain proofs, grammY for the Telegram bot, viem/EAS SDK for contracts tooling.

This repo runs in **agent-skills mode**: the behaviour, standards and workflow an
AI coding agent must follow live in `.agents/skills/` (mirrored into the editor
skills dot-folder so compatible tooling auto-loads them). Read the matching skill **before** writing code — do not infer the standard from
neighbouring files.

## Session start

1. Read `feature.json` — the single source of truth for work in flight.
2. Read `agent-progress.md` if present (local, gitignored session handoff).
3. Pick the one feature that is `active` (or open one — see Feature ledger).

## Behavioural constraints

1. **One feature at a time.** Only one entry in `feature.json` may be `active`.
   Finish or park it before starting another. Use the `feature-tracker` skill.
2. **Pass-state gating.** A feature becomes `passing` only after its
   `verification` command actually passes. `passing` is irreversible.
3. **Read the skill first.** A new endpoint touching auth/roles = `backend` +
   `rbac-gate` + `testing`. A schema change = `database-architect` + `postman`.
4. **Privacy by default.** Identifiers (phone, UPI, email, domain, wallet) are
   stored only as salted hashes plus a masked display value. Never persist raw
   chat text; store a message hash for the cache, not the message.
5. **Never over-accuse.** Never label a number or person "scam" from a single
   unverified report — show "reported N times" instead. Scam needs strong
   evidence (a fee demand, a confirmed graph link, or a verified employer).
6. **Secrets never in code.** Use `.env.local` / Vercel env vars. With no model
   key set, the check pipeline must still run in rules-only mode.
7. **Conventional Commits.** `feat(scope): msg`, `fix(scope): msg`, etc. No AI
   attribution in commit messages (see `caveman-commit`).
8. **Clean exit.** Lint and tests green, `feature.json` updated, work committed.

## Keep token cost low (model routing)

AsliJob is built to run cheap. Apply the same discipline to agent work:

- **Rules first, model last.** Deterministic rule checks and graph lookups are
  free — reach for a model only when they don't settle the case.
- **Prefer the smaller model.** Use the cheapest capable model for extraction,
  routine edits and easy verdicts; escalate to a stronger model only for
  screenshots, PDFs and genuinely unclear cases.
- **Cache repeated inputs.** Hash each message; a forwarded scam seen before
  gets the stored answer, never a fresh model call.
- **Compress the memory files.** Keep `AGENTS.md` and notes lean; the `caveman`
  and `caveman-compress` skills cut both response and context tokens.

## Feature ledger (`feature.json`)

1. Only one feature may be `active` at a time.
2. A feature transitions to `passing` only when its `verification` command
   succeeds; then stamp `evidence: verified YYYY-MM-DD`.
3. State is irreversible once `passing`.
4. Add/remove entries only through the `feature-tracker` skill's procedure.

## Skill index

Read the relevant skill before starting that kind of work
(`.agents/skills/<name>/SKILL.md`):

| Task | Skill |
|---|---|
| Routes, API handlers, services, schemas | `backend` |
| New endpoint — specify & enforce access roles | `rbac-gate` |
| New/changed request/response payload — sync the API collection | `postman` |
| Unit / integration / e2e tests | `testing` |
| Security audit (privacy, secrets, false-positive risk) | `security`, `secure-by-default` |
| DevOps / CI-CD / deploy | `infra` |
| Complex queries | `database-skill` |
| Schema/index design, migration planning | `database-architect` |
| Code review | `review`, `caveman-review` |
| Bug diagnosis | `diagnose` |
| Architecture improvement | `improve-codebase-architecture`, `solid-engineering`, `zoom-out` |
| Track a new unit of work | `feature-tracker` |
| Engineering workflow & production readiness | `engineering-workflow`, `production-readiness` |
| Delegate to subagents | `subagent-first` |
| PRD / issue breakdown / triage | `to-prd`, `to-issues`, `triage` |
| Pressure-test a design or assumption | `grill-me`, `grill-with-docs` |
| Terse communication / commits to save tokens | `caveman`, `caveman-commit`, `caveman-stats` |
| Compress memory files to save tokens | `caveman-compress` |
| Runtime feedback loop for self-correction | `runtime-feedback` |

## Repo map

- `.agents/skills/` — the skill set above (source of standards).
- the skills are mirrored into the editor skills dot-folder so compatible tooling
  auto-loads them; both copies are identical.
- `feature.json` — current feature state (one active at a time).
- `AGENTS.md` — this contract.
- `agent-progress.md` — local session handoff (gitignored; create as needed).

# AsliJob

**Check a job offer before you pay.** AsliJob tells a job seeker in seconds
whether a job offer, recruiter or payment request is real — and explains why, in
their own language.

> Hacker House Goa 2026 build, planned as a real product. *"AsliJob"* is a
> working name.

Paste or share a message, screenshot, number, UPI ID or link and get a clear
verdict — **Safe · Suspicious · Scam** — with the reasons behind it, backed by a
shared fraud graph and company-issued offer-letter verification.

---

## Why

Fake recruiters, forged offer letters and "pay to start" schemes hit India's
young job seekers hardest — mostly over WhatsApp, Telegram and fake LinkedIn
profiles. Once money moves it is rarely recovered. There is no quick, trusted
way to check an offer *before* paying. AsliJob is that check, wherever the scam
arrives.

What is hard to copy isn't the AI verdict — anyone can build that. It's two
things that grow with every use:

- **A fraud graph** that links scam phone numbers, UPI IDs, domains and wallets
  across every report, so one victim's report protects the next person.
- **Company-issued offer-letter verification anchored onchain**, which no
  current checker offers.

## What it does

| Feature | What the user gets |
|---|---|
| **Check anything** | One place to check any message, screenshot, number or link |
| **Verdict with reasons** | A clear Safe / Suspicious / Scam answer and the reasons for it |
| **Scam network check** | Catches scammers nobody has reported yet, via a 2-hop graph lookup |
| **Report + 1930 complaint** | Protects the next person and drafts a ready 1930 cybercrime complaint |
| **Share warning card** | Warns the group the scam came from |
| **Verified offer letter** | Proof a letter is genuinely from the company (onchain) |
| **Telegram bot** | Check without opening a website |
| **Languages & voice** | Use it in English, Hindi or Marathi, by voice |

Later phases add a college dashboard, an employer portal, a WhatsApp bot, a
Chrome extension, and a public scam-signals API.

## How a check works

```
message / screenshot / number
        ↓
  POST /api/check
        ↓
  extract fields  →  rule checks (free)  →  graph + lookups  →  model verdict
        ↓
  score (hard red flags win)  →  Safe · Suspicious · Scam  →  reasons + next step
```

A fee to get hired always forces at least **Suspicious**. A verdict is never a
bare score — it always shows the evidence.

## Stack

TypeScript everywhere. Next.js (PWA) + Tailwind on Vercel · Supabase (Postgres)
as the source of truth · TigerGraph for the fraud graph · EAS on Base for onchain
proofs · grammY for the Telegram bot.

---

## This repository: the agent-skills framework

This repo is the **agent workflow and skills framework** AsliJob is built with —
the standards, the feature ledger and the reusable skills a coding agent follows
while building the product.

```
.agents/skills/   29 reusable skills (the source of engineering standards)
AGENTS.md         the agent contract: how work is done in this repo
feature.json      the feature ledger — one feature active at a time
```

> The skills are also mirrored into the editor skills directory (a dot-folder)
> so compatible agent tooling auto-loads them; both copies are identical.

### Feature ledger

`feature.json` is the single source of truth for work in flight. Every feature
is a testable, user-visible behaviour with a real `verification` command and a
state: `not_started → active → (blocked) → passing`. Only **one** feature may be
`active` at a time, and `passing` is irreversible. The **feature-tracker** skill
owns how entries are added, removed and verified.

### Skills

29 skills cover backend work, database design, testing, security, code review,
diagnosis, architecture, PRDs, triage and more. A few highlights:

- **feature-tracker** — maintains `feature.json` and its invariants.
- **backend / database-architect / testing / security / rbac-gate** — the core
  build-and-verify loop.
- **caveman / caveman-compress / caveman-stats** — a token-saving toolkit:
  terser responses and compressed memory files, so every session costs less.

See [`AGENTS.md`](./AGENTS.md) for the full skill index and the behavioural
rules (privacy-by-default, never over-accuse, model routing to keep cost low).

### Built to run cheap

AsliJob routes work to the smallest capable model and only escalates for hard
cases (screenshots, PDFs, unclear messages); rule checks and graph lookups are
free, and repeated scam forwards are cached. The same discipline applies to agent
work — see the "Keep token cost low" section of `AGENTS.md`.

---

## License

TBD.

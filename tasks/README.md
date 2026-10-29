# AsliJob task board

Two builders, splitting by the plan's team roles. Work talks **only through the
API contract**, so both sides build in parallel.

## Team roles (from the plan)

- **Saurabh — build lead** → [`backend.md`](./backend.md): check API, rules, AI
  verdict, TigerGraph schema and sync, EAS offer-letter flow, Vercel and Supabase
  setup, and the tests.
- **Sumit — product & growth** → [`frontend.md`](./frontend.md): web app screens
  and share card, Telegram bot, the Telegram and WhatsApp community channels,
  collecting scam samples, launch posts, demo video and pitch.

Both: 10-min check-ins at 9 AM and 2 PM, the 9 PM house headcount, and this one
shared task list where every task has one owner.

## The boundary (API contract)

Every channel (web, Telegram, WhatsApp, extension) calls the same API. Frontend
builds against these shapes; backend fulfils them. Never copy check logic into a
channel.

```
POST /api/check      { text?, fileId?, identifier?{kind,value}, lang, channel, ref? }
                  -> { checkId, verdict, confidence, reasons[], graph{linkedReports,cities,path}, nextStep, shareUrl }
POST /api/upload     image/PDF < 5MB -> { fileId }
POST /api/report     { checkId, scamType, amountLost?, collegeId? } -> { reportId, complaintText }
GET  /api/verify/:id -> { valid, company, role, issuedAt, easUid }
POST /api/telegram   Telegram update (X-Telegram-Bot-Api-Secret-Token must match)
GET  /api/cron/attest daily EAS batch (cron only)
GET  /api/health     { ok, db, graph }
```

## Phases (exit test gates each one)

| Phase | When | Goal | Exit test |
|---|---|---|---|
| 0 Setup | Thu 1–2 PM | everyone builds & deploys from one base | empty app live at a public URL, CI runs on every PR, graph schema loaded |
| 1 Hackathon MVP | Thu 2 PM → Sat 9:59 AM | live product with real users, submitted | submitted on time; **≥ 200 checks** from real users |
| 2 Launch & harden | week 1 | safe at scale, easy to reach | false positives < 2%; target 1,000 weekly users |
| 3 First paying customers | weeks 2–3 | prove colleges will pay | 5 pilots, ≥ 2 paid |
| 4 Verification network | weeks 4–6 | real employers in the product | 3 employers issuing letters, 1 API customer |
| 5 Scale | week 7+ | beyond job scams and one state | set after phase 4 |

## Hackathon schedule

- **Thu 29 Oct** — repo + app deployed, Supabase, TigerGraph schema; `/api/check`
  with extraction + rules + AI verdict; paste/upload works end to end; by night:
  graph sync + neighbour-risk in the verdict, report flow, share card, Telegram bot.
- **Fri 30 Oct (launch day)** — launch assets (30s demo video, share card, Hindi +
  English posts); Phase-1 submission; launch on socials + college WhatsApp groups;
  add EAS letter QR demo + Dodo college plan; record numbers.
- **Sat 31 Oct** — freeze features (Fri 10 PM), final check everything is live,
  pitch deck + demo video with real numbers. **9:59 AM final submission. No extensions.**

## Cut order if behind

Drop in this order: voice → Chrome extension → crypto wallet checks → employer
portal UI (keep a scripted letter-issue for the demo) → Dodo checkout.
**Never drop:** the check flow, the graph lookup, the share card, and real users.

## How tasks map to the ledger

Each group is tagged with its `feature.json` id (F01–F13). Open it with the
**feature-tracker** skill (set `active`), mark `passing` only when its
`verification` command passes. One feature `active` at a time per person.

## Conventions

- Branch per task, small PRs merged within the hour; **main always deployable**.
- Conventional Commits: `feat(check): …`, `fix(graph): …`. No AI attribution.
- Privacy by default: store salted hashes + masked display only, never raw chat.
- Evidence before Scam: never label a person/number "scam" from one unverified report.
- Real data first: test with scam messages collected at the house.

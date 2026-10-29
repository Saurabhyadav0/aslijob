# AsliJob task board

Work splits into two tracks that talk **only through the API contract**, so both
sides build at the same time without waiting on each other.

| Track | Owner | File |
|---|---|---|
| Backend — API, pipeline, graph, onchain | Saurabh | [`backend.md`](./backend.md) |
| Frontend — screens, PWA, share, scan | Sumit | [`frontend.md`](./frontend.md) |

## The boundary (API contract)

Every channel (web, Telegram, WhatsApp, extension) calls the same API. Frontend
builds against these shapes; backend fulfils them.

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

## How tasks map to the ledger

Each task group is tagged with its `feature.json` id (F01–F13). When you start a
group, open that feature with the **feature-tracker** skill (set it `active`),
and mark it `passing` only after its `verification` command passes. One feature
`active` at a time per person.

## Conventions

- Branch per task group: `feat/bN-<slug>` or `feat/fN-<slug>`; PR into `main`.
- Conventional Commits: `feat(check): ...`, `fix(graph): ...`.
- Privacy by default: store salted hashes + masked display only, never raw chat.
- Never label "scam" from a single unverified report — show "reported N times".

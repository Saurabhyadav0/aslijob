# Frontend & growth tasks — Sumit (product & growth) — owned by apita

Scope (from the plan): web app screens and share card, Telegram bot, the Telegram
and WhatsApp community channels, collecting scam samples, launch posts, demo video
and pitch. Build against the API contract in [`README.md`](./README.md). Skills:
`backend` (for API shapes), `testing`, `review`, `demo-ready` before any launch/demo.

Design direction: mobile-first (360px, one hand) · one job per screen · verdict
colours green/amber/red **always with icon + word** · ≥16pt body · language
switch at top (en/hi/mr) · Noto Sans + Devanagari · <200KB first load.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

> **Checkpoint (29 Oct):** a **minimal working home screen** exists so the MVP is
> demoable end-to-end (paste → `/api/check` → verdict card with reasons + next
> step + demo-data label). Everything else below is **apita's** to build/polish.

---

## Screens

### F0 — App shell & design system  _(Phase 0)_
- [x] Root layout, Tailwind, Noto Sans + Devanagari fonts, centered 640px mobile column
- [x] Verdict colour tokens (safe/suspicious/scam) in Tailwind config
- [ ] PWA manifest with `share_target` (Android share sheet → app)
- [~] Routes: `/` done; `/r/[id]`, `/report`, `/v/[id]` pending

### F1 — Home  _(F01)_
- [x] Paste box + "Check this" → calls `POST /api/check`, renders verdict card + reasons + next step
- [ ] "Upload screenshot" + "Check a number or UPI ID" entry points
- [ ] Strip: today's check count + latest scam alert
- [ ] Headline polish / empty states

### F2 — Checking screen
- [ ] Step list that ticks off as the check runs

### F3 — Result  _(F02)_
- [~] Inline verdict card on home (colour + icon + word + reasons); dedicated `/r/[id]` page + share/report/check-another buttons pending

### F4 — Scam network view  _(F03)_
- [ ] Graph view + "Linked to N reports in M cities" summary (API already returns `graph`)

### F5 — Report flow  _(F04)_
- [ ] Two-tap form → `POST /api/report`; show 1930 complaint with Copy + Call 1930

### F6 — Share warning card  _(F05)_
- [ ] Share button → card image; `?ref=tg`/`?ref=wa` tags

### F7 — Verify letter  _(F06)_
- [ ] Camera QR scan → `GET /api/verify/:id`

### F8 — Telegram bot  _(F07)_  ·  _(plan: Sumit owns the bot)_
- [ ] grammY webhook `POST /api/telegram` calling the shared `/api/check`

### F9 — Languages & voice  _(F08, Phase 2)_
- [ ] en/hi/mr strings from `i18n/`; voice input + spoken answer

## Growth & launch (owner: Sumit / apita)
- [ ] G1 Community channels (Telegram + WhatsApp, welcome posts, invites)
- [ ] G2 Collect scam samples → `fixtures/scams.json` + `graph_seed.json`
- [ ] G3 Launch posts (Hindi + English) + daily scam alert
- [ ] G4 30-sec demo video + pitch deck with real numbers (run `demo-ready` first)

## Phase 2–3 (frontend)
- [ ] F09 college dashboard · F10 employer portal · F12 Chrome extension

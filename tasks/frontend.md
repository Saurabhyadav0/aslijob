# Frontend & growth tasks — Sumit (product & growth) — owned by apita

Scope (from the plan): web app screens and share card, Telegram bot, the Telegram
and WhatsApp community channels, collecting scam samples, launch posts, demo video
and pitch. Build against the API contract in [`README.md`](./README.md). Skills:
`backend` (for API shapes), `testing`, `review`, `demo-ready` before any launch/demo.

Design direction: mobile-first (360px, one hand) · one job per screen · verdict
colours green/amber/red **always with icon + word** · ≥16pt body · language
switch at top (en/hi/mr) · Noto Sans + Devanagari · <200KB first load.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

> **Checkpoint (29 Oct):** Frontend screens and PWA setup complete on branch `feat/frontend-build`.
> Mobile-first UI (<103KB first load JS) with language switch (English, हिंदी, मराठी),
> upload, direct number/UPI check, animated step checklist, scam network view, two-tap 1930 report flow,
> dedicated `/r/[id]` result page, and `/verify` offer letter verification screen.

---

## Screens

### F0 — App shell & design system  _(Phase 0)_
- [x] Root layout, Tailwind, Noto Sans + Devanagari fonts, centered 640px mobile column
- [x] Verdict colour tokens (safe/suspicious/scam) in Tailwind config
- [x] PWA manifest with `share_target` (`public/manifest.json` + `public/icon.svg` — Android share sheet → app)
- [x] Routes: `/`, `/r/[id]`, `/report`, `/verify`, `/v/[id]` all live and verified

### F1 — Home  _(F01)_
- [x] Paste box + "Check this" → calls `POST /api/check`, renders verdict card + reasons + next step
- [x] "Upload screenshot" (file picker → `POST /api/upload`) + "Check a number or UPI ID" entry points
- [x] Strip: today's check count + latest scam alert
- [x] Headline polish, demo sample chips, and empty states

### F2 — Checking screen
- [x] Step list that ticks off sequentially with animation as the check runs

### F3 — Result  _(F02)_
- [x] Inline verdict card on home (colour + icon + word + reasons + confidence)
- [x] Dedicated `/r/[id]` page + share/report/check-another buttons

### F4 — Scam network view  _(F03)_
- [x] Graph view + "Linked to N reports in M cities" summary with identifier path trail

### F5 — Report flow  _(F04)_
- [x] Two-tap form on `/report` → `POST /api/report`; show 1930 complaint with Copy + Call 1930 buttons

### F6 — Share warning card  _(F05)_
- [x] Share button → card image (`/api/share/[id]`); WhatsApp share intent with `?ref=wa`

### F7 — Verify letter  _(F06)_
- [x] Offer letter verify screens (`/verify` and `/v/[id]`) → `GET /api/verify/:id` with Base Sepolia EAS verification

### F8 — Telegram bot  _(F07)_
- [x] Shared check API webhook `POST /api/telegram`

### F9 — Languages & voice  _(F08, Phase 2)_
- [x] en/hi/mr strings from `lib/i18n.ts` with top language switcher (English, हिंदी, मराठी)
- [ ] Voice input + spoken answer

## Growth & launch (owner: Sumit / apita)
- [ ] G1 Community channels (Telegram + WhatsApp, welcome posts, invites)
- [ ] G2 Collect scam samples → `fixtures/scams.json` + `graph_seed.json`
- [ ] G3 Launch posts (Hindi + English) + daily scam alert
- [ ] G4 30-sec demo video + pitch deck with real numbers (run `demo-ready` first)

## Phase 2–3 (frontend)
- [ ] F09 college dashboard · F10 employer portal · F12 Chrome extension

# Frontend & growth tasks — Sumit (product & growth)

Scope (from the plan): web app screens and share card, Telegram bot, the Telegram
and WhatsApp community channels, collecting scam samples, launch posts, demo video
and pitch. Build against the API contract in [`README.md`](./README.md) — mock the
responses until the backend route is live. Skills: `backend` (for API shapes),
`testing`, `review`, `demo-ready` before any launch/demo.

Design direction: mobile-first (360px, one hand) · one job per screen · verdict
colours green/amber/red **always with icon + word** · ≥16pt body · language
switch at top (en/hi/mr) · Noto Sans + Devanagari · <200KB first load.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## Screens

### F0 — App shell & design system  _(Phase 0)_
- [ ] PWA manifest with `share_target` (Android share sheet → app)
- [ ] Centered mobile column; Noto Sans + Devanagari; verdict colour tokens + icons
- [ ] Language switch (en/hi/mr) in the header, wired to `i18n/`
- [ ] Routes scaffold: `/`, `/r/[id]`, `/report`, `/v/[id]`

### F1 — Home  _(F01)_
- [ ] Headline "Got a job offer? Check it before you pay."
- [ ] Paste box + "Upload screenshot" + "Check a number or UPI ID"
- [ ] Strip: today's check count + latest scam alert
- [ ] Calls `POST /api/upload` then `POST /api/check` — `npm run test -- home`

### F2 — Checking screen
- [ ] Step list ticks off as it runs (reading → company → scam network) — `npm run test -- checking`

### F3 — Result  _(F02)_
- [ ] Large verdict card (colour + icon + word); 2–4 reasons with icons
- [ ] "Safe" adds "no red flags found, not a guarantee"; three buttons: Share · Report · Check another — `npm run test -- result`

### F4 — Scam network view  _(F03)_
- [ ] Checked node centre, red dots for linked reports; summary line "Linked to 6 reports in 3 cities"; tap = full screen on phones — `npm run test -- network-view`

### F5 — Report flow  _(F04)_
- [ ] Two-tap form prefilled from the check (asks only what was lost and when)
- [ ] Ready 1930 complaint with Copy + Call 1930 + cybercrime.gov.in link — `npm run test -- report-ui`

### F6 — Share warning card  _(F05)_
- [ ] Share button → image from the backend card route; opens the result link
- [ ] Add "Join for scam alerts" links tagged `?ref=tg` / `?ref=wa`
- [ ] Done-when: card shares to WhatsApp from a phone and the link opens — `npm run test -- share-ui`

### F7 — Verify letter  _(F06)_
- [ ] Camera opens to scan the QR; result shows company, role, date with "Verified by the company" / "Not issued by this company"
- [ ] Calls `GET /api/verify/:id` — `npm run test -- verify-ui`

### F8 — Telegram bot  _(F07)_  ·  _(plan: Sumit owns the bot)_
- [ ] grammY webhook `POST /api/telegram`; verify `X-Telegram-Bot-Api-Secret-Token`
- [ ] Reply with verdict, reasons, share link via the **shared** `/api/check`
- [ ] setWebhook to the deployed URL — `npm run test -- telegram`; E2 passes

### F9 — Languages & voice  _(F08, Phase 2)_
- [ ] Verdict + reasons render in en/hi/mr from `i18n/`; U20 (no missing keys)
- [ ] Voice question in Hindi/Marathi, spoken answer

## Growth & launch (owner: Sumit)

### G1 — Community channels  _(Thu 2–6 PM)_
- [ ] Telegram channel "AsliJob Scam Alerts" + linked discussion group; add the bot
- [ ] WhatsApp Channel (alerts) + "AsliJob Beta Testers" group
- [ ] Pinned welcome post in each (what it does, how to check, rules, app link)
- [ ] Invite house builders, college friends, family; ask each for one scam message
- [ ] Group rules enforced: mask identifiers, admins-only in channels, no selling, point victims to 1930 (never "recovery agents")
- [ ] Target: 100 members by Fri 9 PM, 50 who ran ≥ 1 check (count active users in PostHog)

### G2 — Collect scam samples  _(Thu, ongoing)_
- [ ] Shared form for everyone at the house to submit scam job messages
- [ ] Mask real numbers/UPI; load into `fixtures/scams.json` + `graph_seed.json`

### G3 — Launch  _(Fri 30 Oct)_
- [ ] Launch posts in Hindi + English; push with House of NGMI creators + college WhatsApp groups
- [ ] One scam-alert post a day from real reports (identifiers masked)

### G4 — Demo & pitch  _(Fri night → Sat 9:59 AM)_
- [ ] 30-second demo video + first share cards
- [ ] Record numbers (checks run, scams caught, users, shares) + member counts for the pitch
- [ ] Pitch deck with real usage numbers; run `demo-ready` before presenting

## Phase 2–3 (frontend)
- [ ] F09 college dashboard (desktop): student reports, gangs, batch warning
- [ ] F10 employer portal (desktop): domain proof, recruiters, issued letters, alerts
- [ ] F12 Chrome extension: "Check this" on LinkedIn/Naukri/Gmail, runs only on click

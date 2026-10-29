# Frontend tasks — Sumit

Owns the screens, the installable PWA, the share card UI and the scan flow.
Skills to read first: `backend` (for the API shapes), `testing`, `review`.
Build against the API contract in [`README.md`](./README.md) — mock the
responses until the backend route is live.

Design direction: mobile-first (360px, one hand) · one job per screen · verdict
colours green/amber/red **always with icon + word** · ≥16pt body · language
switch at top (en/hi/mr) · Noto Sans + Noto Sans Devanagari · <200KB first load.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## F0 — App shell & design system  _(no feature id; enables all)_
- [ ] PWA manifest with `share_target` (Android share sheet → app)
- [ ] Centered mobile column layout; Noto Sans + Devanagari; verdict colour tokens + icons
- [ ] Language switch (en/hi/mr) in the header, wired to a strings layer
- [ ] App router pages scaffold: `/`, `/r/[id]`, `/report`, `/v/[id]`

## F1 — Home screen  _(F01)_
- [ ] Headline "Got a job offer? Check it before you pay."
- [ ] One paste box + "Upload screenshot" + "Check a number or UPI ID"
- [ ] Strip: today's check count + latest scam alert
- [ ] Calls `POST /api/upload` then `POST /api/check` — `verification: npm run test -- home`

## F2 — Checking screen
- [ ] Step list that ticks off as it runs (reading message → checking company → checking scam network)
- [ ] Progress view so the wait feels short — `verification: npm run test -- checking`

## F3 — Result screen  _(F02)_
- [ ] Large verdict card (Safe/Suspicious/Scam, colour + icon + word)
- [ ] 2–4 reasons with icons; "Safe" always adds "no red flags found, not a guarantee"
- [ ] Three buttons: Share warning · Report scam · Check another
- [ ] `verification: npm run test -- result`

## F4 — Scam network view  _(F03)_
- [ ] Small graph: checked node in centre, red dots for linked scam reports
- [ ] Summary line e.g. "Linked to 6 reports in 3 cities" from `graph.path`
- [ ] `verification: npm run test -- network-view`

## F5 — Report flow  _(F04)_
- [ ] Two-tap form, prefilled from the check (asks only what was lost and when)
- [ ] Shows the ready 1930 complaint with Copy + Call 1930 buttons + cybercrime.gov.in link
- [ ] Calls `POST /api/report` — `verification: npm run test -- report-ui`

## F6 — Share warning card  _(F05)_
- [ ] Share button → image from the card route; opens the result link
- [ ] Result page `/r/[id]` renders from backend data
- [ ] Done-when: card shares to WhatsApp from a phone and the link opens — `verification: npm run test -- share-ui`

## F7 — Verify letter screen  _(F06)_
- [ ] Camera opens to scan the QR code
- [ ] Result shows company, role, date with "Verified by the company" / "Not issued by this company"
- [ ] Calls `GET /api/verify/:id` — `verification: npm run test -- verify-ui`

## F8 — Languages & voice  _(F08, week 1)_
- [ ] Verdict + reasons render in chosen language
- [ ] Voice question in Hindi/Marathi, spoken answer

## Phase 2–3 (after hackathon)
- [ ] F09 college dashboard (desktop route): student reports, gangs, batch warning
- [ ] F10 employer portal (desktop route): domain proof, recruiters, issued letters, alerts
- [ ] F12 Chrome extension: "Check this" on LinkedIn/Naukri/Gmail, runs only on click

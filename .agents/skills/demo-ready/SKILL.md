---
name: demo-ready
description: >
  Use before a demo, a launch post or a release. Triggers: "is it demo ready",
  "pre-demo check", "before we launch", "smoke test for the pitch".
---

# Demo ready

1. Wake the TigerGraph workspace and confirm a graph query answers (the free
   workspace stops after an hour without use).
2. Confirm production env vars exist in Vercel for every name in `.env.example`.
3. Smoke test on a **360px-wide screen**: paste a known scam, a screenshot, a
   genuine offer, a report, a share card, a letter verify, the Telegram bot.
4. Check PostHog shows the test checks, then report anything that failed.

---
name: add-scam-pattern
description: >
  Use when adding or updating a job-scam detection rule in AsliJob, for example
  after a new scam message is reported. Triggers: "add a scam rule", "new scam
  pattern", "this message got through", "update the rules".
---

# Add a scam pattern

1. Ask for or read the example scam message(s) and one genuine message that looks similar.
2. Add a rule in `lib/rules.ts`: unique `id`, `severity` (`low | medium | high | blocking`),
   a plain-language `reason` with the specific detail filled in.
3. Add the examples to `tests/fixtures/scams/` and `tests/fixtures/genuine/`.
4. Add tests in `tests/rules.test.ts`: the rule fires on the scam, not on the genuine one.
5. Run the full test suite and the eval script (`npm run eval`). Report the change in
   false positives and missed scams before and after.
6. If the pattern includes identifiers (phones, UPI IDs, domains), add them to the
   seed script for the graph, **hashed**.

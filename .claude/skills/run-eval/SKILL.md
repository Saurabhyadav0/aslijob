---
name: run-eval
description: >
  Use after any change to rules, prompts, scoring or models, and before a
  release. Triggers: "run the eval", "check false positives", "did this change
  the verdicts", before merging a rules/prompt change.
---

# Run eval

1. Run `npm run eval` on `tests/eval/` (labelled scam and genuine examples).
2. Report: missed scams, false positives on genuine offers, average cost and
   time per check, each compared with the last saved run in `eval/last.json`.
3. If false positives went up, show the examples and **stop before merging**.
4. Save the new run to `eval/last.json` only when the change is accepted.

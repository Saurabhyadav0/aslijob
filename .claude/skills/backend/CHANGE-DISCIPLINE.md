# Change Discipline — Cheat Sheet

**Touch only what the task requires. Default to the smallest change that satisfies it.**

## Hard Rules

| ❌ Never | ✅ Instead |
|---------|-----------|
| Reorder / sort imports | Add only the imports your new code needs |
| Rename variables outside task scope | Note the rename as a follow-up |
| Reformat lines you're not already changing | Let `ruff`/`black` handle it in CI |
| Rewrite a function when one line needs fixing | Change that one line |
| Add type hints to untouched lines | Only annotate lines you're editing |
| Drop or alter existing columns in a migration | Add new columns only |
| Restructure passing tests | Add new test cases alongside them |

## One Concern Per Edit
A bug fix is a bug fix. A refactor is a refactor. If you're doing two things, split them.

## Out-of-Scope Observations
If you spot a real issue outside your task, surface it — don't silently fix it:
> 🔍 Out-of-scope: `file:line` — brief description. Recommend a follow-up task.

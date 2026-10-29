---
name: runtime-feedback
description: >
  Runtime feedback and scope control for the HDSL Python FastAPI backend. Provides tools
  that allow the agent to test its own code, correct errors during execution, and enforce
  architecture boundaries. Use when the agent needs to self-correct based on test/lint output,
  enforce no-cross-app-imports rules, or run cleanup checks before session end.
---

# Runtime Feedback & Scope Control

Tools for self-testing, error correction, and architecture boundary enforcement.

## Fast Feedback Loop

When writing code, iterate with these commands:

| Command | Feedback | Use when... |
|---------|----------|-------------|
| `make lint` | ruff + black errors | After any code change |
| `make typecheck` | mypy type errors | After any code change |
| `make test` | pytest failures | After any code change |
| `make test-unit` | unit tests only | Quick pass before full suite |
| `make check-architecture` | cross-app import violations | After adding imports |

### Correction loop

```
1. make lint        → fix ruff/black errors
2. make typecheck   → fix type errors
3. make test        → fix test failures
4. make check-architecture → fix cross-app imports
```

After each command, read the output and fix issues before proceeding to the next.

## Architecture Boundary Enforcement

### Rule

`src/apps/<X>` must NOT import from `src/apps/<Y>` where `X != Y`.

Shared code must be extracted to `src/packages/`.

### Enforcement

Script: `scripts/agents/check-architecture.sh`
Integration: runs in pre-commit hook, CI lint workflow, and `verify-clean-state.sh`

The script scans all `.py` files under `src/apps/` for `from src.apps.<Y>` patterns where `<Y>` differs from the owning app of the file. It allows `workers/*` to import from any app (cross-cutting consumers).

### How to fix violations

When `make check-architecture` reports a violation:

1. Identify the shared logic (class, function, enum, schema)
2. Move it to an appropriate location under `src/packages/`
3. Update both the source and consumer to import from the package location
4. Re-run `make check-architecture` to confirm

### Typical refactoring targets

| Scenario | Package location |
|----------|-----------------|
| Shared enum/constant | `src/packages/core/enums.py` |
| Shared service logic | `src/packages/<domain>/service.py` |
| Shared Pydantic schema | `src/packages/<domain>/schemas.py` |
| Shared DB model | `src/packages/database/models/` |

## Session Boundary Enforcement

At session end, the agent must run `bash scripts/agents/verify-clean-state.sh` which checks:

1. `make lint` passes
2. `make test` passes
3. `feature_list.json` is valid
4. `agent-progress.md` is updated
5. No stale debug artifacts
6. No temp/scratch files
7. `make check-architecture` passes

All 7 must pass before a session can end. This is enforced by `scripts/agents/session-end.sh`.

## Feature Gate

When completing a feature, use `bash scripts/agents/verify-feature.sh <FID>` — the only way to mark a feature `passing`. It runs the feature's verification command and updates state only on success.

## Referenced Scripts

| Script | Purpose |
|--------|---------|
| `scripts/agents/check-architecture.sh` | Architecture boundary checker (cross-app imports) |
| `scripts/agents/verify-clean-state.sh` | Session-exit gate (7 checks) |
| `scripts/agents/verify-feature.sh` | Feature pass-state gating |
| `scripts/agents/session-end.sh` | Automated session closure + commit |

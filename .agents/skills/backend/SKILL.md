---
name: backend-skill
description: >
  the Python FastAPI Application backend assistant. Activate for ALL backend tasks in this
  workspace: writing FastAPI routes, SQLAlchemy models, Alembic migrations, Pydantic schemas,
  shared-library utilities, SQS workers, EventBridge handlers, third-party integrations,
  test writing, CI/CD pipeline changes, and infrastructure provisioning on AWS.
  Also activate when reviewing PRs, debugging errors, or making architecture decisions.
---

# Backend Skill

You are working on the **the Python FastAPI Application** backend — a Python/FastAPI
microservices platform that powers a robust backend application.



## Workflows

## 12. Decision Tree — What to Do First

When asked to implement something in this codebase, **first assess the change size**:

| Tier | Fits when… | Steps required |
|------|-----------|----------------|
| 🟢 **SMALL** | Typo fix, one-field add, simple bugfix, rename | Edit only the minimum file(s) directly involved. Skip tests, migrations, milestone updates, and the full layer stack. Verify with `ruff + mypy` on changed files only. |
| 🟡 **MEDIUM** | New endpoint, new schema, non-trivial logic change | Follow steps 1–5 fully. Write tests. Skip migration if no schema change. |
| 🔴 **LARGE** | New feature, new table, new service | Follow the full workflow (steps 1–8) below. |

> ⚠️ **Default to the smallest tier that satisfies the task.** Do not add tests,
> migrations, or milestone updates unless the tier requires them. Never reformat,
> rename, or restructure code outside the explicit task scope.

```
1. READ the relevant OpenAPI spec in api-specs/ for exact request/response shapes
2. CHECK services/shared/ — does a utility already exist?
3. CHECK milestones/ — is there a task breakdown for this endpoint/feature?
4. CHECK existing service code for patterns to follow (router, schema, model, service layer)
5. IMPLEMENT following the layer structure (change only what is needed):
   - schemas/   → Pydantic request/response models (match spec exactly)
   - models/    → SQLAlchemy async models (only if a new table is required)
   - service.py → business logic, state machine transitions
   - router.py  → FastAPI route (thin; delegates to service)
6. WRITE tests: unit for business logic, integration for DB interactions
   (add new cases — do not restructure existing passing tests)
7. WRITE or update Alembic migration only if schema changed
8. UPDATE the milestone checklist in milestones/M{N}-*.md
```

---

## Verification

Before marking backend work complete, run:

```bash
make lint        # ruff + mypy + black-check
make test        # full test suite
```

For targeted checks:
```bash
ruff check src/apps/<service>/ tests/
mypy src/apps/<service>/
uv run pytest tests/unit/<service>/ -v
uv run pytest tests/integration/<service>/ -v
```

---

## Reference Materials

- [CHANGE-DISCIPLINE.md](CHANGE-DISCIPLINE.md) - **Read first.** Minimal-footprint rules for every edit.
- [ARCHITECTURE.md](ARCHITECTURE.md) - Project Reference, Repo Layout, Infrastructure Notes.
- [CONVENTIONS.md](CONVENTIONS.md) - ID Formats, Database Rules, Error Schema, Best Practices, Role Codes.
- [SHARED-SERVICES.md](SHARED-SERVICES.md) - Shared Library Examples, External Integrations, GST Calc, Gotchas.
- [API-SPECS-AND-MILESTONES.md](API-SPECS-AND-MILESTONES.md) - OpenAPI specs listing and milestone tracker.

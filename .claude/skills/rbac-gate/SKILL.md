---
name: rbac-gate
description: >
  Mandatory RBAC gate for every new or changed HTTP endpoint. Activate WHENEVER a
  new API route, FastAPI endpoint, or router is created or its method/path changes.
  Before the endpoint is considered done, the user MUST specify which RBAC roles
  (resource + action) may call it, and the route MUST enforce it via
  require_permission / require_role plus a matching policy.csv entry.
  Triggers: "new endpoint", "add a route", "create an API", "@router.get/post/put/patch/delete",
  "expose this", "add an endpoint", or any change to an HTTP method or path.
---

# RBAC Gate Skill

Every endpoint on this platform handles sensitive data (KYC, payments, GPS, payouts).
**No endpoint ships without an explicit, enforced RBAC decision.** This skill is the
gate: when a route is added or its method/path changes, you MUST confirm the allowed
roles with the user and wire enforcement before declaring the work done.

> ⚠️ Hard constraint from `copilot-instructions.md`: *"Every endpoint uses JWT auth +
> RBAC (Casbin). `effective_role = role_code or "CUS"`."* An unguarded route is a
> defect, not a TODO.

## The gate (do this every time)

1. **STOP and ask the user** which roles may call the endpoint, framed as
   `(resource, action)` pairs. Do not guess. If the user already stated roles in the
   request, restate them for confirmation. Example prompt:
   > "Who can call `POST /bookings/{id}/cancel`? I'll map it to a `(resource, action)`.
   > Default would be `bookings:write` for CUS/CSR/OFR — confirm or override."
2. **CHECK the OpenAPI spec** in `docs/api-specs/*.yaml` — the endpoint's `security`
   block is the source of truth. The enforced roles MUST match the spec.
3. **ENFORCE in the route** with the shared dependency (see patterns below).
4. **UPDATE the policy** in
   [src/packages/core/auth/casbin/policy.csv](../../../src/packages/core/auth/casbin/policy.csv)
   if the `(role, resource, action)` triple does not already exist.
5. **TEST** both a permitted role (2xx) and a denied role (403). An endpoint without a
   403 test is not done.

## Enforcement patterns (use the shared core — never roll your own)

Casbin permission check (preferred — resource + action):

```python
from fastapi import Depends
from packages.core.auth import get_current_user, require_permission
from packages.core.auth.claims import Claims

@router.get(
    "/bookings",
    dependencies=[Depends(require_permission("bookings", "read"))],
)
async def list_bookings(user: Claims = Depends(get_current_user)):
    ...
```

Inline when you also need the validated user:

```python
@router.delete("/bookings/{booking_id}")
async def cancel_booking(
    booking_id: str,
    user: Claims = Depends(get_current_user),
    _: None = Depends(require_permission("bookings", "delete")),
):
    ...
```

Simple role allowlist (only when a Casbin resource doesn't fit):

```python
from packages.core.auth import require_role

@router.post("/admin-only")
async def admin_endpoint(user: Claims = Depends(require_role("CSR", "OFR"))):
    ...
```

> Object-level ownership (BOLA) is **separate** from RBAC. `require_permission`
> answers "may this *role* touch this *resource type*"; it does NOT verify the caller
> owns the specific record. For `/{id}` routes, also check `user.party_id` against the
> row's owner. Flag this to the user if the endpoint returns/edits a single record.

## RBAC vocabulary (must match policy.csv exactly)

**Roles** (`Claims.role_code`; customers carry `None` → falls back to `CUS`):

| Code | Role |
|------|------|
| `OFR` | Officer — internal super-role, inherits all others |
| `CSR` | Customer Service Representative |
| `FAG` | Fleet Agent (ground crew) |
| `OPR` | Drone Operator |
| `PTN` | Partner (distributor/reseller/affiliate) |
| `CUS` | Customer (end user) |

**Actions:** `read` (GET) · `write` (POST/PUT/PATCH) · `delete` (DELETE) · `admin` (privileged/destructive).

**Resources** mirror `src/apps/` names: `auth`, `profile`, `bookings`, `catalog`,
`customers`, `operators`, `workers`, `payments`, `accounting`, `notifications`,
`support`, `tracking`, `admin`.

Policy line format (append under the right role block):

```
p, <role>, <resource>, <action>
```

`OFR` inherits every role via the `g,` lines, so you rarely add explicit `OFR` rules
except `admin`-scoped ones.

## Definition of done

- [ ] User confirmed the allowed roles as `(resource, action)` pairs.
- [ ] Roles match the endpoint's `security` block in `docs/api-specs/`.
- [ ] Route enforces with `require_permission` (or `require_role`) — no unguarded route.
- [ ] `policy.csv` contains the `(role, resource, action)` triple(s).
- [ ] Ownership/BOLA check added for single-record `/{id}` routes (or explicitly N/A).
- [ ] Tests cover one permitted role (2xx) **and** one denied role (403).

## Verification

```bash
uv run pytest tests/unit/<svc>/ -v    # include the 403 denial case
make lint                             # ruff + mypy + bandit (via pre-commit)
```

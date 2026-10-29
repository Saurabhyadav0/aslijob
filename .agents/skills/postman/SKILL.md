---
name: postman
description: >
  Keeps docs/postman/DAAS_Backend.postman_collection.json in sync with the live API.
  Activate WHENEVER an HTTP endpoint is added, removed, or its method/path changes,
  AND whenever a Pydantic request/response schema (payload) is added, removed, or its
  fields change. The matching Postman request MUST be created or updated with realistic
  dummy/sample data so the collection is always current. Triggers: "new endpoint",
  "add a route", "@router.get/post/put/patch/delete", "changed the payload",
  "updated the schema", "added a field", "renamed a field", "new request body",
  "BaseModel" change on an `*In` / request schema, or any edit under
  src/apps/<svc>/routes/** or src/apps/<svc>/schemas/**.
---

# Postman Sync Skill

The Postman collection at
[docs/postman/DAAS_Backend.postman_collection.json](../../../docs/postman/DAAS_Backend.postman_collection.json)
is the manual-testing source of truth for every DAAS service. It drifts the moment a
route or a request payload changes. **This skill is the gate: any change to a route or
to a request/response Pydantic schema MUST be reflected in the collection in the same
session, with realistic dummy data.** A stale collection is a defect, not a TODO.

> Scope: only **request/response shapes and routing** matter to Postman — the method,
> path, host, headers, and the JSON body. You do NOT regenerate the whole file; you
> surgically add/update the affected request item(s) and keep the curated token-capture
> test scripts intact.

## When this fires (decision)

| Change you made | Postman action |
|---|---|
| New `@router.<verb>` route | **Add** a new request item under the owning service folder |
| Route method or path changed | **Update** the existing item's `method` + `url` (raw/host/path) |
| Route deleted | **Remove** the matching item |
| New field on a request (`*In`) schema | **Add** the field to the item's raw JSON body with a dummy value |
| Field renamed / removed / type-changed on a request schema | **Update** the raw JSON body to match exactly |
| Response schema changed only (no request change) | Update the item's `description` if it documents the response; body unchanged |

If a single PR touches several routes/schemas, update **every** affected item before
declaring done.

## Service → host variable → port (match the owning app)

The collection uses `{{<SVC>_HOST}}` variables. Put each request under the folder for
the app that owns the route (`src/apps/<svc>/`), and use that app's host variable:

| App (`src/apps/`) | Folder name in collection | Host variable | Port |
|---|---|---|---|
| `auth`          | `1. Auth`          | `{{AUTH_HOST}}`          | 3001 |
| `customers`     | `2. Customers`     | `{{CUSTOMERS_HOST}}`     | 3002 |
| `catalog`       | `3. Catalog`       | `{{CATALOG_HOST}}`       | 3003 |
| `bookings`      | `4. Bookings`      | `{{BOOKINGS_HOST}}`      | 3004 |
| `payments`      | `5. Payments`      | `{{PAYMENTS_HOST}}`      | 3005 |
| `operators`     | `6. Operators`     | `{{OPERATORS_HOST}}`     | 3006 |
| `notifications` | `7. Notifications` | `{{NOTIFICATIONS_HOST}}` | 3007 |
| `admin`         | `9. Admin`         | `{{ADMIN_HOST}}`         | 3009 |
| `accounting`    | `10. Accounting`   | `{{ACCOUNTING_HOST}}`    | 3010 |

`workers` has no HTTP surface — nothing to sync. If you add a brand-new service, add
its host variable to the top-level `variable` array and create its folder.

## Request item template (copy this shape)

Every item is `name` + `request` (+ optional `event` test script). Authenticated
routes carry the bearer header; public routes (OTP, health) do not.

```json
{
  "name": "Cancel Booking",
  "request": {
    "method": "POST",
    "header": [
      { "key": "Content-Type", "value": "application/json" },
      { "key": "Authorization", "value": "Bearer {{ACCESS_TOKEN}}" }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"reason\": \"weather_delay\",\n  \"notes\": \"Heavy rain forecast\"\n}",
      "options": { "raw": { "language": "json" } }
    },
    "url": {
      "raw": "{{BOOKINGS_HOST}}/v1/bookings/{{BOOKING_ID}}/cancel",
      "host": ["{{BOOKINGS_HOST}}"],
      "path": ["v1", "bookings", "{{BOOKING_ID}}", "cancel"]
    },
    "description": "Cancel a booking. Allowed roles: CUS/CSR/OFR (bookings:write)."
  }
}
```

Rules for the item:
- **`url` must be consistent** — `raw`, `host`, and `path` must all agree. Split the
  path on `/`; turn path params into existing collection variables
  (`{{BOOKING_ID}}`, `{{CUSTOMER_ID}}`, `{{OPERATOR_ID}}`, `{{PAYMENT_ID}}`,
  `{{DRONE_ID}}`, `{{SERVICE_ID}}`, …). If a needed id variable doesn't exist, add it
  to the top-level `variable` array with a realistic dummy (e.g. `CUST-000001`).
- **Body comes from the request (`*In`) Pydantic schema.** Include every required
  field plus commonly-used optionals. The `raw` string is escaped JSON
  (`\"`, `\n`) — `body.options.raw.language` must be `"json"`.
- **GET/DELETE** with no body: omit the `body` block. Add query params via the `url`
  if the route declares them.
- **Auth header** present iff the route uses `get_current_user` / `require_permission`
  / `require_role`. Public routes omit it.
- **Don't touch curated `event` test scripts** (e.g. the OTP-verify script that saves
  `ACCESS_TOKEN`). Preserve them when editing an item.

## Dummy data conventions (realistic, India-context)

| Field kind | Sample |
|---|---|
| phone | `+919876543210` |
| email | `test@example.com` |
| latitude / longitude | `18.5204`, `73.8567` (Pune) |
| money / amount | `1500.00` (₹, two decimals) |
| dates | ISO-8601: `"2026-06-01"` / `"2026-06-01T09:30:00Z"` |
| ids | use the collection variable (`{{BOOKING_ID}}` = `CUSTBKG-20260601-0001`) |
| enums | a real member from the schema's `StrEnum` (check `packages/core/enums`) |
| OTP | `123456` |
| device_id | `device-abc123` |

Mirror values already used elsewhere in the collection so flows chain together.

## Verify: detect drift between code and collection

Run this to list endpoints that exist in the live OpenAPI but are **missing** from the
collection (and vice-versa). Update the collection until the "missing in collection"
list is empty for the services you touched.

```bash
uv run python - <<'PY'
import importlib, json, re

APPS = ["auth","customers","catalog","bookings","payments",
        "operators","notifications","admin","accounting"]

# 1) live routes from each app's FastAPI factory
live = set()
for app in APPS:
    try:
        mod = importlib.import_module(f"src.apps.{app}.main")
        spec = mod.create_app().openapi()
    except Exception as e:  # service that needs runtime deps may skip
        print(f"  (skip {app}: {e})")
        continue
    for path, ops in spec.get("paths", {}).items():
        for verb in ops:
            if verb.lower() in {"get","post","put","patch","delete"}:
                live.add((verb.upper(), path.rstrip("/")))

# 2) routes referenced by the Postman collection
col = json.load(open("docs/postman/DAAS_Backend.postman_collection.json"))
pm = set()
def walk(items):
    for it in items:
        if "item" in it:
            walk(it["item"]); continue
        req = it.get("request")
        if not req:
            continue
        raw = (req.get("url") or {}).get("raw", "")
        m = re.search(r"\}\}(/[^?]*)", raw)
        if m:
            # normalise {{VAR}} path params to OpenAPI {param} is best-effort;
            # we compare on the templated form, so just strip query + trailing /
            pm.add((req.get("method","").upper(), m.group(1).rstrip("/")))
walk(col["item"])

missing = sorted(p for p in live if p not in pm)
print(f"\nLive endpoints: {len(live)}  |  Postman entries: {len(pm)}")
print("\nIn code but MISSING from Postman (add these):")
for v, p in missing:
    print(f"  {v:6} {p}")
PY
```

> The path comparison is best-effort: OpenAPI uses `{booking_id}` while Postman uses
> `{{BOOKING_ID}}`, so exact matches won't line up on parameterised routes. Treat the
> output as a checklist — focus on routes you changed and confirm each has a matching,
> correctly-shaped item. After editing, validate the JSON is still well-formed:

```bash
uv run python -c "import json; json.load(open('docs/postman/DAAS_Backend.postman_collection.json')); print('postman collection: valid JSON')"
```

## Definition of done

- [ ] Every added/changed/removed route has its item added/updated/removed in the
      collection, under the correct service folder + host variable.
- [ ] Every request-schema (`*In`) field change is reflected in the item's raw JSON
      body with realistic dummy data (all required fields present).
- [ ] `url.raw`, `url.host`, and `url.path` agree; path params use collection variables.
- [ ] Auth header present iff the route is authenticated; curated test scripts preserved.
- [ ] Collection still parses as valid JSON (command above).
- [ ] New id/host variables added to the top-level `variable` array if referenced.

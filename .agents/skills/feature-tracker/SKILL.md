---
name: feature-tracker
description: >
  Maintains feature.json — the AsliJob feature ledger. Activate WHENEVER
  a new feature, endpoint, screen, or unit of work is started, and whenever a
  tracked feature is dropped or no longer needed. Use to ADD a feature entry at the
  start of work, and to REMOVE an entry that is cancelled. Triggers: "track this",
  "add a feature", "new feature", "start working on", "drop this feature",
  "remove the feature", "this isn't needed anymore", or any code change that
  introduces user-visible behavior not already in feature.json.
---

# Feature Tracker Skill

You own `feature.json` at the repo root — the single source of truth for
work-in-progress. This skill defines exactly how to **add** and **remove**
entries without violating the ledger invariants.

> ⚠️ Read this before touching `feature.json`. Breaking its rules breaks the
> shared picture of what is in flight for every other contributor.

## Schema (every feature is exactly these 5 keys)

```json
{
  "id": "F12",
  "behavior": "One sentence describing the user-visible behavior, end-to-end",
  "verification": "npm run test -- rules",
  "state": "not_started",
  "evidence": ""
}
```

| Key | Rules |
|---|---|
| `id` | `F` + zero-padded sequential number (`F01`…`F10`…). Next ID = highest existing + 1. Never reuse a retired ID. |
| `behavior` | Concrete, testable, user-visible outcome. Not "add a function" — describe the behavior. |
| `verification` | A real shell command that PASSES only when the feature works (a `vitest`/`playwright` target, or `npm run lint && npm test`). This is what gates `passing`. |
| `state` | One of `not_started`, `active`, `blocked`, `passing`. |
| `evidence` | Empty until passing; set to `verified YYYY-MM-DD` when the verification command passes. |

## State machine (do not violate)

```
not_started ──▶ active ──▶ passing      (passing is irreversible)
                  └──▶ blocked ──▶ active
```

- **Only ONE feature may be `active` at a time** across the whole file.
- A feature transitions `active → passing` **only after its `verification`
  command actually passes** — run it, see it green, then flip the state and
  stamp `evidence`. Never flip `state` on a hunch.
- `passing` is **irreversible** — never downgrade or delete a passing feature.

## ADD a feature (at the start of any new work)

1. Confirm the work isn't already an entry (grep the `behavior` fields).
2. Confirm no other feature is currently `active`. If one is, finish/park it
   first — you may not open a second `active`.
3. Append a new entry with the next sequential `id`, a testable `behavior`, a
   real `verification` command, `"state": "active"`, and `"evidence": ""`.
4. Use this deterministic Python edit (preserves formatting, enforces invariants):

```bash
python3 - <<'PY'
import json, re
p = "feature.json"
data = json.load(open(p))
feats = data["features"]
assert not any(f["state"] == "active" for f in feats), \
    "A feature is already active — only one active at a time."
nums = [int(re.sub(r"\D", "", f["id"])) for f in feats]
new_id = f"F{max(nums) + 1:02d}"
feats.append({
    "id": new_id,
    "behavior": "<<one-sentence user-visible behavior>>",
    "verification": "<<shell command that passes only when it works>>",
    "state": "active",
    "evidence": "",
})
json.dump(data, open(p, "w"), indent=2); open(p, "a").write("\n")
print("Added", new_id)
PY
```

5. When the work is done, run the entry's `verification` command. If it passes,
   set `state` to `passing` and `evidence` to `verified YYYY-MM-DD`:

```bash
python3 - <<'PY'
import json, datetime
p, fid = "feature.json", "<<F-id-just-verified>>"
data = json.load(open(p))
for f in data["features"]:
    if f["id"] == fid:
        assert f["state"] != "passing", f"{fid} already passing."
        f["state"] = "passing"
        f["evidence"] = "verified " + datetime.date.today().isoformat()
        break
else:
    raise SystemExit(f"{fid} not found")
json.dump(data, open(p, "w"), indent=2); open(p, "a").write("\n")
print("Marked", fid, "passing")
PY
```

## REMOVE a feature (when it is no longer needed)

**Hard rule: you may only remove a feature whose state is `not_started`,
`active`, or `blocked`.** Never remove a `passing` feature — it is verified
history and removing it would silently rewrite the ledger.

```bash
python3 - <<'PY'
import json
p, fid = "feature.json", "<<F-id-to-remove>>"
data = json.load(open(p))
feats = data["features"]
target = next((f for f in feats if f["id"] == fid), None)
assert target is not None, f"{fid} not found"
assert target["state"] != "passing", \
    f"{fid} is passing — passing features are irreversible, refusing to remove."
data["features"] = [f for f in feats if f["id"] != fid]
json.dump(data, open(p, "w"), indent=2); open(p, "a").write("\n")
print("Removed", fid)
PY
```

> Do NOT renumber remaining features after a removal — IDs are stable references.

## Verification

After editing, confirm the file is still valid and the invariants hold:

```bash
python3 -c "import json; d=json.load(open('feature.json')); \
a=[f['id'] for f in d['features'] if f['state']=='active']; \
assert len(a)<=1, f'Too many active: {a}'; print('OK — active:', a)"
```

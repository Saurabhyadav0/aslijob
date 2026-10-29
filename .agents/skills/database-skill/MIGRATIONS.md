# Migrations (Alembic)

## Rules
1. **Forward-only**: No migration should cause destructive data loss unless explicitly requested for PII purging.
2. **Review Auto-generations**: Alembic's `--autogenerate` struggles with `Enum` changes and PostGIS. ALWAYS review the diff manually.
3. **Async Support**: Ensure your `env.py` and migration files support async execution if dealing with data migrations.

## Seed Script
When adding new core tables (like help topics, services), ensure `scripts/seed.py` is updated so local dev environments can be bootstrapped correctly.

---

## Multiple-Head Conflicts (CI Fix Protocol)

**Symptom**: CI fails with `Multiple head revisions are present for given argument 'head'`.

**Cause**: Two branches each added a migration pointing to the same `down_revision`, creating a fork. When both are merged to `main`, Alembic sees two leaf nodes (heads) with no single convergence point.

### How to detect

```bash
cd src/packages/database
python3 -c "
import re, os
revs = {}
for f in os.listdir('alembic/versions'):
    if not f.endswith('.py'): continue
    txt = open(f'alembic/versions/{f}').read()
    rev = re.search(r'^revision.*?=.*?[\"\'](.*?)[\"\']\s*$', txt, re.M)
    down = re.search(r'down_revision.*?=.*?(None|[\"\'(].*?[)\"\']+)', txt)
    if rev:
        revs[rev.group(1)] = down.group(1).strip() if down else 'None'
all_parents = set(x for v in revs.values() for x in re.findall(r'[a-z0-9_]+', v) if x not in ('None','str','tuple'))
print('HEADS:', [r for r in revs if r not in all_parents])
"
```

### How to fix

Create a merge migration by hand — **do not use `--autogenerate`**, it will try to detect schema diffs:

```python
# alembic/versions/<slug>_merge_heads.py
"""merge <branch-a> and <branch-b> heads"""
from collections.abc import Sequence
from alembic import op

revision: str = "<new_slug>"
down_revision: tuple[str, str] = ("<head_a>", "<head_b>")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
```

Name it `<milestone>_merge_<description>_heads.py` so it is easy to find.

### How to prevent

1. **Check heads before opening a PR** — add this to your pre-PR checklist:
   ```bash
   cd src/packages/database && uv run alembic heads
   ```
   If it prints more than one revision, create a merge migration before the PR is merged.

2. **CI gate (`.github/workflows/`)** — add a heads-check step before the `alembic upgrade head` step:
   ```yaml
   - name: Check single migration head
     working-directory: src/packages/database
     run: |
       HEADS=$(PYTHONPATH=$GITHUB_WORKSPACE/src uv run alembic heads 2>&1)
       COUNT=$(echo "$HEADS" | grep -c "(head)")
       if [ "$COUNT" -ne 1 ]; then
         echo "ERROR: $COUNT migration heads found — create a merge migration before merging."
         echo "$HEADS"
         exit 1
       fi
   ```
   Place this step **before** `alembic upgrade head` so the error message is actionable rather than cryptic.

3. **PR convention** — when a branch adds a migration, always rebase onto `main` and check `alembic heads` after rebase.

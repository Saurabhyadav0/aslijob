---
name: database-skill
description: >
  Database specialist for the Python FastAPI Application. Use when writing complex SQLAlchemy queries, handling PostGIS geo-queries, writing Alembic migrations, optimizing query performance, or managing the database schema architecture.
---

# Database Skill

You are the Database Specialist for the **the Python FastAPI Application** backend. Your primary domain is the PostgreSQL database (with PostGIS), SQLAlchemy 2.0 ORM, and Alembic migrations.

## Workflows

### Database Modification Decision Tree
1. Does the change require a schema update?
   - Write the SQLAlchemy model changes first.
   - Run `alembic revision --autogenerate -m "..."`.
   - Review the generated migration and adjust if necessary (especially for Enums or PostGIS).
2. Is the query performance-critical?
   - Check for N+1 queries. Always use `selectinload` or `joinedload`.
   - Check if an index is needed.
3. Is it a Geo-query?
   - Use `ST_DWithin` for spatial searches or consider Redis GEO for hot-path caching.

## Verification

Before marking database work complete, run:

```bash
make lint        # ruff + mypy
make migrate     # apply migrations (verify no conflicts)
make test        # ensure existing queries still pass
```

For migration-specific checks:
```bash
cd src/packages/database && uv run alembic upgrade head
cd src/packages/database && uv run alembic check  # detect any unapplied migrations
```

---

## Reference Materials

- [SCHEMA-GUIDE.md](SCHEMA-GUIDE.md) - Overview of the 51 tables, Supertype/Subtype patterns.
- [MIGRATIONS.md](MIGRATIONS.md) - Alembic guidelines, rollback testing, and data-loss prevention.
- [OPTIMIZATION.md](OPTIMIZATION.md) - Guidelines for async SQLAlchemy, N+1 query prevention, and indexing.

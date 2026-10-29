## 4. ID Format Conventions (Prefixed, NOT UUIDs)

Every entity uses a prefixed string ID. Always generate IDs with the correct format:

| Entity | Format | Example |
|--------|--------|---------|
| Party | `PRT-XXXXXXXXX` | PRT-000000001 |
| Person | `PER-XXXXXXXXX` | PER-000000001 |
| Organization | `ORG-XXXXXXXXX` | ORG-000000002 |
| Customer | `CUS-XXXXXXXXX` | CUS-000000010 |
| Drone Operator | `DOP-XXXXXXXXX` | DOP-000000005 |
| Field Agent | `FAG-XXXXXXXXX` | FAG-000000007 |
| Partner | `PTN-XXXXXXXXX` | PTN-000000004 |
| Employee | `EMP-XXXXXXXXX` | EMP-000000003 |
| Service | `SVC-XXXX` | SVC-0001 |
| Sub-Service | `SVC-XXX-SS-XXX` | SVC-001-SS-003 |
| Customer Booking | `CUSTBKG-YYYYMMDD-XXXX` | CUSTBKG-20260415-0012 |
| Service Booking | `SVCBKG-YYYYMMDD-XXXX` | SVCBKG-20260415-0034 |
| Asset | `AST-XXXXXXXXX` | AST-000000015 |
| Equipment | `EQP-XXXXXXXXX` | EQP-000000008 |
| Invoice | `INV-YYYYMMDD-XXXX` | INV-20260415-0001 |
| Payment | `PAY-YYYYMMDD-XXXX` | PAY-20260415-0001 |
| Refund | `RFD-XXXXXXXXX` | RFD-000000001 |
| Wallet | `WLT-XXXXXXXXX` | WLT-000000001 |
| Wallet Transaction | `WTX-XXXXXXXXX` | WTX-000000001 |
| Notification | `NTF-XXXXXXXXX` | NTF-000000001 |
| Chat Message | `MSG-XXXXXXXXX` | MSG-000000001 |
| Promotion | `PROMO-XXXX` | PROMO-0042 |
| Referral | `REF-XXXX` | REF-0099 |
| Ticket | `TCKT-XXXX` | TCKT-0123 |
| Rental Contract | `RENT-XXXX` | RENT-0010 |
| Checklist | `CHK-XXXX` | CHK-0055 |

**Rule:** Use zero-padded sequential counters (9 digits for most, 4 digits for catalog/short IDs,
date-prefixed for transactional IDs). Implement `generate_*_id()` functions in `services/shared/`.

---

## 5. Database Design Rules

- **Single PostgreSQL** instance; domain schemas separate concerns (not DB-per-service for MVP)
- **PostGIS** enabled — use `ST_DWithin`, `GEOADD` / `GEORADIUS` for geo queries; Redis GEOADD
  for hot-path proximity search
- **Supertype/subtype** pattern: `party` → `person` → `customer` / `drone_operator` / `field_agent` / `partner` / `employee`
- **Audit columns** on EVERY table: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft deletes** via `status` enum fields — no `DELETE` SQL except PII purge
- **~55 tables** defined in ERD v9 (Domain v2); see `milestones/M0-foundation.md` for full table list
- **SQLAlchemy models** use async session (`AsyncSession`), `mapped_column`, `Mapped[T]` syntax
- **Alembic**: forward-only migrations; always test rollback; auto-generate then review the diff

### Key State Machines

**Customer Order:** `Scheduled → In_Progress → Rescheduled → Completed | Cancelled | On_Hold`

**Service Order:**
```
Scheduled → (assign) → Scheduled[assigned]
         → (start)   → In_Progress
         → (complete)→ Awaiting_Acknowledgment
         → (ack)     → Completed → Paid → Operator_Paid
         → (cancel)  → Cancelled
         → (reschedule) → Rescheduled
```

**Invoice:** `Draft → Sent → Partially_Paid → Paid | Overdue → Paid | Void`

**Payment:** `Initiated → Completed → Refunded | Partial_Refund | Failed`

Always enforce state transitions — raise `UnprocessableError` on invalid transition.

---

## 6. Standard Error Schema

Every error response uses this JSON shape (defined in `00-common.yaml`):

```json
{
  "error": "RESOURCE_NOT_FOUND",
  "code": "RESOURCE_NOT_FOUND",
  "message": "Customer booking CUSTBKG-20260415-0001 not found",
  "details": [{"field": "id", "message": "Not found"}],
  "request_id": "req_01HXZ"
}
```

Custom exception classes in `services/shared/errors/`:
- `NotFoundError` → 404
- `ConflictError` → 409
- `ForbiddenError` → 403
- `UnprocessableError` → 422
- SQLAlchemy `IntegrityError` → map to 409 Conflict

FastAPI 422 from Pydantic validation is the spec standard for request body failures.

---

## 11. Development Standards & Best Practices

### Code Quality
- **Spec-first**: OpenAPI specs are the contract — backend must match exactly. Never drift.
- **Type annotations**: All functions must have full type hints; `mypy` must pass.
- **Async everywhere**: Use `async def` for all route handlers and DB operations.
- **No SELECT \***: Always use column projection in list endpoints.
- **No N+1 queries**: Use `selectinload` or `joinedload` for related entities.
- **Parameterized queries**: SQLAlchemy ORM handles this; never use raw f-string SQL.
- **No cross-app imports**: `src/apps/*` must never import from another `src/apps/*`. Shared code (utilities, clients, helpers) must live in `packages/`.

### Error Handling
- Use custom exception classes from `shared.errors` — never return raw dicts.
- Map `IntegrityError` → 409 in the global exception handler.
- Always include `request_id` in error responses.
- Log exceptions at ERROR level with full context; mask PII in logs.

### Security
- All secrets via AWS Secrets Manager — never in code or `.env` files committed to git.
- KYC docs go to `hd-kyc-{env}` bucket with SSE-KMS encryption; presigned URLs only.
- Aadhaar numbers: mask in all API responses (`XXXX-XXXX-1234` format).
- PII in logs: phone → `+91****XXXX`, email → `u***@domain.com`.
- RBAC: every secured endpoint must call `get_current_user()` and check role.
- CORS: lock to known frontend domains only.
- Webhook endpoints: validate signatures before processing; return 200 immediately.

### Testing
- **Unit tests**: ≥80% coverage; 100% on state machine transitions.
- **Integration tests**: all external API interactions (PaymentGateway, ERP, SMS_PROVIDER) use mocks.
- Test full happy-path + edge-cases: double payment, expired PaymentGateway order, wallet overdraft.
- Use `pytest` with `pytest-asyncio` for async tests.
- Use `factory_boy` or fixtures for test data; never rely on DB state between tests.

### Database Migrations
- Forward-only: no migration may lose data.
- `alembic revision --autogenerate -m "description"` → review the diff → commit.
- Test rollback of every migration in CI.
- Apply migrations before container swap in CD pipeline.

### API Conventions
- URL-based versioning: `/v1/` — breaking changes require a new version.
- Cursor-based pagination for all list endpoints: `?cursor=&limit=20&sort=created_at:desc`.
- Use `Idempotency-Key` (UUID) on all state-mutating POST/PATCH/DELETE endpoints.
- Use `If-Match` ETag for optimistic concurrency on updates.
- HTTP 201 for creates, 200 for updates, 204 for deletes with no body.
- All timestamps: store as UTC, return as UTC ISO-8601 (`2026-04-15T10:30:00Z`).

### Performance
- SQLAlchemy async pool: min 5, max 20 connections per service.
- Redis connection pool: 10 connections per service.
- Gzip middleware on responses ≥1KB.
- ETag caching: compute from `max(updated_at)`, return 304 Not Modified.
- Redis GEOADD/GEORADIUS for hot-path geo search; PostGIS for complex spatial queries.
- Partition `asset_position` table by month (high-volume tracking data).

### Logging & Observability
- JSON structured logging across all services.
- Log fields: `timestamp`, `level`, `service`, `request_id`, `party_id`, `method`, `path`,
  `status`, `duration_ms`.
- Propagate `X-Request-ID` header across all service calls and X-Ray traces.
- Sentry integration: PII scrubbing enabled, release tracking tied to Docker image tags.

### CI/CD Rules
- All PRs require lint (ruff + mypy + black --check) and tests to pass.
- No direct pushes to `main`; 1 required approval.
- Major features behind feature flags.
- Docker images built on merge to `main`; deployed via manual trigger per service.

---

## 15. Role Codes (RBAC)

| Code | Role | Description |
|------|------|-------------|
| `OFR` | Officer | Admin employee with full access |
| `CSR` | Customer Service Rep | Can manage tickets, view orders |
| `FAG` | Field Agent | Can register customers & operators, assign operators to jobs |
| `PTN` | Partner | Can register customers & operators, book services on their behalf, manage network |
| `OPR` | Drone Operator | Can manage own service orders, accept/reject jobs |
| `CUS` | Customer | Standard customer access — book services, track orders |

Always verify the role matrix against the API spec's `security` block before implementing.


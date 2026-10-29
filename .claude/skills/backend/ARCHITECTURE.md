## 1. Project Quick-Reference

| Item | Value |
|------|-------|
| **Language** | Python 3.12+ |
| **Framework** | FastAPI (async) |
| **ORM** | SQLAlchemy 2.0 async |
| **Validation** | Pydantic v2 (strict mode in M7) |
| **Database** | PostgreSQL 15 + PostGIS |
| **Cache / Pub-Sub** | Redis 7 (ElastiCache) |
| **Search** | OpenSearch |
| **Object Storage** | AWS S3 + CloudFront CDN |
| **Compute** | ECS Fargate — 10 microservices |
| **Queue** | AWS SQS (with DLQ, maxReceiveCount=3) |
| **Scheduler** | AWS EventBridge |
| **Migrations** | Alembic (forward-only, no data-loss) |
| **Lint / Format** | ruff + mypy + black (pre-commit hooks) |
| **CI/CD** | GitHub Actions |
| **Observability** | CloudWatch + X-Ray + Sentry |
| **Secrets** | AWS Secrets Manager (never in code or .env) |
| **Base URL** | `https://api.example.com/v1` |
| **Total endpoints** | 100+ across API specs |

---

## 2. Repository Layout

```
project_root/
├── .agents/skills/backend-skill/   ← you are here
├── services/
│   ├── shared/                   ← imported by every service (ALWAYS check here first)
│   │   ├── auth/                 # JWT decode, RBAC, get_current_user, @require_role
│   │   ├── config/               # Pydantic BaseSettings — all env vars
│   │   ├── db/                   # SQLAlchemy async engine, Base, session factory
│   │   ├── errors/               # Error schema, exception handlers, custom exceptions
│   │   ├── events/               # SQS publish_message helper
│   │   ├── pagination/           # Cursor-based keyset pagination
│   │   └── s3/                   # generate_presigned_put / generate_presigned_get
│   ├── auth/          :3001      # 01-auth.yaml — OTP, JWT, device mgmt
│   ├── persons/       :3002      # 02-customers.yaml — unified registration, customers, partners, field agents
│   ├── catalog/       :3003      # 03-catalog.yaml — services, sub-services, promotions, referrals
│   ├── orders/        :3004      # 04-orders.yaml — orders, checklists, tracking
│   ├── payments/      :3005      # 05-payments.yaml — invoices, razorpay, wallet, payouts
│   ├── operators/     :3006      # 06-operators.yaml — drone operator profiles, drones, equipment
│   ├── notifications/ :3007      # 08-notifications.yaml — push, SMS, email
│   ├── support/       :3008      # 07-support.yaml — tickets, FAQs
│   ├── admin/         :3009      # 09-admin.yaml — dashboard, field agents, partners, employees, orgs
│   └── accounting/    :3010      # 10-accounting.yaml — Zoho Books sync
├── websockets/        :3011      # SSE/WebSocket real-time connections
├── workers/
│   ├── notification_worker/      # SQS consumer for push/SMS/email
│   ├── webhook_worker/           # Third-party webhook SQS consumer
│   ├── periodic_worker/          # Weekly cron jobs (EventBridge)
│   └── external_sync_worker/     # Third-party ERP sync (EventBridge)
├── migrations/                   # Alembic — single shared PostgreSQL DB
├── api-specs/                    # OpenAPI 3.0.3 source-of-truth specs (00-10)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                      # seed.py, migration helpers
├── docker-compose.yml            # Postgres+PostGIS, Redis, LocalStack, OpenSearch
├── Dockerfile                    # Multi-stage: build → slim runtime
└── pyproject.toml
```

---

## 14. Infrastructure Notes (AWS)

- **ECS Fargate**: 14 services total (10 microservices + 4 workers); start at 0.5 vCPU / 1GB
- **ALB routing**: path-based (see M7 for full routing table)
- **RDS**: PostgreSQL 15, Multi-AZ, db.r6g.large, 100GB, automated backups 7 days
- **ElastiCache**: Redis 7, cache.r6g.large, 2 replicas
- **S3 Buckets**: `app-media-{env}`, `app-docs-{env}`, `app-exports-{env}`
- **SQS Queues**: `app-notifications-{env}`, `app-webhooks-{env}`, `app-sync-{env}` (all with DLQ)
- **EventBridge Rules**: scheduled crons, timeout events, cleanup jobs
- **Secrets Manager**: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `THIRD_PARTY_API_KEY_*`, `FCM_SERVICE_ACCOUNT`

### Local Dev (docker-compose.yml)
```bash
make dev      # start postgres+postgis, redis, localstack, opensearch
make migrate  # alembic upgrade head
make seed     # populate test data
make test     # pytest
make lint     # ruff + mypy
```

---


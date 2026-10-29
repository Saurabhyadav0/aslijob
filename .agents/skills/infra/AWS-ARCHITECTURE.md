# AWS Architecture

- **ECS Fargate**: 10 Microservices + 4 Workers.
- **RDS**: PostgreSQL 15 Multi-AZ (db.r6g.large).
- **ElastiCache**: Redis 7 (cache.r6g.large).
- **SQS**: Notification, Webhook, and ERP sync queues. All MUST have DLQs.
- **S3**: Media, KYC, Invoices buckets.
- **EventBridge**: Cron schedules for weekly payouts and ERP batch sync.
- **Lambda `hdsl-db-seed-reference-data-{env}`**: intentional, ongoing tool
  (not a one-off) for promoting reference/pricing/localization data
  (`industry`, `service`, `sub_service`, pricing configs, `casbin_rule`,
  translations, etc. — see the `TABLES` allowlist in
  `packages/database/seed_reference_data_lambda_handler.py`) from dev into
  prod. Insert-only: SELECTs from dev, INSERTs into prod with
  `ON CONFLICT DO NOTHING`, never UPDATEs/DELETEs, never writes to dev.
  Run `mode: "diff"` first to see what would change before running the
  default (write) mode — dev is not guaranteed to be free of test data, so
  don't sync blind.

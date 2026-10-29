## 3. AWS Infrastructure Security Checks

### IAM Least Privilege
```
[ ] ECS Task Execution Role: only ECR pull + CloudWatch logs + specific Secret ARNs
[ ] ECS Task Role (app): only S3 buckets it owns, specific SQS queues, specific Secrets
[ ] No wildcard "*" actions or resources in task policies
[ ] No AdminAccess or PowerUserAccess on task roles
[ ] RDS: app user has SELECT/INSERT/UPDATE/DELETE only — no DDL, no superuser
```

### Network Isolation
```
[ ] ElastiCache in private subnet — no public access
[ ] RDS in private subnet — no public access
[ ] Security group: ECS → Redis port 6379 only (not 0.0.0.0/0)
[ ] Security group: ECS → RDS port 5432 only from ECS SG
[ ] ALB → ECS only (not direct ECS task public IP)
[ ] GuardDuty enabled for ECS runtime monitoring
```

### Redis / ElastiCache
```
[ ] AUTH token enabled (stored in Secrets Manager)
[ ] TLS in transit: rediss:// connection string, not redis://
[ ] Encryption at rest with KMS CMK
[ ] Redis RBAC: app user has GET/SET/DEL only — not CONFIG/FLUSHALL/EVAL
[ ] Session keys: prefix with user ID (e.g., session:{party_id}:{device_id})
[ ] Idempotency keys: prefix to avoid collision (idempotency:{key_uuid})
[ ] No sensitive data cached in plaintext (only serialized, non-PII data)
```

### S3 Bucket Security
```
[ ] Block Public Access: ON for all 4 buckets
[ ] hd-kyc-{env}: SSE-KMS encryption mandatory
[ ] hd-invoices-{env}: SSE-S3 minimum
[ ] Presigned URL expiry: KYC = 15 min, invoices = 1 hour, media = 24 hours
[ ] Bucket policy: deny s3:GetObject without VPC endpoint condition
[ ] No wildcard CORS on buckets
[ ] Versioning enabled on hd-kyc-{env} and hd-invoices-{env}
```

### Secrets Management
```
[ ] All secrets in AWS Secrets Manager — never in:
    - Source code
    - Docker image
    - Environment variables in task definition plaintext
    - .env files committed to git
[ ] .gitignore includes: .env, *.env, creds, secrets.json
[ ] Rotation: JWT_SECRET rotation with dual-key window
[ ] Rotation: RDS credentials via Secrets Manager Lambda rotation
```

---

## 5. DPDPA 2023 Compliance Checklist

India's **Digital Personal Data Protection Act (DPDPA) 2023** + **Rules 2025** apply to this platform.

```
[ ] Consent: Collect only data necessary for stated purpose (data minimization)
[ ] Aadhaar: Mask first 8 digits before any processing or storage (Aadhaar Act + DPDPA)
[ ] Encryption at rest: AES-256 for Aadhaar, PAN, phone, email columns
[ ] Encryption in transit: TLS 1.2+ enforced everywhere (DB, Redis, S3, external APIs)
[ ] Access control: RBAC enforced; PII access restricted to need-to-know roles
[ ] Audit trail: All PII reads logged to audit_log (actor, entity, timestamp, action)
[ ] Breach notification: Plan documented — notify DPBI + affected users within 72 hours
[ ] Data retention: PII deleted on account closure request (DPDPA right to erasure)
[ ] PII purge endpoint: Admin-only, audit-logged, hard delete only PII columns
[ ] No PII in logs: Phone, email, Aadhaar, PAN never appear in CloudWatch/Sentry
[ ] Data Principal rights: Implement endpoints for data access + deletion requests
```

---

## 6. Payment-Specific Security

### Double-Spend / Race Condition Prevention
```python
# ✅ Use SELECT FOR UPDATE to prevent concurrent payment on same invoice
async with db.begin():
    invoice = await db.execute(
        select(Invoice).where(Invoice.invoice_id == invoice_id)
        .with_for_update()
    )
    if invoice.status in ("Paid", "Void"):
        raise ConflictError("Invoice already paid or voided")
    # proceed with payment
```

### Refund Guardrails
```
[ ] refund.amount <= payment.amount (can't refund more than paid)
[ ] Only PaymentGateway payments can use PaymentGateway refund API
[ ] Offline payments get manual refund record (no API call)
[ ] Refund status updated only via webhook — not via client response
[ ] Partial refund tracking: sum(refunds) <= original payment amount
```

### Wallet Security
```
[ ] Balance never goes negative (check before debit, use db transaction)
[ ] Wallet auto-created on first credit — not on registration (prevents empty wallet attacks)
[ ] Wallet transactions are immutable (no UPDATE — INSERT credit/debit records only)
[ ] Wallet balance = SUM(transactions) — recomputable for audit
```

---


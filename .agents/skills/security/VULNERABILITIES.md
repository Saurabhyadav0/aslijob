## 1. Vulnerability Taxonomy (Priority Order)

### CRITICAL — Fix Before Any Production Traffic

| ID | Vulnerability | Where It Hits in Project |
|----|--------------|----------------------|
| C1 | **BOLA / IDOR** | Payment, order, invoice endpoints |
| C2 | **JWT algorithm confusion / `none` attack** | Auth service, all services |
| C3 | **PaymentGateway webhook without signature verify** | `POST /payments/payment_gateway/webhook` |
| C4 | **Aadhaar/PAN exposed in API responses or logs** | Customers, operators endpoints |
| C5 | **Secrets in code or committed `.env`** | Any service config |
| C6 | **Unauthenticated Redis** | ElastiCache → lateral movement / RCE |
| C7 | **SQL injection via raw f-string queries** | Any service using SQLAlchemy |
| C8 | **Mass assignment via dict unpacking** | Any PATCH/POST endpoint |

### HIGH — Fix Before Launch

| ID | Vulnerability | Where It Hits in Project |
|----|--------------|----------------------|
| H1 | **Missing object ownership check (horizontal privilege escalation)** | Orders, payments, wallet |
| H2 | **Broken Function Level Auth (BFLA)** | Admin endpoints, payable approval |
| H3 | **No idempotency → double payment** | PaymentGateway create-order, offline payment |
| H4 | **SSRF via geocoding/presigned URL inputs** | Catalog service, S3 helper |
| H5 | **Replay attack on PaymentGateway webhook** | Webhook handler |
| H6 | **OTP brute force** | `POST /auth/otp/send`, `/auth/otp/verify` |
| H7 | **Insecure direct S3 key construction** | KYC uploads, service images |
| H8 | **`/docs` and `/redoc` exposed in production** | All FastAPI services |
| H9 | **PII in structured logs** | All services |
| H10 | **PostgreSQL superuser app credentials** | DB connection string |

### MEDIUM

| ID | Vulnerability |
|----|--------------|
| M1 | Missing `If-Match` ETag check → race condition on state transitions |
| M2 | Overly broad CORS (`allow_origins=["*"]`) |
| M3 | No request size limit → DoS via large payload |
| M4 | Dependency CVEs (`pip-audit` not in CI) |
| M5 | ReDoS in custom regex validators |
| M6 | EventBridge payment timeout acting on already-paid orders |
| M7 | JWT long expiry without refresh token rotation |
| M8 | ERP OAuth tokens stored in env instead of Secrets Manager |
| M9 | Redis session data not encrypted at rest |
| M10 | Missing audit log for PII access |

---

## 4. OWASP API Top 10 (2023) — Project Mapping

| OWASP ID | Name | Project Specific Risk | Check |
|----------|------|------------------|-------|
| API1 | BOLA | Customer accessing another customer's invoice/order/wallet | Ownership check on every ID lookup |
| API2 | Broken Authentication | JWT `none` alg, no expiry, weak secret | Pin algorithm, short expiry, strong secret |
| API3 | Broken Object Property Level Auth | Mass assignment on customer PATCH | Explicit field mapping only |
| API4 | Unrestricted Resource Consumption | OTP flood, payment spam, large file upload | Per-endpoint rate limits, 10MB body limit |
| API5 | BFLA | Customer calling `/payables/{id}/approve` | Role check on every admin endpoint |
| API6 | Unrestricted Sensitive Business Flows | Automated order placement, wallet drain | Step-up auth for large transactions |
| API7 | SSRF | Geocoding URL, S3 key, presigned URL inputs | Whitelist domains; reject private IP ranges |
| API8 | Security Misconfiguration | `/docs` in prod, debug=True, weak CORS | Harden FastAPI; lock CORS to known domains |
| API9 | Improper Inventory Management | Unused test endpoints left active | Audit endpoint list; no `/test/*` in prod |
| API10 | Unsafe API Consumption | ERP/PaymentGateway responses trusted blindly | Validate and sanitize all third-party data |

---

## 9. Known CVEs Relevant to This Stack

| CVE | Package | Severity | Fix |
|-----|---------|----------|-----|
| CVE-2024-33663 | `python-jose` | HIGH | Switch to `PyJWT >= 2.8.0` |
| CVE-2024-24762 | `python-multipart` | HIGH | Upgrade to >= 0.0.7 |
| CVE-2023-29159 | `starlette` | MEDIUM | Upgrade to >= 0.27.0 |
| CVE-2024-47081 | `requests` | MEDIUM | Upgrade to >= 2.32.3 |

**Run `pip-audit` before every release.** Pin versions in `pyproject.toml`, not open ranges.


## 2. How to Audit Code — Checklist Per Review

When reviewing any code, run through these checks in order:

### A. Authentication & JWT
```
[ ] jwt.decode() called with explicit algorithms=["HS256"] — never algorithms=None
[ ] "none" algorithm explicitly rejected
[ ] No jku/x5u/jwk header fields accepted
[ ] JWT_SECRET loaded from Secrets Manager, not os.environ or .env
[ ] Token expiry ≤ 1 hour; refresh token implemented separately
[ ] PyJWT version ≥ 2.8.0 (CVE-2024-33663 patched in python-jose; switch to PyJWT)
```

**Vulnerable pattern:**
```python
# ❌ CRITICAL — accepts alg:none and algorithm confusion
payload = jwt.decode(token, key, options={"verify_signature": False})
payload = jwt.decode(token, key)  # no algorithms param
```

**Secure pattern:**
```python
# ✅
payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
```

### B. Authorization — BOLA / IDOR (Most Common Project Risk)
```
[ ] Every resource fetch checks current_user owns the resource
[ ] Prefixed IDs (CUSTBKG-, INV-, PAY-) don't prevent BOLA — still need ownership check
[ ] Invoice endpoint: verify invoice.customer_id == current_user.person_id
[ ] Payment endpoint: verify payment.invoice.customer_id == current_user.person_id
[ ] Wallet: verify wallet.customer_id == current_user.person_id
[ ] Service booking: verify operator_id OR customer_id matches current_user
[ ] Admin-only resources: verify role_code in ["OFR", "CSR"] before returning
```

**Vulnerable pattern:**
```python
# ❌ HIGH — no ownership check
@router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    return await db.get(Invoice, invoice_id)
```

**Secure pattern:**
```python
# ✅
@router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, user: Claims = Depends(get_current_user),
                      db: AsyncSession = Depends(get_db)):
    invoice = await db.get(Invoice, invoice_id)
    if not invoice:
        raise NotFoundError("Invoice", invoice_id)
    if user.role_code not in ("OFR", "CSR") and invoice.customer_id != user.person_id:
        raise ForbiddenError("Access denied")
    return invoice
```

### C. PaymentGateway Webhook Security
```
[ ] Raw request body used for HMAC — never parsed JSON
[ ] X-PaymentGateway-Signature header verified with HMAC-SHA256
[ ] x-payment_gateway-event-id stored in Redis/DB to prevent replay
[ ] Endpoint returns 200 immediately, queues to SQS — never processes inline
[ ] PAYMENT_GATEWAY_WEBHOOK_SECRET from Secrets Manager only
[ ] Webhook route has NO BearerAuth dependency
```

**Secure implementation:**
```python
# ✅
@router.post("/payments/payment_gateway/webhook", include_in_schema=False)
async def payment_gateway_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("X-PaymentGateway-Signature", "")
    event_id = request.headers.get("x-payment_gateway-event-id", "")

    # 1. Verify HMAC
    expected = hmac.new(
        settings.PAYMENT_GATEWAY_WEBHOOK_SECRET.encode(),
        raw_body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 2. Idempotency — check event_id in Redis (24h TTL)
    if await redis.get(f"rzp_event:{event_id}"):
        return {"status": "duplicate"}
    await redis.setex(f"rzp_event:{event_id}", 86400, "1")

    # 3. Queue to SQS — return immediately
    await publish_message("hd-webhooks-dev", json.loads(raw_body))
    return {"status": "queued"}
```

### D. PII Handling (DPDPA 2023 + Aadhaar Act)
```
[ ] Aadhaar: mask first 8 digits in ALL responses → "XXXX-XXXX-1234"
[ ] PAN: never returned in full in list endpoints
[ ] Phone in logs: +91****XXXX format
[ ] Email in logs: u***@domain.com format
[ ] KYC documents: S3 bucket hd-kyc-{env} with SSE-KMS, no public access
[ ] Presigned KYC URLs: 15 min expiry max (not default 3600)
[ ] aadhar_number column: AES-256 encrypted at application level before DB insert
[ ] PII reads logged to audit_log table (DPDPA accountability requirement)
[ ] Data breach notification plan documented (notify DPBI + affected users)
```

**PII masking helpers:**
```python
def mask_aadhaar(number: str) -> str:
    # DPDPA + Aadhaar Act: mask first 8 of 12 digits
    digits = number.replace("-", "").replace(" ", "")
    return f"XXXX-XXXX-{digits[-4:]}"

def mask_phone(phone: str) -> str:
    return f"+91****{phone[-4:]}"

def mask_email(email: str) -> str:
    local, domain = email.split("@", 1)
    return f"{local[0]}***@{domain}"
```

### E. Mass Assignment
```
[ ] Never: Customer(**request.dict()) or setattr in a loop from raw input
[ ] Always: explicitly map allowed fields in service layer
[ ] Pydantic response models used on all endpoints (no ORM model returned directly)
[ ] Sensitive fields (password_hash, internal flags) absent from response schemas
```

**Vulnerable pattern:**
```python
# ❌ CRITICAL — mass assignment
customer = Customer(**body.dict())
```

**Secure pattern:**
```python
# ✅ — explicit field mapping
customer = Customer(
    full_name=body.full_name,
    phone=body.phone,
    email=body.email,
    entity_type=body.entity_type,
)
```

### F. SQL Injection
```
[ ] No f-string SQL: f"SELECT * FROM orders WHERE id = {order_id}"
[ ] No string.format() in query construction
[ ] Raw SQL only via SQLAlchemy text() with bindparams
[ ] ORM used for all CRUD; raw SQL only for complex aggregations
```

**Vulnerable:**
```python
# ❌ SQL injection
result = await db.execute(f"SELECT * FROM customer WHERE phone = '{phone}'")
```

**Secure:**
```python
# ✅
result = await db.execute(
    text("SELECT * FROM customer WHERE phone = :phone"),
    {"phone": phone}
)
```

### G. Rate Limiting (Per Endpoint Tiers)
```
[ ] OTP send:         3 req/min per phone number
[ ] OTP verify:       5 attempts, then 15-min lockout
[ ] Login:            10 req/min per IP
[ ] Payment create:   10 req/min per customer
[ ] Webhook:          No limit (PaymentGateway IPs) — validate by signature only
[ ] General API:      100 req/min per authenticated user
[ ] Unauthenticated:  20 req/min per IP
```

**Implementation (Redis sliding window):**
```python
async def rate_limit(key: str, limit: int, window_seconds: int, redis: Redis):
    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, window_seconds)
    if current > limit:
        raise HTTPException(status_code=429,
            headers={"Retry-After": str(window_seconds)},
            detail={"error": "RATE_LIMIT_EXCEEDED", "code": "RATE_LIMIT_EXCEEDED",
                    "message": f"Too many requests — retry after {window_seconds}s"})
```

### H. FastAPI Production Hardening
```
[ ] app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)  # in production
[ ] DEBUG mode: never True in production (check settings.ENVIRONMENT)
[ ] Error responses: generic messages, no stack traces, no internal paths
[ ] Request size limit middleware: 10MB max body, 1MB for JSON
[ ] Gzip middleware: min_size=1024
[ ] Trusted hosts middleware if behind ALB
[ ] HTTPS enforced: HSTS header via CloudFront
[ ] Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy
```

```python
# ✅ Production FastAPI setup
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI(
    docs_url=None if settings.ENVIRONMENT == "production" else "/docs",
    redoc_url=None if settings.ENVIRONMENT == "production" else "/redoc",
    openapi_url=None if settings.ENVIRONMENT == "production" else "/openapi.json",
)
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["api.example.com"])

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

---


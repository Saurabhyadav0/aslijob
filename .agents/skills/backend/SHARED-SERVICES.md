## 7. Shared Library — Always Use, Never Reinvent

Before writing any new utility, **check `services/shared/` first**.

### Auth (`services/shared/auth/`)
```python
from shared.auth import get_current_user, require_role

# JWT claims: {party_id, party_type, person_id, role_code}
@router.get("/resource")
async def get_resource(user: Claims = Depends(get_current_user)):
    ...

@router.delete("/resource/{id}")
@require_role("admin", "csr")
async def delete_resource(...):
    ...
```

### Pagination (`services/shared/pagination/`)
```python
from shared.pagination import paginate, PaginationParams

# Returns {"data": [...], "pagination": {"next_cursor": "...", "has_more": true, "total_count": n}}
# Query params: ?cursor=&limit=20&sort=created_at:desc
```

### S3 (`services/shared/s3/`)
```python
from shared.s3 import generate_presigned_put, generate_presigned_get

url = await generate_presigned_put(bucket="hd-media-dev", key="images/img.jpg",
                                    content_type="image/jpeg", expires=3600)
```

### SQS (`services/shared/events/`)
```python
from shared.events import publish_message

await publish_message(queue_name="hd-notifications-dev",
                       payload={"type": "ORDER_PLACED", "party_id": "PRT-xxx"},
                       dedup_id=order_id)
```

### Request ID Middleware
Every service attaches a `X-Request-ID` header. Include `request_id` in all error responses and logs.

### Idempotency Middleware
Redis-backed: stores `Idempotency-Key → response` for 24h. All POST/PATCH/DELETE endpoints that
mutate state MUST include the `Idempotency-Key` header (UUID format). Check spec for which
endpoints require it.

### ETag / If-Match
Optimistic concurrency control using `updated_at` as ETag. Reject stale writes with 412.

---

## 9. External Integrations — Quick Reference

### SMS_PROVIDER (SMS/OTP) — M1
- Used for OTP delivery in auth service
- Config: `SMS_PROVIDER_API_KEY`, `SMS_PROVIDER_TEMPLATE_ID`
- Rate-limit OTP send: 3/min per phone number

### PaymentGateway (Payments) — M4
- Config: `PAYMENT_GATEWAY_KEY_ID`, `PAYMENT_GATEWAY_KEY_SECRET`, `PAYMENT_GATEWAY_WEBHOOK_SECRET`
- Flow: `create-order` → client checkout → `verify` (HMAC-SHA256) → webhook (source of truth)
- Webhook endpoint: unauthenticated, verified by signature, returns 200 immediately → queues to SQS
- Idempotent processing: check `payment_gateway_payment_id` before updating state
- Webhook SQS consumer: DLQ after 3 attempts

### Google Maps (Geocoding) — M3
- Config: `GOOGLE_MAPS_API_KEY`
- Used in catalog service for operator geo-search

### Firebase FCM (Push Notifications) — M5
- Config: via Firebase service account JSON in Secrets Manager
- Publish via notification_worker SQS consumer

### AWS SES (Email) — M5
- Config: `SES_SENDER_EMAIL`, `SES_REGION`
- Send via notification_worker

### VoIP_Provider (Masked Calls) — M5
- Config: `VOIP_PROVIDER_API_KEY`, `VOIP_PROVIDER_API_TOKEN`, `VOIP_PROVIDER_SID`
- Used in orders service for customer ↔ operator masked calls

### ERP System (Accounting) — M6
- Config: `ERP_CLIENT_ID`, `ERP_CLIENT_SECRET`, `ERP_REFRESH_TOKEN`, `ERP_ORG_ID`
- Rate limit: 150 req/min — batch sync, queue with backoff, off-peak scheduling
- Sync via erp_sync_worker EventBridge handler

---

## 10. GST Calculation (India-specific)

```python
BUSINESS_STATE = "AP"  # Andhra Pradesh — registered state

def calculate_gst(amount: float, place_of_supply: str) -> dict:
    if place_of_supply == BUSINESS_STATE:
        cgst = amount * 0.09   # 9% CGST
        sgst = amount * 0.09   # 9% SGST
        return {"cgst": cgst, "sgst": sgst, "igst": 0.0, "total_tax": cgst + sgst}
    else:
        igst = amount * 0.18   # 18% IGST
        return {"cgst": 0.0, "sgst": 0.0, "igst": igst, "total_tax": igst}
```

Place of supply = customer's state from their address. Always store `place_of_supply` on the invoice.

---

## 13. Common Gotchas & Known Patterns

- **ERP rate limit**: 150 req/min — always batch and queue; never call inline.
- **PaymentGateway webhook is source of truth** — client-side `verify` can arrive before webhook;
  reconcile both; webhook wins on conflict.
- **PostGIS vs Redis Geo**: Use Redis GEOADD for real-time operator proximity search (< 2ms);
  use PostGIS for complex polygon/buffer queries.
- **EventBridge deduplication**: Payment timeout rule targets service order ID — always check
  current status before acting (order may already be paid).
- **Multi-timezone**: Store all times as UTC; include customer timezone in response for display.
- **PII purge**: Hard delete only for GDPR/DPDPA purge requests — implement as admin-only
  endpoint with audit log entry before deletion.
- **SSE connection limits**: Redis pub/sub decouples tracking; ECS horizontal scaling handles load.
  WebSocket fallback available if SSE blocked by proxies.
- **Idempotency-Key store**: Redis with 24h TTL; key = UUID from request header;
  value = serialized response. On duplicate: return cached response with 200 (not 201).

---


## 3. OpenAPI Specs — Source of Truth

The API spec files in `api-specs/` are the **contract**. Backend code MUST match them exactly.

| Spec File | Service | Port | Endpoints |
|-----------|---------|------|-----------|
| `00-common.yaml` | Shared schemas, errors, pagination | — | — |
| `01-auth.yaml` | Auth service | 3001 | 9 |
| `02-customers.yaml` | Persons service (unified registration, customers, partners) | 3002 | ~20 |
| `03-catalog.yaml` | Catalog service | 3003 | ~20 |
| `04-orders.yaml` | Orders service | 3004 | 26 |
| `05-payments.yaml` | Payments service | 3005 | 24 |
| `06-operators.yaml` | Operators service | 3006 | ~44 |
| `07-support.yaml` | Support service | 3008 | — |
| `08-notifications.yaml` | Notifications service | 3007 | — |
| `09-admin.yaml` | Admin service (dashboard, employees, field agents, partners) | 3009 | ~55 |
| `10-accounting.yaml` | Accounting service | 3010 | — |

**Before implementing any endpoint**, read the corresponding spec to confirm:
- Request body schema, query params, path params
- Response schema and HTTP status codes (200/201/204/400/404/409/422)
- Required headers (`Idempotency-Key`, `If-Match`, `If-None-Match`)
- Security requirements (BearerAuth + role)

---

## 8. Milestone Reference

| Milestone | Status | Key Deliverables |
|-----------|--------|-----------------|
| **M0** Foundation | — | Dev env, shared lib, ~55-table DB schema, CI/CD |
| **M1** Auth & Identity | — | OTP (MSG91), JWT, device management (9 endpoints) |
| **M2** Persons, Customers, Field Agents & Partners | — | Unified registration (POST /persons/me/register), KYC, partner network (20 endpoints) |
| **M3** Catalog & Drone Operators | — | Services, drone operators, drones, equipment, geo-search (44 endpoints) |
| **M4** Orders & Payments | — | Full order lifecycle, Razorpay, invoices, wallet, partial payment (50 endpoints) |
| **M5** Tracking, Notifications & Support | — | SSE tracking, push/SMS/email, tickets, pre-job checklist, reschedule approval (33 endpoints) |
| **M6** Admin & Accounting | — | Dashboard, analytics, field agent/partner mgmt, Zoho Books sync (55 endpoints) |
| **M7** Hardening | — | Security, performance, observability, load testing |

When implementing, always check the corresponding `milestones/M{N}-*.md` file for:
- Exact endpoint list and task breakdown
- State machine diagrams
- Implementation details (GST logic, PaymentGateway flow, etc.)
- Tables involved
- Exit criteria

---


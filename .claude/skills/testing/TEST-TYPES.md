# Test Types

## Unit Tests
- Fast, no DB interaction if possible.
- Focus on State Machine transitions (e.g., verifying a `ServiceOrder` cannot go from `Scheduled` directly to `Completed`).

## Integration Tests
- Uses a test database.
- Uses `AsyncClient` from `httpx`.
- Verifies endpoints, pagination, and RBAC (Role-Based Access Control).

## Load Tests
- Use `locust`.
- Scripts located in `tests/load/locustfile.py`.
- Focus on read-heavy catalog endpoints and the real-time SSE tracking endpoints.

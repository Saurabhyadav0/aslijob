# Optimization Strategies

## Async SQLAlchemy 2.0
We use `AsyncSession` everywhere.
- `await db.execute(...)`
- `await db.scalars(...)`

## N+1 Query Prevention
- If you return a model and its relationships, use `selectinload` (best for async collections) or `joinedload` (best for many-to-one).
- Example: `select(CustomerOrder).options(selectinload(CustomerOrder.service_orders))`

## Connections
- Connection pool limits: Min 5, Max 20 per microservice. Avoid holding the `db` session across long external API calls (like waiting for PaymentGateway or ERP).

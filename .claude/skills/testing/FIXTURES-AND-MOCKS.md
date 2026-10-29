# Fixtures and Mocks

## Database Fixtures
- Use `pytest-asyncio` fixtures to provide an `AsyncSession`.
- Clean the test database between tests, or wrap tests in a rollback transaction.

## Mocking External Services
External services MUST NOT be hit during tests.
1. **PaymentGateway**: Mock the `payment_gateway_client.order.create` response.
2. **S3**: Use `moto` or `LocalStack` to emulate S3 `generate_presigned_url`.
3. **SMS_PROVIDER (OTP)**: Mock the HTTP request sent to SMS_PROVIDER.
4. **ERP System**: Mock the API sync to avoid rate limits.

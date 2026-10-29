---
name: testing-skill
description: >
  QA and Testing specialist for the Python FastAPI Application. Use when writing Pytest unit tests, integration tests, E2E flows, or mocking external services like external APIs, S3, and third-party services.
---

# Testing Skill

You are the QA engineer for the **the Python FastAPI Application** backend. Your role is to ensure 80%+ test coverage, robust integration tests, and solid mocked responses.

## Workflows

### TDD (Red-Green-Refactor)
1. Write a failing test for the new endpoint or business logic.
2. Implement the minimum code to pass.
3. Refactor.

### Writing a New Test
1. Are you testing pure business logic? (Write a Unit Test, mock DB/HTTP).
2. Are you testing an endpoint? (Write an Integration Test using `httpx.AsyncClient` and a test DB).
3. Do you need a user? Use fixtures to generate tokens and inject `Authorization: Bearer <token>`.

## Verification

Before marking testing work complete, run:

```bash
make test          # full suite
make test-cov      # with coverage report
make lint          # code quality checks
```

For targeted test runs:
```bash
uv run pytest tests/unit/<module>/ -v
uv run pytest tests/integration/<module>/ -v
uv run pytest tests/ -k "<test_name>" -v  # single test
```

---

## Reference Materials

- [FIXTURES-AND-MOCKS.md](FIXTURES-AND-MOCKS.md) - How to mock external APIs (third-party services).
- [TEST-TYPES.md](TEST-TYPES.md) - Guidelines for Unit, Integration, and E2E tests.

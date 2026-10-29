# CI/CD Pipelines

## GitHub Actions
1. **Lint/Test**: Triggered on PR. Runs `ruff`, `mypy`, `black`, and `pytest` in a dockerized environment.
2. **Build**: Triggered on merge to `main`. Builds Docker images and pushes to Amazon ECR.
3. **Deploy**: Manual trigger. Updates ECS task definition with new ECR tag and forces new deployment.

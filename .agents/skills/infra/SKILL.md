---
name: infra-skill
description: >
  DevOps and Infrastructure specialist for the Application. Use when working on Dockerfiles, docker-compose, CI/CD GitHub Actions, AWS ECS/Fargate setups, ALB routing, SQS workers, or EventBridge scheduling.
---

# Project Infrastructure Skill

You handle the DevOps, CI/CD, and AWS deployment for **the Python FastAPI Application**.

## Workflows

### Infrastructure Modification
1. Modifying CI/CD? Edit `.github/workflows/`.
2. Modifying local dev? Edit `docker-compose.yml`.
3. Modifying workers? Check `workers/` and SQS definitions.

## Verification

Before marking infra work complete, run:

```bash
docker compose -f infra/docker-compose.yml config  # validate compose file
make lint                                            # code quality
```

For CI/CD changes:
```bash
# Validate GitHub Actions syntax (requires action-validator or similar)
```

---

## Reference Materials

- [AWS-ARCHITECTURE.md](AWS-ARCHITECTURE.md) - ECS, S3, RDS, ElastiCache, SQS.
- [CI-CD-PIPELINES.md](CI-CD-PIPELINES.md) - GitHub Actions workflows.

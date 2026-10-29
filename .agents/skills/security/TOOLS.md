## 7. Automated Security Tools to Run

Add these to CI/CD pipeline:

```bash
# Dependency vulnerabilities
pip-audit --strict                        # Fails CI on any known CVE

# Static analysis
bandit -r services/ -ll                   # Python security linter
semgrep --config=p/owasp-top-ten .        # OWASP pattern detection

# Secrets scanning
trufflehog git file://. --only-verified   # Detect committed secrets
git-secrets --scan                        # Pre-commit hook

# DAST (run against staging)
zap-baseline.py -t https://staging-api.example.com

# Load + security
locust -f tests/load/locustfile.py        # Rate limit validation
```

**Add to `pyproject.toml`:**
```toml
[tool.bandit]
exclude_dirs = ["tests"]
severity_level = "medium"

[tool.pip-audit]
# Fail on medium+ severity
severity = "medium"
```

---


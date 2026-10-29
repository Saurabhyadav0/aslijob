# AsliJob Documentation

Welcome to the AsliJob technical documentation. Here you will find the system architecture, database models, operational runbooks, and API contracts.

---

## Documentation Structure

```
docs/
├── README.md                  # Documentation Portal (this file)
├── ERD.md                     # Entity-Relationship Diagram & Data Architecture
├── API.md                     # Complete REST API Specification & Request/Response Samples
└── runbooks/
    ├── README.md              # Operations Quick Reference
    ├── deployment.md          # Multi-Platform Deployment (Vercel, Supabase, TigerGraph, EAS, Telegram)
    ├── operations.md          # Daily Operations, Cron Attestations, Graph Sync & Eval Benchmarks
    └── disaster-recovery.md   # Outage Recovery, Degraded Fallbacks & Zero-Setup Demo Mode
```

---

## Key System Concepts

1. **Universal Check Endpoint (`POST /api/check`)**:
   - Single point of entry for all interfaces (Web PWA, Telegram Bot, WhatsApp, Extension).
   - Zero business logic in frontend or bot wrappers.
2. **Dual-Layer Data Store**:
   - **Postgres (Supabase)**: Source of truth for checks, reports, letters, and rate limits.
   - **TigerGraph**: Multi-hop fraud network graph for detecting syndicated scam gangs before individual numbers accumulate multiple direct reports.
3. **Onchain Trust Anchor (EAS on Base Sepolia)**:
   - Uses Ethereum Attestation Service to anchor daily Merkle roots of issued offer letters, giving candidates cryptographic proof of legitimate employment.
4. **Privacy-Preserving Hashing**:
   - Strict adherence to zero-raw-message persistence.
   - Salted SHA-256 hashes for phones, UPIs, candidate emails, and URLs.

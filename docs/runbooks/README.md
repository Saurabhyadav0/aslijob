# AsliJob — Operational Runbooks

This directory contains the production and staging operational runbooks for running, deploying, maintaining, and recovering the AsliJob platform.

## Runbooks Index

| Runbook | Purpose | Audience |
|---|---|---|
| [**Deployment Runbook**](./deployment.md) | Step-by-step setup for Vercel, Supabase, TigerGraph, Telegram, and Base Sepolia | DevOps / Engineers |
| [**Operations & Maintenance Runbook**](./operations.md) | Daily routine, cron attestations, graph synchronization, eval benchmarks, and false-positive handling | On-call / Maintainers |
| [**Disaster Recovery & Fallbacks**](./disaster-recovery.md) | High availability fallbacks (offline TigerGraph, OCR vision fallback, RDAP timeouts, demo mode) | Incident Responders |

---

## Core Operational Commands Quick Reference

```bash
# Development server
npm run dev

# Comprehensive test suite (39 tests across 10 suites)
npm test

# Static type check
npm run lint

# Fraud detection evaluation benchmark
npm run eval

# TigerGraph synchronizer
npm run graph:sync

# Demo data & seed inspector
npm run seed

# Daily onchain EAS Merkle batch attestation CLI
npx tsx scripts/attest-daily.ts
```

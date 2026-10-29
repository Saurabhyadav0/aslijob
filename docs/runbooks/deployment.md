# Deployment Runbook — AsliJob

This runbook guides engineers through deploying AsliJob to production and staging environments across Vercel, Supabase, TigerGraph, Telegram, and Base Sepolia.

---

## 1. Prerequisites & Environment Variables

Create `.env.local` or configure Vercel Project Environment Variables:

```bash
# Core Application URLs
NEXT_PUBLIC_BASE_URL="https://aslijob.in"     # Or http://localhost:3000 for local
DEMO_MODE="false"                             # Set "true" to run standalone with zero external dependencies

# Database (Supabase Postgres)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Fraud Graph (TigerGraph)
TIGERGRAPH_HOST="https://your-tigergraph-domain.i.tgcloud.io"
TIGERGRAPH_TOKEN="your-tigergraph-rest-token"
TIGERGRAPH_GRAPH_NAME="FraudGraph"

# Onchain EAS (Base Sepolia)
BASE_SEPOLIA_RPC="https://sepolia.base.org"
EAS_CONTRACT_ADDRESS="0x4200000000000000000000000000000000000021"
EAS_SCHEMA_UID="0x..."                        # Created via scripts/register-schema.ts
ATTESTER_PRIVATE_KEY="0x..."                  # Authorized issuer wallet private key

# Telegram Bot
TELEGRAM_BOT_TOKEN="123456789:ABCdef..."
TELEGRAM_BOT_SECRET="your-high-entropy-secret-token"

# Optional External APIs
GEMINI_API_KEY="AIzaSy..."                    # For multimodal OCR vision analysis
CRON_SECRET="your-random-cron-secret-token"   # Protects /api/cron/attest
```

---

## 2. Platform 1: Vercel Web & API Deployment

AsliJob is built on Next.js 14 App Router and deploys directly to Vercel.

1. **Connect Repository:**
   - Link `https://github.com/Saurabhyadav0/aslijob` on the Vercel dashboard.
   - Root directory: `./`
   - Framework preset: `Next.js`
2. **Configure Environment Variables:**
   - Input the environment variables listed in Section 1.
   - For a quick demo/hackathon pitch deployment, setting `DEMO_MODE=true` and `NEXT_PUBLIC_BASE_URL` is all that is required.
3. **Verify Cron Configuration:**
   - Vercel automatically reads `vercel.json` and registers:
     ```json
     {
       "crons": [
         {
           "path": "/api/cron/attest",
           "schedule": "30 18 * * *"
         }
       ]
     }
     ```
   - This fires at 00:00 IST daily (18:30 UTC) to batch onchain offer letter attestations.

---

## 3. Platform 2: Supabase (Postgres Database)

1. **Create Supabase Project:**
   - Create a project on [supabase.com](https://supabase.com) in `ap-south-1` (Mumbai) for low latency to Indian users.
2. **Execute Database Migration:**
   - Open Supabase SQL Editor.
   - Paste and execute the contents of [`supabase/schema.sql`](../../supabase/schema.sql).
3. **Verify Tables and RLS:**
   ```sql
   SELECT table_name, rowsecurity FROM information_schema.tables WHERE table_schema = 'public';
   ```
   Ensure `checks`, `reports`, `identifiers`, `report_identifiers`, and `offer_letters` all have `rowsecurity = true`.

---

## 4. Platform 3: TigerGraph Savanna Cloud Setup

1. **Create TigerGraph Cloud Instance:**
   - Go to [tgcloud.io](https://tgcloud.io) and create a free-tier TigerGraph instance.
2. **Apply Graph Schema & GSQL Query:**
   - Open GraphStudio or GSQL Web Shell.
   - Run the commands in [`graph/schema.gsql`](../../graph/schema.gsql):
     ```gsql
     CREATE VERTEX Report ...
     CREATE VERTEX Identifier ...
     CREATE UNDIRECTED EDGE REPORT_IDENTIFIER ...
     CREATE GRAPH FraudGraph ...
     CREATE OR REPLACE QUERY neighbourRisk ...
     INSTALL QUERY neighbourRisk
     ```
3. **Generate REST Token:**
   - In GSQL shell:
     ```gsql
     CREATE SECRET my_secret FOR GRAPH FraudGraph
     SHOW SECRET
     ```
   - Request token via REST:
     ```bash
     curl -X POST "https://<HOST>:9000/requesttoken" -d '{"secret":"<SECRET>","lifetime":"2592000"}'
     ```
   - Set the returned token in `TIGERGRAPH_TOKEN`.
4. **Seed Initial Graph:**
   ```bash
   npm run graph:sync
   ```

---

## 5. Platform 4: Base Sepolia EAS Setup

1. **Register EAS Schema:**
   - Run the schema registration script targeting Base Sepolia:
     ```bash
     npx tsx scripts/register-schema.ts
     ```
   - This registers the offer letter schema:
     `string letterHash, string company, string role, uint256 salary, uint256 issueDate, string candidateEmailHash`
   - Copy the output Schema UID into `EAS_SCHEMA_UID`.
2. **Fund Attester Wallet:**
   - Ensure the wallet associated with `ATTESTER_PRIVATE_KEY` has Base Sepolia testnet ETH (obtainable from Base Sepolia faucets).

---

## 6. Platform 5: Telegram Bot Webhook Setup

1. **Create Bot:**
   - Message `@BotFather` on Telegram: `/newbot` $\rightarrow$ Name: `AsliJob Scam Checker` $\rightarrow$ Username: `AsliJobBot`.
   - Copy the bot API token to `TELEGRAM_BOT_TOKEN`.
2. **Register Webhook:**
   Execute this curl command substituting your live domain and tokens:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://<YOUR_DEPLOYED_DOMAIN>/api/telegram",
       "secret_token": "<TELEGRAM_BOT_SECRET>",
       "allowed_updates": ["message"]
     }'
   ```
3. **Verify Webhook Status:**
   ```bash
   curl -s "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo" | jq
   ```

---

## 7. Post-Deployment Smoke Test & Verification

1. **Health Check:**
   ```bash
   curl -i https://<YOUR_DEPLOYED_DOMAIN>/api/health
   ```
   **Expected Response (HTTP 200):**
   ```json
   {
     "ok": true,
     "db": true,
     "graph": true,
     "mode": "production"
   }
   ```
2. **Run E2E Smoke Tests:**
   ```bash
   NEXT_PUBLIC_BASE_URL="https://<YOUR_DEPLOYED_DOMAIN>" npm test -- e2e-smoke
   ```
3. **Test Telegram Forward:**
   - Open Telegram and forward any message to `@AsliJobBot`.
   - The bot should return a structured verdict with reasons and a shareable web link within 2 seconds.

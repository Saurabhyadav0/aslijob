# AsliJob — REST API Specification

Every client (Web PWA, Telegram bot, WhatsApp integration, Chrome extension) interacts with the AsliJob core through this unified REST API contract.

Base URL: `https://aslijob.in` (Production) or `http://localhost:3000` (Local)

---

## 1. Endpoints Overview

| Method | Endpoint | Description | Auth / Rate Limit |
|---|---|---|---|
| `POST` | `/api/check` | Main scam check pipeline (text, fileId, identifier) | 30 req/min sliding window |
| `POST` | `/api/upload` | File upload (<5MB image/PDF) | 10 req/min |
| `POST` | `/api/report` | Submit scam report and receive 1930 draft | Public |
| `GET` | `/api/verify/:id` | Verify offer letter authenticity onchain | Public |
| `GET` | `/api/share/:id` | Generate 1080x1080 square warning card SVG | Public (Cached) |
| `POST` | `/api/telegram` | Webhook for Telegram bot `@AsliJobBot` | Secret Token Header |
| `GET` | `/api/cron/attest` | Daily Base Sepolia EAS Merkle attestation | Bearer CRON_SECRET |
| `GET` | `/api/health` | Health check & system mode | Public |

---

## 2. Detailed Endpoint Specs

### `POST /api/check`
Performs full scam detection on input message, uploaded screenshot, or identifier.

#### Request Body
```json
{
  "text": "Congratulations! You are selected for TCS. Pay Rs. 2500 for training kit to UPI tcs.hr@okhdfcbank",
  "fileId": "file_12345",
  "identifier": {
    "kind": "phone",
    "value": "+91 9800001111"
  },
  "channel": "web",
  "lang": "en"
}
```

#### Response (HTTP 200)
```json
{
  "checkId": "chk_8f1a23bc",
  "verdict": "scam",
  "confidence": 0.95,
  "reasons": [
    {
      "id": "fee_requested",
      "text": "Asks for an upfront payment of ₹2500. Genuine employers never charge job seekers."
    },
    {
      "id": "graph_linked_scam",
      "text": "UPI ID is linked to 2 confirmed scam reports across 2 cities."
    }
  ],
  "graph": {
    "linkedReports": 2,
    "cities": 2,
    "confirmedLinks": 2,
    "reportedCount": 3,
    "path": ["upi:tcs.hr@okhdfcbank", "phone:98xxxx1111"]
  },
  "nextStep": "Do not pay. Block this contact and report to 1930.",
  "demoSources": ["fixtures/graph_seed.json"],
  "shareUrl": "https://aslijob.in/r/chk_8f1a23bc",
  "cached": false
}
```

---

### `POST /api/upload`
Uploads an image or PDF screenshot for OCR parsing.

#### Request Headers
`Content-Type: multipart/form-data`

#### Form Data
- `file`: Binary file data (JPEG, PNG, WEBP, or PDF, max 5MB).

#### Response (HTTP 200)
```json
{
  "fileId": "file_a7f92b",
  "filename": "screenshot.png",
  "size": 245012,
  "mimeType": "image/png"
}
```

---

### `POST /api/report`
Records an unverified or confirmed scam report and adds identifiers to the learning loop.

#### Request Body
```json
{
  "checkId": "chk_8f1a23bc",
  "scamType": "fee_for_job",
  "amountLost": 2500,
  "collegeId": "col_dbit_mumbai"
}
```

#### Response (HTTP 200)
```json
{
  "reportId": "rep_931bc78a",
  "complaintText": "CYBERCRIME COMPLAINT DRAFT (1930 / cybercrime.gov.in):\n\nDate: 2026-10-30\nIncident: Fraudulent job offer requesting fee.\nAmount Lost: ₹2500\nSuspect UPI: ra****@okhdfcbank\nSuspect Phone: 98xxxx1111\n\nPlease investigate this syndicate.",
  "status": "unverified"
}
```

---

### `GET /api/verify/:id`
Verifies an official offer letter issued onchain.

#### Parameters
- `:id`: The letter reference ID (e.g. `TCS-2026-X8921`).

#### Response (HTTP 200)
```json
{
  "valid": true,
  "company": "TCS",
  "role": "Associate Software Engineer",
  "issuedAt": "2026-10-25",
  "easUid": "0x48e1a7b9c02d4e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
  "reason": "Cryptographically verified by TCS via Base Sepolia EAS attestation."
}
```

---

### `GET /api/share/:id`
Generates a 1080x1080 square warning image (SVG) formatted for WhatsApp Status and Instagram stories.

#### Response Headers
`Content-Type: image/svg+xml`  
`Cache-Control: public, max-age=86400, s-maxage=86400`

---

### `POST /api/telegram`
Telegram bot webhook receiver.

#### Headers
`X-Telegram-Bot-Api-Secret-Token`: Must match configured `TELEGRAM_BOT_SECRET`.

#### Payload
Standard Telegram Update JSON (`message`, `chat`, `text`, etc.).
Automatically parses text, calls `/api/check`, and sends back formatted markdown verdict with a direct share card link.

---

### `GET /api/health`
Returns system status and connection health.

#### Response (HTTP 200)
```json
{
  "ok": true,
  "db": true,
  "graph": true,
  "mode": "production"
}
```

# AsliJob — Entity-Relationship Diagram & Data Architecture

This document specifies the complete data model for **AsliJob**, covering:
1. **Relational Data Layer** (Supabase Postgres with Row Level Security)
2. **Graph Data Layer** (TigerGraph Fraud Graph)
3. **Onchain Attestation Layer** (Base Sepolia EAS + Daily Merkle Batches)
4. **Privacy & Cryptographic Guarantees**

---

## 1. Complete Entity-Relationship Diagram

```mermaid
erDiagram
    CHECKS {
        uuid id PK "gen_random_uuid()"
        string message_hash "SHA-256 hash of normalized text"
        string verdict "safe | suspicious | scam"
        numeric confidence "0.00 to 1.00"
        jsonb reasons "Array of {id, text}"
        string channel "web | telegram | whatsapp | extension"
        timestamptz created_at "now()"
    }

    REPORTS {
        uuid id PK "gen_random_uuid()"
        uuid check_id FK "References checks(id)"
        string scam_type "fee_for_job | task_scam | fake_recruiter | other"
        int amount_lost "INR amount lost if any"
        string complaint_text "Generated 1930 Cybercrime complaint draft"
        string status "unverified | confirmed | rejected"
        uuid college_id "Optional college placement identifier"
        timestamptz created_at "now()"
    }

    IDENTIFIERS {
        uuid id PK "gen_random_uuid()"
        string kind "phone | upi | email | domain | url | wallet | telegram"
        string hashed_val "SHA-256 salted hash"
        string masked_display "e.g., 98xxxx1111 or g****@gmail.com"
        int report_count "Total times reported"
        int confirmed_links "Confirmed graph links count"
        timestamptz created_at "now()"
    }

    REPORT_IDENTIFIERS {
        uuid report_id PK, FK "References reports(id)"
        uuid identifier_id PK, FK "References identifiers(id)"
    }

    OFFER_LETTERS {
        string id PK "Unique letter ID, e.g., TCS-2026-X8921"
        string letter_hash "Canonical SHA-256 hash"
        string company "Company name"
        string role "Job title"
        string candidate_email_hash "SHA-256 hash of candidate email"
        int salary "Annual CTC in INR"
        date issue_date "Date of issue"
        string eas_uid "Base Sepolia EAS attestation UID"
        string merkle_root "Merkle root of the daily batch"
        timestamptz issued_at "now()"
    }

    COMPANIES {
        string cin PK "Corporate Identification Number"
        string name "Company legal name"
        string[] domains "Whitelisted email/web domains"
        string careers_url "Official careers portal URL"
        boolean verified "Whether official domain is verified"
    }

    RATE_LIMITS {
        string client_key PK "Hashed IP or client identifier"
        int request_count "Hits in current window"
        timestamptz reset_at "Window expiry timestamp"
    }

    CHECKS ||--o| REPORTS : "triggers optional report"
    REPORTS ||--|{ REPORT_IDENTIFIERS : "contains"
    IDENTIFIERS ||--|{ REPORT_IDENTIFIERS : "linked in"
    COMPANIES ||--o{ OFFER_LETTERS : "issues"
```

---

## 2. Fraud Graph Schema (TigerGraph)

While Postgres acts as the relational source of truth, the fraud graph captures multi-hop networks to detect syndicated scam gangs before individual numbers accumulate multiple direct reports.

```mermaid
graph TD
    subgraph TigerGraph FraudGraph
        V_Report["Vertex: Report<br/>• id: STRING<br/>• status: STRING ('unverified'|'confirmed')<br/>• scam_type: STRING<br/>• city: STRING<br/>• created_at: STRING"]
        V_Identifier["Vertex: Identifier<br/>• id: STRING ('kind:hash')<br/>• kind: STRING<br/>• hashed_val: STRING<br/>• masked_display: STRING"]

        V_Report ---|REPORT_IDENTIFIER (Undirected)| V_Identifier
    end
```

### 2-Hop Traversal Risk Semantics
When an incoming check extracts a seed identifier (e.g., Phone `P1`):
1. **Hop 0 (Seed):** Locate vertex `Identifier(P1)`.
2. **Hop 1 (Direct Reports):** Find all `Report` vertices linked to `P1`.
3. **Hop 2 (Co-occurring Identifiers):** Find all other `Identifier` vertices (e.g., UPI `U1`, Domain `D1`) co-reported in Hop 1 reports.
4. **Hop 3 (Network Reports):** Traverse to all `Report` vertices sharing Hop 2 identifiers.

**Risk Calculation:**
$$\text{confirmedLinks} = \text{Count of confirmed reports within 2 hops}$$
$$\text{reportedCount} = \text{Total reports linked to target identifier}$$
$$\text{cities} = \text{Count of unique cities impacted}$$

- **`confirmedLinks >= 2`** $\rightarrow$ Escalates verdict to **Scam**.
- **`reportedCount >= 1`** $\rightarrow$ Triggers warning badge with exact count.
- **`reportedCount == 1`** $\rightarrow$ **Never** marks as "Scam" alone without corroborating fee or domain red flags (prevents over-accusation).

---

## 3. Onchain Offer Letter Verification Model

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant WebApp as AsliJob WebApp (/verify or /v/[id])
    participant API as /api/verify/[id]
    participant EAS as Base Sepolia EAS Contract
    participant Merkle as Merkle Root Batch

    Candidate->>WebApp: Scans Letter QR / Submits Letter Details
    WebApp->>API: GET /api/verify/TCS-2026-X8921
    API->>API: Compute Canonical Letter Hash
    Note over API: SHA-256(candidateEmailHash|company|id|issueDate|role|salary)
    API->>EAS: Verify Attestation UID or Merkle Root Proof
    EAS-->>API: Attestation Valid (Signed by Company Key)
    API-->>WebApp: { valid: true, company: "TCS", role: "Software Engineer", issuedAt: "2026-10-25" }
    WebApp-->>Candidate: Green Verified Employer Badge
```

### Canonical Letter Hash Calculation
To ensure deterministic verification without leaking candidate privacy:
1. `candidateEmail` is hashed: `candidateEmailHash = sha256(email.trim().toLowerCase())`
2. Fields are formatted in alphabetical order:
   ```
   candidateEmailHash:<hash>|company:<company>|id:<id>|issueDate:<date>|role:<role>|salary:<salary>
   ```
3. Final letter hash is computed: `letterHash = sha256(canonicalString)`

---

## 4. Privacy & Data Protection Architecture

| Data Item | Storage Policy | Implementation |
|---|---|---|
| **Raw Message / Chat** | **NEVER PERSISTED** | Transient processing only. Normalized SHA-256 `message_hash` stored for 24-hr cache. |
| **Phone Number** | **Hashed + Masked** | Salted SHA-256 hash stored. Displayed only as `98xxxx1111`. |
| **UPI ID** | **Hashed + Masked** | Salted SHA-256 hash stored. Displayed only as `ra****@okhdfcbank`. |
| **Candidate Email** | **Hashed Only** | Salted SHA-256 hash stored. Plain email never touches onchain records. |
| **1930 Complaint Draft** | **Client-side Delivery** | Delivered to user screen for copy action. Not broadcasted. |

---

## 5. Row-Level Security (RLS) Policies

All tables in Postgres have RLS enabled:
- **`checks`**: Anonymous `INSERT` allowed; `SELECT` allowed by primary key `id`.
- **`reports`**: Anonymous `INSERT` allowed; `SELECT` restricted to user's report `id`.
- **`identifiers`**: Read-only `SELECT` for lookups; inserts restricted to automated `/api/report` service worker.
- **`offer_letters`**: Read-only `SELECT` for public letter verification. Writes restricted to authorized company issuers via cron attestation service.

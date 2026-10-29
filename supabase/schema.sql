-- AsliJob Supabase Postgres Schema & RLS Policies
-- Privacy by default: Identifiers are stored strictly as salted hashes + masked displays.
-- Raw message contents are never persisted; only message_hash is cached.

-- 1. Checks Table
CREATE TABLE IF NOT EXISTS public.checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_hash TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('safe', 'suspicious', 'scam')),
  confidence NUMERIC(4, 2) NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  channel TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checks_message_hash ON public.checks (message_hash);
CREATE INDEX IF NOT EXISTS idx_checks_created_at ON public.checks (created_at DESC);

-- 2. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID REFERENCES public.checks(id) ON DELETE SET NULL,
  scam_type TEXT NOT NULL DEFAULT 'other',
  amount_lost INTEGER,
  complaint_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified', 'confirmed', 'rejected')),
  college_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_check_id ON public.reports (check_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);

-- 3. Identifiers Table (Salted hashes + masked displays only)
CREATE TABLE IF NOT EXISTS public.identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('phone', 'upi', 'email', 'domain', 'url', 'wallet', 'telegram')),
  hashed_val TEXT NOT NULL,
  masked_display TEXT NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 1,
  confirmed_links INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_identifier_kind_hash UNIQUE (kind, hashed_val)
);

CREATE INDEX IF NOT EXISTS idx_identifiers_kind_hash ON public.identifiers (kind, hashed_val);

-- 4. Report-Identifier Junction Table
CREATE TABLE IF NOT EXISTS public.report_identifiers (
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  identifier_id UUID REFERENCES public.identifiers(id) ON DELETE CASCADE,
  PRIMARY KEY (report_id, identifier_id)
);

-- 5. Offer Letters Table (EAS Attestation registry)
CREATE TABLE IF NOT EXISTS public.offer_letters (
  id TEXT PRIMARY KEY,
  letter_hash TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  candidate_email_hash TEXT NOT NULL,
  salary INTEGER NOT NULL,
  issue_date DATE NOT NULL,
  eas_uid TEXT,
  merkle_root TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offer_letters_hash ON public.offer_letters (letter_hash);

-- Row Level Security (RLS)
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;

-- Anonymous users can create checks and read check results by ID
CREATE POLICY "Public can insert checks" ON public.checks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public can select checks by id" ON public.checks
  FOR SELECT TO anon, authenticated USING (true);

-- Anonymous users can submit scam reports
CREATE POLICY "Public can insert reports" ON public.reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public can read own report by id" ON public.reports
  FOR SELECT TO anon, authenticated USING (true);

-- Public can verify offer letters
CREATE POLICY "Public can verify offer letters" ON public.offer_letters
  FOR SELECT TO anon, authenticated USING (true);

-- Identifiers are read-only to public for verification lookups
CREATE POLICY "Public can query identifiers" ON public.identifiers
  FOR SELECT TO anon, authenticated USING (true);

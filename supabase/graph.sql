-- AsliJob — Supabase fraud-graph read path for the running app.
-- Adds a city column to reports, a read policy for the junction table, and a
-- SECURITY DEFINER function that does the 2-hop neighbour-risk traversal used by
-- lib/graph-supabase.ts. Safe to run repeatedly.

-- 1. reports need a city so the graph can count distinct cities.
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Let anonymous users read the (PII-free) report↔identifier junction so the
--    graph traversal works from the browser via PostgREST.
DROP POLICY IF EXISTS "Public can read report_identifiers" ON public.report_identifiers;
CREATE POLICY "Public can read report_identifiers" ON public.report_identifiers
  FOR SELECT TO anon, authenticated USING (true);

-- 3. neighbour_risk(seed_hashes): confirmed/linked reports reachable within two
--    identifier-steps of any seed identifier hash. Mirrors lib/graph.ts.
CREATE OR REPLACE FUNCTION public.neighbour_risk(seed_hashes text[])
RETURNS TABLE (linked_reports int, cities int, confirmed_links int, reported_count int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH seed_ids AS (
    SELECT id FROM identifiers WHERE hashed_val = ANY(seed_hashes)
  ),
  -- hop 1: reports directly linked to a seed identifier
  direct_reports AS (
    SELECT DISTINCT r.id, r.status, r.city
    FROM report_identifiers ri
    JOIN reports r ON r.id = ri.report_id
    WHERE ri.identifier_id IN (SELECT id FROM seed_ids)
  ),
  -- bridge: every identifier that co-occurs in those reports
  co_identifiers AS (
    SELECT DISTINCT ri.identifier_id
    FROM report_identifiers ri
    WHERE ri.report_id IN (SELECT id FROM direct_reports)
  ),
  -- hop 2: all reports reachable through those co-identifiers (incl. direct)
  all_reports AS (
    SELECT DISTINCT r.id, r.status, r.city
    FROM report_identifiers ri
    JOIN reports r ON r.id = ri.report_id
    WHERE ri.identifier_id IN (SELECT identifier_id FROM co_identifiers)
  )
  SELECT
    (SELECT count(*) FROM all_reports WHERE status = 'confirmed')::int                                  AS linked_reports,
    (SELECT count(DISTINCT city) FROM all_reports WHERE status = 'confirmed' AND city IS NOT NULL)::int AS cities,
    (SELECT count(*) FROM all_reports WHERE status = 'confirmed')::int                                  AS confirmed_links,
    (SELECT count(*) FROM all_reports)::int                                                             AS reported_count;
$$;

-- 4. Expose it to the anon/authenticated roles via PostgREST.
GRANT EXECUTE ON FUNCTION public.neighbour_risk(text[]) TO anon, authenticated;

-- 5. Nudge PostgREST to reload its schema cache so the RPC is callable at once.
NOTIFY pgrst, 'reload schema';

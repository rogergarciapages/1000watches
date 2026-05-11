-- ============================================================
--  1,000 Watches — Supabase Database Setup
--  Paste this entire script into the Supabase SQL Editor
--  and click "Run".
-- ============================================================


-- ------------------------------------------------------------
-- 1. SUBMISSIONS TABLE
--    Stores all community watch nominations.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand       TEXT        NOT NULL,
  model       TEXT        NOT NULL,
  year        INTEGER     NOT NULL CHECK (year >= 1800 AND year <= EXTRACT(YEAR FROM NOW())::INTEGER),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by brand
CREATE INDEX IF NOT EXISTS idx_submissions_brand ON public.submissions (brand);


-- ------------------------------------------------------------
-- 2. SLOTS TABLE
--    Represents the 1,000 archive slots (1 → 1000).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slots (
  id      INTEGER PRIMARY KEY CHECK (id >= 1 AND id <= 1000),
  brand   TEXT,
  model   TEXT,
  year    INTEGER,
  status  TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'filled'))
);

-- Enforce: filled slots must have brand, model, and year
ALTER TABLE public.slots
  ADD CONSTRAINT chk_filled_has_data
  CHECK (
    status = 'empty'
    OR (status = 'filled' AND brand IS NOT NULL AND model IS NOT NULL AND year IS NOT NULL)
  );


-- ------------------------------------------------------------
-- 3. SEED: Initialize all 1,000 slots as empty
-- ------------------------------------------------------------
INSERT INTO public.slots (id, status)
SELECT gs, 'empty'
FROM generate_series(1, 1000) AS gs
ON CONFLICT (id) DO NOTHING;  -- Safe to re-run


-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
--    - Anyone can READ slots and submissions.
--    - Anyone can INSERT into submissions (no auth needed for Phase 1).
--    - Only authenticated admins can UPDATE/DELETE slots.
-- ------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots       ENABLE ROW LEVEL SECURITY;

-- SUBMISSIONS policies
CREATE POLICY "Public can read submissions"
  ON public.submissions FOR SELECT
  USING (true);

CREATE POLICY "Public can insert submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

-- SLOTS policies
CREATE POLICY "Public can read slots"
  ON public.slots FOR SELECT
  USING (true);

CREATE POLICY "Only service role can modify slots"
  ON public.slots FOR ALL
  USING (auth.role() = 'service_role');


-- ------------------------------------------------------------
-- 5. REALTIME
--    Enable Supabase Realtime on the slots table so the grid
--    updates live when a slot is filled.
-- ------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.slots;


-- ============================================================
--  DONE! Your database is ready.
--
--  To fill a slot from the Supabase dashboard, run:
--    UPDATE public.slots
--    SET brand = 'Patek Philippe', model = 'Nautilus 5711', year = 1976, status = 'filled'
--    WHERE id = 1;
-- ============================================================

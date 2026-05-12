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
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand         TEXT        NOT NULL,
  model         TEXT        NOT NULL,
  year          INTEGER     NOT NULL CHECK (year >= 1800 AND year <= EXTRACT(YEAR FROM NOW())::INTEGER),
  material      TEXT,
  movement_type TEXT,
  image_url     TEXT,
  votes         INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by brand and votes
CREATE INDEX IF NOT EXISTS idx_submissions_brand ON public.submissions (brand);
CREATE INDEX IF NOT EXISTS idx_submissions_votes ON public.submissions (votes DESC);


-- ------------------------------------------------------------
-- VOTES TABLE
--    Track individual votes to prevent duplicate voting
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.votes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID        NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  user_id       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(submission_id, user_id)
);


-- ------------------------------------------------------------
-- 2. SLOTS TABLE
--    Represents the 1,000 archive slots (1 → 1000).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slots (
  id              INTEGER PRIMARY KEY CHECK (id >= 1 AND id <= 1000),
  brand           TEXT,
  model           TEXT,
  year            INTEGER,
  reference       TEXT,
  material        TEXT,
  movement_type   TEXT,
  image_url       TEXT,
  slug            TEXT UNIQUE,
  status          TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'filled'))
);

-- Add constraints separately if table exists
ALTER TABLE public.slots
  ADD CONSTRAINT chk_movement_type CHECK (movement_type IN ('automatic', 'quartz', 'manual'));

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


-- ------------------------------------------------------------
-- 6. STORAGE BUCKET FOR WATCH IMAGES
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('watch-images', 'watch-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to images
CREATE POLICY "Public can view watch images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'watch-images');

-- Allow anyone to upload images (for public submissions)
CREATE POLICY "Anyone can upload watch images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'watch-images');

-- Allow anyone to delete images
CREATE POLICY "Anyone can delete watch images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'watch-images');


-- ------------------------------------------------------------
-- 7. AUTO-SLUG GENERATION FUNCTION
--    Generates SEO-friendly slug from brand + model
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_watch_slug(p_brand TEXT, p_model TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(p_brand, '[^a-z0-9]+', '-', 'g') || '-' ||
    REGEXP_REPLACE(p_model, '[^a-z0-9]+', '-', 'g')
  );
END;
$$ LANGUAGE plpgsql;

-- Example: How to fill a slot with auto-generated slug
-- UPDATE public.slots
-- SET brand = 'Patek Philippe',
--     model = 'Nautilus 5711',
--     year = 1976,
--     status = 'filled',
--     slug = generate_watch_slug('Patek Philippe', 'Nautilus 5711')
-- WHERE id = 1;


-- ============================================================
--  GOOGLE OAUTH CONFIGURATION
-- ============================================================
-- To enable Google OAuth, go to Supabase Dashboard:
-- 1. Authentication → Providers → Google
-- 2. Enable Google provider
-- 3. Enter your Google Cloud credentials:
--    - Client ID: YOUR_GOOGLE_CLIENT_ID
--    - Client Secret: YOUR_GOOGLE_CLIENT_SECRET
-- 4. Under "Redirect URLs", add:
--    https://qliulxkgkfmkdiwravci.supabase.co/auth/v1/callback
-- 5. Save


-- ------------------------------------------------------------
-- 8. AVATARS STORAGE BUCKET
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() IN ('authenticated', 'anon')
  );

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() IN ('authenticated', 'anon')
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() IN ('authenticated', 'anon')
  );


-- ============================================================
--  MIGRATION: Add missing columns to slots table
--  Run this in Supabase SQL Editor to update existing table
-- ============================================================
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS movement_type TEXT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;


-- Fix RLS policies for slots - allow service role full access
DROP POLICY IF EXISTS "Only service role can modify slots" ON public.slots;

CREATE POLICY "Service role can do everything"
  ON public.slots FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

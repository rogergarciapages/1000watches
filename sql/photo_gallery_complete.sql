-- ============================================================
-- 1,000 WATCHES — Photo Gallery Database Setup
-- Paste this entire script into Supabase SQL Editor and run
-- ============================================================


-- ============================================================
-- WATCH_PHOTOS TABLE
-- user_id is UUID to match auth.uid() exactly
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watch_photos (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_id          TEXT        NOT NULL,
  user_id           UUID        NOT NULL,
  uploader_username TEXT,
  image_url         TEXT        NOT NULL,
  caption           TEXT,
  votes             INTEGER     DEFAULT 0,
  is_default        BOOLEAN     DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHOTO_VOTES TABLE
-- user_id is UUID to match auth.uid() exactly
-- ============================================================
CREATE TABLE IF NOT EXISTS public.photo_votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id    UUID        NOT NULL REFERENCES watch_photos(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_watch_photos_watch_id ON public.watch_photos (watch_id);
CREATE INDEX IF NOT EXISTS idx_watch_photos_votes     ON public.watch_photos (votes DESC);
CREATE INDEX IF NOT EXISTS idx_watch_photos_user_id   ON public.watch_photos (user_id);
CREATE INDEX IF NOT EXISTS idx_photo_votes_photo_id    ON public.photo_votes (photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_votes_user_id     ON public.photo_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_photo_votes_photo_user ON public.photo_votes (photo_id, user_id);


-- ============================================================
-- TRIGGER: Auto-sync vote count
-- ============================================================
CREATE OR REPLACE FUNCTION sync_watch_photo_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.watch_photos AS wp
    SET votes = (
      SELECT COUNT(*)::INTEGER
      FROM public.photo_votes pv
      WHERE pv.photo_id = wp.id
    )
    WHERE wp.id = NEW.photo_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.watch_photos AS wp
    SET votes = GREATEST(0, (
      SELECT COUNT(*)::INTEGER
      FROM public.photo_votes pv
      WHERE pv.photo_id = wp.id
    ))
    WHERE wp.id = OLD.photo_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_vote_count ON public.photo_votes;
CREATE TRIGGER trigger_sync_vote_count
  AFTER INSERT OR DELETE ON public.photo_votes
  FOR EACH ROW EXECUTE FUNCTION sync_watch_photo_vote_count();


-- ============================================================
-- TRIGGER: Auto-feature most upvoted photo per watch
-- ============================================================
CREATE OR REPLACE FUNCTION auto_feature_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.votes IS DISTINCT FROM NEW.votes AND NEW.votes > 0 THEN
    UPDATE public.watch_photos AS wp
    SET is_default = false
    WHERE wp.watch_id = NEW.watch_id
      AND wp.id != NEW.id
      AND wp.is_default = true;

    UPDATE public.watch_photos AS wp
    SET is_default = true
    WHERE wp.id = NEW.id
    AND NOT EXISTS (
      SELECT 1 FROM public.watch_photos p2
      WHERE p2.watch_id = NEW.watch_id
        AND p2.id != NEW.id
        AND p2.votes > NEW.votes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_feature ON public.watch_photos;
CREATE TRIGGER trigger_auto_feature
  AFTER UPDATE OF votes ON public.watch_photos
  FOR EACH ROW
  WHEN (OLD.votes IS DISTINCT FROM NEW.votes)
  EXECUTE FUNCTION auto_feature_photo();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.watch_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_votes   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read watch_photos"
  ON public.watch_photos FOR SELECT USING (true);

CREATE POLICY "Users can insert watch_photos"
  ON public.watch_photos FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Users can update own watch_photos"
  ON public.watch_photos FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own watch_photos"
  ON public.watch_photos FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Public can read photo_votes"
  ON public.photo_votes FOR SELECT USING (true);

CREATE POLICY "Users can insert photo_votes"
  ON public.photo_votes FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Users can delete own photo_votes"
  ON public.photo_votes FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('watch-photos', 'watch-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view watch photo images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'watch-photos');

CREATE POLICY "Users can upload watch photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'watch-photos'
    AND auth.role() IN ('authenticated', 'anon')
  );

CREATE POLICY "Users can delete own watch photo images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'watch-photos');
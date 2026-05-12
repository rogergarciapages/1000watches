-- ============================================================
-- Admin / Service Role RLS Fix
-- Run this in Supabase SQL Editor
-- ============================================================

-- submissions: service role can do everything
DROP POLICY IF EXISTS "Service role can manage submissions" ON public.submissions;
CREATE POLICY "Service role can manage submissions"
  ON public.submissions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- slots: service role can do everything
DROP POLICY IF EXISTS "Service role can manage slots" ON public.slots;
CREATE POLICY "Service role can manage slots"
  ON public.slots FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- votes: service role can do everything
DROP POLICY IF EXISTS "Service role can manage votes" ON public.votes;
CREATE POLICY "Service role can manage votes"
  ON public.votes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- watch_photos: service role can do everything
DROP POLICY IF EXISTS "Service role can manage watch_photos" ON public.watch_photos;
CREATE POLICY "Service role can manage watch_photos"
  ON public.watch_photos FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- photo_votes: service role can do everything
DROP POLICY IF EXISTS "Service role can manage photo_votes" ON public.photo_votes;
CREATE POLICY "Service role can manage photo_votes"
  ON public.photo_votes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
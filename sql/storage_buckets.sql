-- Create submissions storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('watch-images', 'watch-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view watch images" ON storage.objects;
CREATE POLICY "Public can view watch images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'watch-images');

DROP POLICY IF EXISTS "Anyone can upload watch images" ON storage.objects;
CREATE POLICY "Anyone can upload watch images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'watch-images');

DROP POLICY IF EXISTS "Anyone can delete watch images" ON storage.objects;
CREATE POLICY "Anyone can delete watch images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'watch-images');

DROP POLICY IF EXISTS "Public read vehicles bucket" ON storage.objects;
CREATE POLICY "Public read vehicles bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'vehicles');

DROP POLICY IF EXISTS "Public read gallery bucket" ON storage.objects;
CREATE POLICY "Public read gallery bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admins write vehicles bucket" ON storage.objects;
CREATE POLICY "Admins write vehicles bucket" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'vehicles' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'vehicles' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins write gallery bucket" ON storage.objects;
CREATE POLICY "Admins write gallery bucket" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

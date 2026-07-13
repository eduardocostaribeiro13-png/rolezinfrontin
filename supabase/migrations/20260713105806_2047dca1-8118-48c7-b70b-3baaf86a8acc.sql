CREATE POLICY "Tours bucket read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'tours');

CREATE POLICY "Tours bucket admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tours' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Tours bucket admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tours' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Tours bucket admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tours' AND public.has_role(auth.uid(),'admin'));
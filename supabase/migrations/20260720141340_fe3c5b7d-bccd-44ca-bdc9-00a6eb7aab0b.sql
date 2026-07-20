DROP POLICY IF EXISTS "public read blocked" ON public.blocked_slots;
REVOKE SELECT ON public.blocked_slots FROM anon;
CREATE POLICY "admins read blocked" ON public.blocked_slots FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
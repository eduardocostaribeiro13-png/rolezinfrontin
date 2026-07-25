
REVOKE EXECUTE ON FUNCTION public.get_taken_times(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_fully_booked_dates(uuid, date, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_pending_reservations() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_admin_if_whitelisted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Re-grant only where clients legitimately need access
GRANT EXECUTE ON FUNCTION public.get_taken_times(uuid, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_fully_booked_dates(uuid, date, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_admin_if_whitelisted() TO authenticated;

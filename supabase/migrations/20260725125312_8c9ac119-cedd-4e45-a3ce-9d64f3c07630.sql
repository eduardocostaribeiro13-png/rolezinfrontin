
REVOKE EXECUTE ON FUNCTION public.get_taken_times(uuid, date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_fully_booked_dates(uuid, date, date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_admin_if_whitelisted() FROM anon, authenticated;

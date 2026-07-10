
REVOKE EXECUTE ON FUNCTION public.expire_pending_reservations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_pending_reservations() TO service_role, postgres;

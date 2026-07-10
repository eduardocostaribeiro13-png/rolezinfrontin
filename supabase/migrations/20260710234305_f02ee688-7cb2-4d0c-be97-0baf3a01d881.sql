
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'COMPLETED';

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  type text NOT NULL,
  capacity integer NOT NULL,
  available_quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'ACTIVE',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_public_read_active" ON public.vehicles
  FOR SELECT USING (status = 'ACTIVE');
CREATE TRIGGER vehicles_set_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.time_slots TO anon, authenticated;
GRANT ALL ON public.time_slots TO service_role;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "time_slots_public_read_active" ON public.time_slots
  FOR SELECT USING (active = true);

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS vehicle_id uuid REFERENCES public.vehicles(id),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE INDEX IF NOT EXISTS reservations_vehicle_date_time_idx
  ON public.reservations(vehicle_id, reservation_date, reservation_time);

-- Unique blocking index: uses enum values directly (IMMUTABLE).
-- COMPLETED is not included here (not used yet); when needed, add it via a
-- separate migration once the enum value is committed.
CREATE UNIQUE INDEX IF NOT EXISTS reservations_active_slot_unique_idx
  ON public.reservations(vehicle_id, reservation_date, reservation_time)
  WHERE vehicle_id IS NOT NULL
    AND payment_status IN ('PENDING_PAYMENT'::payment_status, 'PAID'::payment_status);

INSERT INTO public.vehicles (name, slug, type, capacity, available_quantity, sort_order) VALUES
  ('Quadriciclo',    'quadriciclo', 'QUAD', 2, 1, 1),
  ('UTV 2 Lugares',  'utv-2',       'UTV',  2, 1, 2),
  ('UTV 4 Lugares',  'utv-4',       'UTV',  4, 1, 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.time_slots (time, sort_order) VALUES
  ('09:00', 1), ('11:00', 2), ('14:00', 3), ('16:00', 4)
ON CONFLICT (time) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_taken_times(p_vehicle_id uuid, p_date date)
RETURNS TABLE(reservation_time text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.reservation_time
  FROM public.reservations r
  WHERE r.vehicle_id = p_vehicle_id
    AND r.reservation_date = p_date
    AND r.payment_status IN ('PENDING_PAYMENT'::payment_status, 'PAID'::payment_status)
    AND (
      r.payment_status <> 'PENDING_PAYMENT'::payment_status
      OR r.expires_at IS NULL
      OR r.expires_at > now()
    );
$$;
GRANT EXECUTE ON FUNCTION public.get_taken_times(uuid, date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_fully_booked_dates(p_vehicle_id uuid, p_from date, p_to date)
RETURNS TABLE(reservation_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH active_slots AS (
    SELECT COUNT(*)::int AS c FROM public.time_slots WHERE active = true
  ),
  taken AS (
    SELECT r.reservation_date, COUNT(DISTINCT r.reservation_time)::int AS c
    FROM public.reservations r
    WHERE r.vehicle_id = p_vehicle_id
      AND r.reservation_date BETWEEN p_from AND p_to
      AND r.payment_status IN ('PENDING_PAYMENT'::payment_status, 'PAID'::payment_status)
      AND (
        r.payment_status <> 'PENDING_PAYMENT'::payment_status
        OR r.expires_at IS NULL
        OR r.expires_at > now()
      )
    GROUP BY r.reservation_date
  )
  SELECT t.reservation_date FROM taken t, active_slots a WHERE t.c >= a.c;
$$;
GRANT EXECUTE ON FUNCTION public.get_fully_booked_dates(uuid, date, date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.expire_pending_reservations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.reservations
  SET payment_status = 'FAILED'::payment_status, updated_at = now()
  WHERE payment_status = 'PENDING_PAYMENT'::payment_status
    AND expires_at IS NOT NULL
    AND expires_at < now();
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $outer$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-pending-reservations') THEN
    PERFORM cron.schedule(
      'expire-pending-reservations',
      '*/5 * * * *',
      $cron$SELECT public.expire_pending_reservations();$cron$
    );
  END IF;
END
$outer$;

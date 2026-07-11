
-- ============= ROLES =============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============= ADMIN WHITELIST =============
CREATE TABLE public.admin_whitelist (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_whitelist TO service_role;
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
-- No policies = no client access; only used by SECURITY DEFINER function

INSERT INTO public.admin_whitelist (email) VALUES ('rolezinfrontin@gmail.com');

CREATE OR REPLACE FUNCTION public.claim_admin_if_whitelisted()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN false; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.admin_whitelist WHERE lower(email) = lower(v_email)) THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin_if_whitelisted() TO authenticated;

-- ============= VEHICLE FIELDS =============
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url text;

-- Admin can manage vehicles
CREATE POLICY "admin manage vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can also read all (including MAINTENANCE)
CREATE POLICY "admin read all vehicles" ON public.vehicles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============= TIME SLOTS ADMIN =============
CREATE POLICY "admin manage time_slots" ON public.time_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= RESERVATIONS ADMIN =============
CREATE POLICY "admin manage reservations" ON public.reservations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= BLOCKED SLOTS =============
CREATE TABLE public.blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  blocked_time text,
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX blocked_slots_lookup_idx ON public.blocked_slots (vehicle_id, blocked_date);
GRANT SELECT ON public.blocked_slots TO anon, authenticated;
GRANT ALL ON public.blocked_slots TO service_role;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read blocked" ON public.blocked_slots
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage blocked" ON public.blocked_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= SITE SETTINGS =============
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name text,
  phone text,
  whatsapp text,
  email text,
  instagram text,
  facebook text,
  address text,
  business_hours text,
  cancellation_policy text,
  email_message text,
  voucher_message text,
  logo_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id, company_name, phone, whatsapp, email)
VALUES (1, 'Rolezin Frontin Off Road', NULL, NULL, 'rolezinfrontin@gmail.com')
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= AVAILABILITY RPCs — include blocked slots =============
CREATE OR REPLACE FUNCTION public.get_taken_times(p_vehicle_id uuid, p_date date)
RETURNS TABLE(reservation_time text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.reservation_time
  FROM public.reservations r
  WHERE r.vehicle_id = p_vehicle_id
    AND r.reservation_date = p_date
    AND r.payment_status IN ('PENDING_PAYMENT'::payment_status, 'PAID'::payment_status)
    AND (r.payment_status <> 'PENDING_PAYMENT'::payment_status OR r.expires_at IS NULL OR r.expires_at > now())
  UNION
  SELECT b.blocked_time FROM public.blocked_slots b
  WHERE (b.vehicle_id = p_vehicle_id OR b.vehicle_id IS NULL)
    AND b.blocked_date = p_date
    AND b.blocked_time IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_fully_booked_dates(p_vehicle_id uuid, p_from date, p_to date)
RETURNS TABLE(reservation_date date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH active_slots AS (SELECT COUNT(*)::int AS c FROM public.time_slots WHERE active = true),
  taken AS (
    SELECT r.reservation_date, COUNT(DISTINCT r.reservation_time)::int AS c
    FROM public.reservations r
    WHERE r.vehicle_id = p_vehicle_id
      AND r.reservation_date BETWEEN p_from AND p_to
      AND r.payment_status IN ('PENDING_PAYMENT'::payment_status, 'PAID'::payment_status)
      AND (r.payment_status <> 'PENDING_PAYMENT'::payment_status OR r.expires_at IS NULL OR r.expires_at > now())
    GROUP BY r.reservation_date
  ),
  full_day_blocks AS (
    SELECT b.blocked_date FROM public.blocked_slots b
    WHERE (b.vehicle_id = p_vehicle_id OR b.vehicle_id IS NULL)
      AND b.blocked_date BETWEEN p_from AND p_to
      AND b.blocked_time IS NULL
  )
  SELECT t.reservation_date FROM taken t, active_slots a WHERE t.c >= a.c
  UNION
  SELECT blocked_date FROM full_day_blocks;
$$;

-- Seed vehicle prices (per-tour handled via wizard tour prices; keep vehicles priced at 0 by default)

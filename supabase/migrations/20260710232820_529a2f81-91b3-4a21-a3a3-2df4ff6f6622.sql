
CREATE TYPE public.payment_status AS ENUM ('PENDING_PAYMENT','PAID','FAILED','CANCELLED');

CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_whatsapp text,
  customer_city text,
  customer_state text,
  notes text,
  tour_slug text NOT NULL,
  tour_name text NOT NULL,
  vehicle text NOT NULL DEFAULT 'Quadriciclo',
  reservation_date date NOT NULL,
  reservation_time text NOT NULL,
  adults integer NOT NULL DEFAULT 1,
  kids integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL,
  total_price integer NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_method text,
  order_nsu uuid NOT NULL UNIQUE,
  transaction_nsu text,
  invoice_slug text,
  receipt_url text,
  paid_amount integer,
  installments integer,
  paid_at timestamptz
);

CREATE INDEX reservations_order_nsu_idx ON public.reservations(order_nsu);

GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- No public policies; all access happens via server functions using the service-role client.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

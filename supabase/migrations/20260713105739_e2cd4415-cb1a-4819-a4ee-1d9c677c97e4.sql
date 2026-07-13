-- Tours table (fully admin-managed marketing/tour catalog)
CREATE TABLE public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  price_per_hour_cents INTEGER NOT NULL DEFAULT 0,
  duration_hours NUMERIC(4,1) NOT NULL DEFAULT 1,
  max_people INTEGER NOT NULL DEFAULT 1,
  level TEXT NOT NULL DEFAULT 'Leve' CHECK (level IN ('Leve','Intermediário','Radical')),
  highlights TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tours TO authenticated;
GRANT ALL ON public.tours TO service_role;

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active tours"
ON public.tours FOR SELECT
TO anon, authenticated
USING (status = 'ACTIVE' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage tours"
ON public.tours FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_tours_updated_at
BEFORE UPDATE ON public.tours
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.tours (slug, name, short_description, description, category, price_per_hour_cents, duration_hours, max_people, level, highlights, sort_order) VALUES
('trilha-do-mirante','Trilha do Mirante','Vistas panorâmicas das serras de Frontin.','Um passeio clássico por trilhas técnicas até um mirante 360° com vista para toda a região montanhosa de Engenheiro Paulo de Frontin.','Trilha',19990,2,8,'Intermediário',ARRAY['Mirante 360°','Trilhas técnicas','Fotos incluídas'],1),
('expedicao-cachoeiras','Expedição Cachoeiras','Cinco cachoeiras escondidas em uma única aventura.','Cruze rios, atravesse mata atlântica e chegue em cachoeiras cristalinas com paradas para banho e drone.','Cachoeira',24990,4,6,'Radical',ARRAY['5 cachoeiras','Banho em rios','Drone incluso'],2),
('por-do-sol-off-road','Pôr do Sol Off Road','O golden hour perfeito com brinde surpresa.','Saída no final da tarde para curtir o pôr do sol no ponto mais alto da região, com brinde e clima romântico.','Pôr do Sol',19990,2.5,10,'Leve',ARRAY['Pôr do sol','Brinde surpresa','Ideal para casais'],3),
('rolezao-completo','Rolezão Completo','O dia inteiro no controle do quadriciclo.','Trilhas, rios, cachoeiras, mirantes e almoço caipira. A experiência definitiva para quem quer o rolê completo.','Dia inteiro',24990,6,6,'Radical',ARRAY['Dia inteiro','Almoço incluso','Todos os terrenos'],4);
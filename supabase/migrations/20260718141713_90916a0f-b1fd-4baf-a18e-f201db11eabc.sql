
-- ============================================================================
-- Centro de Experiências Off-Road
-- ============================================================================

-- Categorias
CREATE TABLE public.experience_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experience_categories TO anon, authenticated;
GRANT ALL ON public.experience_categories TO authenticated;
GRANT ALL ON public.experience_categories TO service_role;
ALTER TABLE public.experience_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone"
  ON public.experience_categories FOR SELECT USING (true);
CREATE POLICY "Only admins manage categories"
  ON public.experience_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tipos de veículo
CREATE TABLE public.experience_vehicle_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experience_vehicle_types TO anon, authenticated;
GRANT ALL ON public.experience_vehicle_types TO authenticated;
GRANT ALL ON public.experience_vehicle_types TO service_role;
ALTER TABLE public.experience_vehicle_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle types are viewable by everyone"
  ON public.experience_vehicle_types FOR SELECT USING (true);
CREATE POLICY "Only admins manage vehicle types"
  ON public.experience_vehicle_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Experiências
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.experience_categories(id) ON DELETE SET NULL,
  level TEXT NOT NULL DEFAULT 'Leve' CHECK (level IN ('Leve','Intermediário','Radical')),
  duration_hours NUMERIC(4,2) NOT NULL DEFAULT 1,
  distance_km NUMERIC(6,2) NOT NULL DEFAULT 0,
  altitude_m INT NOT NULL DEFAULT 0,
  price_cents INT NOT NULL DEFAULT 0,
  max_people INT NOT NULL DEFAULT 1,
  cover_image_url TEXT,
  horizontal_image_url TEXT,
  vertical_image_url TEXT,
  preview_video_url TEXT,
  main_video_url TEXT,
  drone_video_url TEXT,
  onboard_video_url TEXT,
  video_360_url TEXT,
  route_map_url TEXT,
  equipment TEXT[] NOT NULL DEFAULT '{}',
  what_to_bring TEXT[] NOT NULL DEFAULT '{}',
  curiosities TEXT[] NOT NULL DEFAULT '{}',
  points_of_interest JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge TEXT CHECK (badge IN ('Novo','Mais Procurado','Premium','Recomendado','Extremo','Família','Iniciante')),
  tour_slug TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('PUBLISHED','DRAFT','COMING_SOON')),
  popularity INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX experiences_status_idx ON public.experiences(status);
CREATE INDEX experiences_category_idx ON public.experiences(category_id);
CREATE INDEX experiences_sort_idx ON public.experiences(sort_order);
GRANT SELECT ON public.experiences TO anon, authenticated;
GRANT ALL ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published experiences viewable by everyone"
  ON public.experiences FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Admins view all experiences"
  ON public.experiences FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage experiences"
  ON public.experiences FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Galeria
CREATE TABLE public.experience_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX experience_gallery_exp_idx ON public.experience_gallery(experience_id);
GRANT SELECT ON public.experience_gallery TO anon, authenticated;
GRANT ALL ON public.experience_gallery TO authenticated;
GRANT ALL ON public.experience_gallery TO service_role;
ALTER TABLE public.experience_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery viewable when experience published"
  ON public.experience_gallery FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.experiences e WHERE e.id = experience_id AND e.status = 'PUBLISHED')
  );
CREATE POLICY "Admins manage gallery"
  ON public.experience_gallery FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Vídeos extras
CREATE TABLE public.experience_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('drone','onboard','helmet','side','360','extra')),
  url TEXT NOT NULL,
  label TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX experience_videos_exp_idx ON public.experience_videos(experience_id);
GRANT SELECT ON public.experience_videos TO anon, authenticated;
GRANT ALL ON public.experience_videos TO authenticated;
GRANT ALL ON public.experience_videos TO service_role;
ALTER TABLE public.experience_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos viewable when experience published"
  ON public.experience_videos FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.experiences e WHERE e.id = experience_id AND e.status = 'PUBLISHED')
  );
CREATE POLICY "Admins manage videos"
  ON public.experience_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Mapeamento N:N experiência x veículos
CREATE TABLE public.experience_vehicle_map (
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  vehicle_type_id UUID NOT NULL REFERENCES public.experience_vehicle_types(id) ON DELETE CASCADE,
  PRIMARY KEY (experience_id, vehicle_type_id)
);
GRANT SELECT ON public.experience_vehicle_map TO anon, authenticated;
GRANT ALL ON public.experience_vehicle_map TO authenticated;
GRANT ALL ON public.experience_vehicle_map TO service_role;
ALTER TABLE public.experience_vehicle_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle map viewable when experience published"
  ON public.experience_vehicle_map FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.experiences e WHERE e.id = experience_id AND e.status = 'PUBLISHED')
  );
CREATE POLICY "Admins manage vehicle map"
  ON public.experience_vehicle_map FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tags
CREATE TABLE public.experience_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE (experience_id, tag)
);
CREATE INDEX experience_tags_exp_idx ON public.experience_tags(experience_id);
GRANT SELECT ON public.experience_tags TO anon, authenticated;
GRANT ALL ON public.experience_tags TO authenticated;
GRANT ALL ON public.experience_tags TO service_role;
ALTER TABLE public.experience_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags viewable when experience published"
  ON public.experience_tags FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.experiences e WHERE e.id = experience_id AND e.status = 'PUBLISHED')
  );
CREATE POLICY "Admins manage tags"
  ON public.experience_tags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER experience_categories_updated_at
  BEFORE UPDATE ON public.experience_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER experience_vehicle_types_updated_at
  BEFORE UPDATE ON public.experience_vehicle_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seeds
INSERT INTO public.experience_categories (slug, name, sort_order) VALUES
  ('cachoeiras','Cachoeiras',10),
  ('mirantes','Mirantes',20),
  ('panoramicas','Panorâmicas',30),
  ('familia','Família',40),
  ('extremo','Extremo',50);

INSERT INTO public.experience_vehicle_types (slug, name, sort_order) VALUES
  ('quadriciclo','Quadriciclo',10),
  ('utv','UTV',20),
  ('buggy','Buggy',30);

-- Storage policies (bucket 'experiences' criado via ferramenta)
CREATE POLICY "Admins read experiences bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'experiences' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload experiences bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'experiences' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update experiences bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'experiences' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete experiences bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'experiences' AND public.has_role(auth.uid(), 'admin'));

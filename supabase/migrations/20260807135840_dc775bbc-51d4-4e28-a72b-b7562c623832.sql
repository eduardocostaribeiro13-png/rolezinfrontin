ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reservations_experience_id_idx
  ON public.reservations (experience_id);
export type ExperienceLevel = "Leve" | "Intermediário" | "Radical";
export type ExperienceStatus = "PUBLISHED" | "DRAFT" | "COMING_SOON";
export type ExperienceBadge =
  | "Novo"
  | "Mais Procurado"
  | "Premium"
  | "Recomendado"
  | "Extremo"
  | "Família"
  | "Iniciante";

export const EXPERIENCE_BADGES: ExperienceBadge[] = [
  "Novo",
  "Mais Procurado",
  "Premium",
  "Recomendado",
  "Extremo",
  "Família",
  "Iniciante",
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Leve", "Intermediário", "Radical"];

export type ExperienceVideoKind =
  | "drone"
  | "onboard"
  | "helmet"
  | "side"
  | "360"
  | "extra";

export const VIDEO_KIND_LABEL: Record<ExperienceVideoKind, string> = {
  drone: "Drone",
  onboard: "GoPro Onboard",
  helmet: "Capacete",
  side: "Lateral",
  "360": "360°",
  extra: "Extra",
};

export type POI = {
  name: string;
  description?: string;
};

export type ExperienceCategory = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type ExperienceVehicleType = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type ExperienceGalleryItem = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
};

export type ExperienceExtraVideo = {
  id: string;
  kind: ExperienceVideoKind;
  url: string;
  label: string | null;
  sort_order: number;
};

export type Experience = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  category?: ExperienceCategory | null;
  level: ExperienceLevel;
  duration_hours: number;
  distance_km: number;
  altitude_m: number;
  price_cents: number;
  max_people: number;
  cover_image_url: string | null;
  horizontal_image_url: string | null;
  vertical_image_url: string | null;
  preview_video_url: string | null;
  main_video_url: string | null;
  drone_video_url: string | null;
  onboard_video_url: string | null;
  video_360_url: string | null;
  route_map_url: string | null;
  equipment: string[];
  what_to_bring: string[];
  curiosities: string[];
  points_of_interest: POI[];
  badge: ExperienceBadge | null;
  tour_slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  status: ExperienceStatus;
  popularity: number;
  sort_order: number;
  vehicle_type_ids: string[];
  tags: string[];
  gallery: ExperienceGalleryItem[];
  videos: ExperienceExtraVideo[];
  created_at: string;
  updated_at: string;
};

export const brlCents = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type TourLevel = "Leve" | "Intermediário" | "Radical";

/**
 * Tour — canonical shape used across the site.
 * Fully sourced from the `tours` table in the database.
 */
export type Tour = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  price_per_hour_cents: number;
  duration_hours: number;
  max_people: number;
  level: TourLevel;
  highlights: string[];
  sort_order: number;
  status: "ACTIVE" | "INACTIVE";
};

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export const brlCents = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

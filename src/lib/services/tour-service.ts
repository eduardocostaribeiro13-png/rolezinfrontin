import { supabase } from "@/integrations/supabase/client";
import type { Tour, TourLevel } from "@/lib/tours";

const COLUMNS =
  "id,slug,name,short_description,description,category,image_url,price_per_hour_cents,duration_hours,max_people,level,highlights,sort_order,status";

type Row = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  price_per_hour_cents: number;
  duration_hours: number | string;
  max_people: number;
  level: string;
  highlights: string[] | null;
  sort_order: number;
  status: string;
};

const mapRow = (r: Row): Tour => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  short_description: r.short_description,
  description: r.description,
  category: r.category,
  image_url: r.image_url,
  price_per_hour_cents: r.price_per_hour_cents ?? 0,
  duration_hours: Number(r.duration_hours) || 1,
  max_people: r.max_people ?? 1,
  level: (r.level as TourLevel) ?? "Leve",
  highlights: r.highlights ?? [],
  sort_order: r.sort_order ?? 0,
  status: (r.status as Tour["status"]) ?? "ACTIVE",
});

export const TourService = {
  async list(): Promise<Tour[]> {
    const { data, error } = await supabase
      .from("tours" as never)
      .select(COLUMNS)
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(mapRow);
  },

  async listAll(): Promise<Tour[]> {
    const { data, error } = await supabase
      .from("tours" as never)
      .select(COLUMNS)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(mapRow);
  },

  async getBySlug(slug: string): Promise<Tour | null> {
    const { data, error } = await supabase
      .from("tours" as never)
      .select(COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data as unknown as Row) : null;
  },

  async upsert(t: Partial<Tour> & { id?: string }): Promise<void> {
    const payload = {
      slug: t.slug ?? "",
      name: t.name ?? "",
      short_description: t.short_description ?? null,
      description: t.description ?? null,
      category: t.category ?? null,
      image_url: t.image_url ?? null,
      price_per_hour_cents: t.price_per_hour_cents ?? 0,
      duration_hours: t.duration_hours ?? 1,
      max_people: t.max_people ?? 1,
      level: t.level ?? "Leve",
      highlights: t.highlights ?? [],
      sort_order: t.sort_order ?? 0,
      status: t.status ?? "ACTIVE",
    };
    if (t.id) {
      const { error } = await supabase
        .from("tours" as never)
        .update(payload as never)
        .eq("id", t.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("tours" as never).insert(payload as never);
      if (error) throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("tours" as never).delete().eq("id", id);
    if (error) throw error;
  },
};

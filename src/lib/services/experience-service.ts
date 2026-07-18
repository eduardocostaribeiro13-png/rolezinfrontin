import { supabase } from "@/integrations/supabase/client";
import type {
  Experience,
  ExperienceBadge,
  ExperienceCategory,
  ExperienceExtraVideo,
  ExperienceGalleryItem,
  ExperienceLevel,
  ExperienceStatus,
  ExperienceVehicleType,
  ExperienceVideoKind,
  POI,
} from "@/lib/experiences";
import { slugify } from "@/lib/experiences";

/**
 * ExperienceService — CRUD completo para o Centro de Experiências Off-Road.
 * Leitura pública respeita RLS (só PUBLISHED); admin enxerga tudo.
 */

const T = {
  categories: "experience_categories",
  vehicleTypes: "experience_vehicle_types",
  experiences: "experiences",
  gallery: "experience_gallery",
  videos: "experience_videos",
  vehicleMap: "experience_vehicle_map",
  tags: "experience_tags",
} as const;

// Raw row shapes — we cast because Supabase types haven't been regenerated yet.
type ExpRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  level: string;
  duration_hours: number | string;
  distance_km: number | string;
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
  equipment: string[] | null;
  what_to_bring: string[] | null;
  curiosities: string[] | null;
  points_of_interest: POI[] | null;
  badge: string | null;
  tour_slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  status: string;
  popularity: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function mapExperience(
  row: ExpRow,
  extras: {
    category?: ExperienceCategory | null;
    vehicle_type_ids?: string[];
    tags?: string[];
    gallery?: ExperienceGalleryItem[];
    videos?: ExperienceExtraVideo[];
  } = {},
): Experience {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short_description: row.short_description,
    description: row.description,
    category_id: row.category_id,
    category: extras.category ?? null,
    level: (row.level as ExperienceLevel) ?? "Leve",
    duration_hours: Number(row.duration_hours) || 0,
    distance_km: Number(row.distance_km) || 0,
    altitude_m: row.altitude_m ?? 0,
    price_cents: row.price_cents ?? 0,
    max_people: row.max_people ?? 1,
    cover_image_url: row.cover_image_url,
    horizontal_image_url: row.horizontal_image_url,
    vertical_image_url: row.vertical_image_url,
    preview_video_url: row.preview_video_url,
    main_video_url: row.main_video_url,
    drone_video_url: row.drone_video_url,
    onboard_video_url: row.onboard_video_url,
    video_360_url: row.video_360_url,
    route_map_url: row.route_map_url,
    equipment: row.equipment ?? [],
    what_to_bring: row.what_to_bring ?? [],
    curiosities: row.curiosities ?? [],
    points_of_interest: row.points_of_interest ?? [],
    badge: (row.badge as ExperienceBadge | null) ?? null,
    tour_slug: row.tour_slug,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    og_image_url: row.og_image_url,
    status: (row.status as ExperienceStatus) ?? "DRAFT",
    popularity: row.popularity ?? 0,
    sort_order: row.sort_order ?? 0,
    vehicle_type_ids: extras.vehicle_type_ids ?? [],
    tags: extras.tags ?? [],
    gallery: extras.gallery ?? [],
    videos: extras.videos ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type ListFilters = {
  categorySlug?: string;
  vehicleSlug?: string;
  level?: ExperienceLevel;
  tag?: string;
};

export type SortKey =
  | "recent"
  | "popular"
  | "duration_asc"
  | "duration_desc"
  | "distance_asc"
  | "distance_desc";

export const ExperienceService = {
  async listCategories(): Promise<ExperienceCategory[]> {
    const { data, error } = await supabase
      .from(T.categories as never)
      .select("id, slug, name, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as unknown as ExperienceCategory[]) ?? [];
  },

  async listVehicleTypes(): Promise<ExperienceVehicleType[]> {
    const { data, error } = await supabase
      .from(T.vehicleTypes as never)
      .select("id, slug, name, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as unknown as ExperienceVehicleType[]) ?? [];
  },

  async listPublished(opts: { filters?: ListFilters; sort?: SortKey } = {}): Promise<Experience[]> {
    const filters = opts.filters ?? {};
    const sort = opts.sort ?? "recent";
    let q = supabase
      .from(T.experiences as never)
      .select("*")
      .eq("status", "PUBLISHED");

    if (filters.level) q = q.eq("level", filters.level);

    // sort
    if (sort === "recent") q = q.order("created_at", { ascending: false });
    else if (sort === "popular") q = q.order("popularity", { ascending: false });
    else if (sort === "duration_asc") q = q.order("duration_hours", { ascending: true });
    else if (sort === "duration_desc") q = q.order("duration_hours", { ascending: false });
    else if (sort === "distance_asc") q = q.order("distance_km", { ascending: true });
    else if (sort === "distance_desc") q = q.order("distance_km", { ascending: false });

    const { data, error } = await q;
    if (error) throw error;
    const rows = (data as unknown as ExpRow[]) ?? [];
    if (!rows.length) return [];

    // categoria e veículos/tags em paralelo
    const [cats, maps, tags] = await Promise.all([
      this.listCategories(),
      supabase
        .from(T.vehicleMap as never)
        .select("experience_id, vehicle_type_id"),
      supabase.from(T.tags as never).select("experience_id, tag"),
    ]);
    if (maps.error) throw maps.error;
    if (tags.error) throw tags.error;

    const catById = new Map(cats.map((c) => [c.id, c]));
    const vmap = new Map<string, string[]>();
    for (const r of (maps.data as unknown as { experience_id: string; vehicle_type_id: string }[]) ?? []) {
      const arr = vmap.get(r.experience_id) ?? [];
      arr.push(r.vehicle_type_id);
      vmap.set(r.experience_id, arr);
    }
    const tmap = new Map<string, string[]>();
    for (const r of (tags.data as unknown as { experience_id: string; tag: string }[]) ?? []) {
      const arr = tmap.get(r.experience_id) ?? [];
      arr.push(r.tag);
      tmap.set(r.experience_id, arr);
    }

    let result = rows.map((r) =>
      mapExperience(r, {
        category: r.category_id ? catById.get(r.category_id) ?? null : null,
        vehicle_type_ids: vmap.get(r.id) ?? [],
        tags: tmap.get(r.id) ?? [],
      }),
    );

    // Filtros pós-fetch (categoria/veículo/tag por slug)
    if (filters.categorySlug) {
      result = result.filter((e) => e.category?.slug === filters.categorySlug);
    }
    if (filters.vehicleSlug) {
      const vt = (await this.listVehicleTypes()).find((v) => v.slug === filters.vehicleSlug);
      if (vt) result = result.filter((e) => e.vehicle_type_ids.includes(vt.id));
    }
    if (filters.tag) {
      result = result.filter((e) => e.tags.includes(filters.tag!));
    }
    return result;
  },

  async listAllAdmin(): Promise<Experience[]> {
    const { data, error } = await supabase
      .from(T.experiences as never)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data as unknown as ExpRow[]) ?? [];
    const cats = await this.listCategories();
    const catById = new Map(cats.map((c) => [c.id, c]));
    return rows.map((r) => mapExperience(r, { category: r.category_id ? catById.get(r.category_id) ?? null : null }));
  },

  async getBySlug(slug: string): Promise<Experience | null> {
    const { data, error } = await supabase
      .from(T.experiences as never)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as unknown as ExpRow;

    const [cats, gal, vids, vmap, tags] = await Promise.all([
      this.listCategories(),
      supabase
        .from(T.gallery as never)
        .select("id, url, caption, sort_order")
        .eq("experience_id", row.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from(T.videos as never)
        .select("id, kind, url, label, sort_order")
        .eq("experience_id", row.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from(T.vehicleMap as never)
        .select("vehicle_type_id")
        .eq("experience_id", row.id),
      supabase
        .from(T.tags as never)
        .select("tag")
        .eq("experience_id", row.id),
    ]);
    if (gal.error) throw gal.error;
    if (vids.error) throw vids.error;
    if (vmap.error) throw vmap.error;
    if (tags.error) throw tags.error;

    const catById = new Map(cats.map((c) => [c.id, c]));
    return mapExperience(row, {
      category: row.category_id ? catById.get(row.category_id) ?? null : null,
      gallery: (gal.data as unknown as ExperienceGalleryItem[]) ?? [],
      videos: (vids.data as unknown as ExperienceExtraVideo[]) ?? [],
      vehicle_type_ids: ((vmap.data as unknown as { vehicle_type_id: string }[]) ?? []).map((r) => r.vehicle_type_id),
      tags: ((tags.data as unknown as { tag: string }[]) ?? []).map((r) => r.tag),
    });
  },

  async getById(id: string): Promise<Experience | null> {
    const { data, error } = await supabase
      .from(T.experiences as never)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return this.getBySlug((data as unknown as ExpRow).slug);
  },

  async upsert(input: Partial<Experience> & { name: string }): Promise<string> {
    const slug = input.slug?.trim() || slugify(input.name);
    const payload = {
      slug,
      name: input.name,
      short_description: input.short_description ?? null,
      description: input.description ?? null,
      category_id: input.category_id ?? null,
      level: input.level ?? "Leve",
      duration_hours: input.duration_hours ?? 1,
      distance_km: input.distance_km ?? 0,
      altitude_m: input.altitude_m ?? 0,
      price_cents: input.price_cents ?? 0,
      max_people: input.max_people ?? 1,
      cover_image_url: input.cover_image_url ?? null,
      horizontal_image_url: input.horizontal_image_url ?? null,
      vertical_image_url: input.vertical_image_url ?? null,
      preview_video_url: input.preview_video_url ?? null,
      main_video_url: input.main_video_url ?? null,
      drone_video_url: input.drone_video_url ?? null,
      onboard_video_url: input.onboard_video_url ?? null,
      video_360_url: input.video_360_url ?? null,
      route_map_url: input.route_map_url ?? null,
      equipment: input.equipment ?? [],
      what_to_bring: input.what_to_bring ?? [],
      curiosities: input.curiosities ?? [],
      points_of_interest: input.points_of_interest ?? [],
      badge: input.badge ?? null,
      tour_slug: input.tour_slug ?? null,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
      og_image_url: input.og_image_url ?? null,
      status: input.status ?? "DRAFT",
      popularity: input.popularity ?? 0,
      sort_order: input.sort_order ?? 0,
    };

    let id = input.id;
    if (id) {
      const { error } = await supabase
        .from(T.experiences as never)
        .update(payload as never)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from(T.experiences as never)
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;
      id = (data as unknown as { id: string }).id;
    }

    // sync relations
    if (input.vehicle_type_ids) await this.syncVehicles(id!, input.vehicle_type_ids);
    if (input.tags) await this.syncTags(id!, input.tags);
    if (input.gallery) await this.syncGallery(id!, input.gallery);
    if (input.videos) await this.syncVideos(id!, input.videos);

    return id!;
  },

  async syncVehicles(experienceId: string, vehicleTypeIds: string[]) {
    await supabase.from(T.vehicleMap as never).delete().eq("experience_id", experienceId);
    if (vehicleTypeIds.length === 0) return;
    const rows = vehicleTypeIds.map((v) => ({ experience_id: experienceId, vehicle_type_id: v }));
    const { error } = await supabase.from(T.vehicleMap as never).insert(rows as never);
    if (error) throw error;
  },

  async syncTags(experienceId: string, tags: string[]) {
    await supabase.from(T.tags as never).delete().eq("experience_id", experienceId);
    if (tags.length === 0) return;
    const rows = tags.map((tag) => ({ experience_id: experienceId, tag }));
    const { error } = await supabase.from(T.tags as never).insert(rows as never);
    if (error) throw error;
  },

  async syncGallery(experienceId: string, items: ExperienceGalleryItem[]) {
    await supabase.from(T.gallery as never).delete().eq("experience_id", experienceId);
    if (items.length === 0) return;
    const rows = items.map((g, i) => ({
      experience_id: experienceId,
      url: g.url,
      caption: g.caption ?? null,
      sort_order: g.sort_order ?? i,
    }));
    const { error } = await supabase.from(T.gallery as never).insert(rows as never);
    if (error) throw error;
  },

  async syncVideos(experienceId: string, items: ExperienceExtraVideo[]) {
    await supabase.from(T.videos as never).delete().eq("experience_id", experienceId);
    if (items.length === 0) return;
    const rows = items.map((v, i) => ({
      experience_id: experienceId,
      kind: v.kind,
      url: v.url,
      label: v.label ?? null,
      sort_order: v.sort_order ?? i,
    }));
    const { error } = await supabase.from(T.videos as never).insert(rows as never);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(T.experiences as never).delete().eq("id", id);
    if (error) throw error;
  },

  async setStatus(id: string, status: ExperienceStatus): Promise<void> {
    const { error } = await supabase
      .from(T.experiences as never)
      .update({ status } as never)
      .eq("id", id);
    if (error) throw error;
  },

  async duplicate(id: string): Promise<string> {
    const src = await this.getById(id);
    if (!src) throw new Error("Experiência não encontrada");
    const copy: Partial<Experience> & { name: string } = {
      ...src,
      id: undefined,
      slug: `${src.slug}-copia-${Date.now().toString(36)}`,
      name: `${src.name} (cópia)`,
      status: "DRAFT",
      popularity: 0,
    };
    return this.upsert(copy);
  },
};

export type { ExperienceVideoKind };

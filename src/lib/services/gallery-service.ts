import { supabase } from "@/integrations/supabase/client";

export type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
};

const TABLE = "gallery" as never;

export const GalleryService = {
  async list(): Promise<GalleryImage[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id,image_url,alt_text,category,sort_order,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as GalleryImage[];
  },

  async add(input: {
    image_url: string;
    alt_text?: string | null;
    category?: string | null;
    sort_order?: number;
  }): Promise<void> {
    const { error } = await supabase.from(TABLE).insert({
      image_url: input.image_url,
      alt_text: input.alt_text ?? null,
      category: input.category ?? null,
      sort_order: input.sort_order ?? 0,
    } as never);
    if (error) throw error;
  },

  async update(
    id: string,
    patch: Partial<Pick<GalleryImage, "alt_text" | "category" | "sort_order" | "image_url">>,
  ): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update(patch as never)
      .eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },
};

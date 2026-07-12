import { supabase } from "@/integrations/supabase/client";

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  type: string;
  capacity: number;
  available_quantity: number;
  status: string;
  sort_order: number;
  description: string | null;
  price_cents: number;
  image_url: string | null;
};

const COLUMNS =
  "id,name,slug,type,capacity,available_quantity,status,sort_order,description,price_cents,image_url";

/**
 * VehicleService — public listing of active vehicles.
 * Single source of truth for what's shown across the public site.
 */
export const VehicleService = {
  async list(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from("vehicles" as never)
      .select(COLUMNS)
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Vehicle[];
  },

  async getBySlug(slug: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from("vehicles" as never)
      .select(COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as unknown as Vehicle | null;
  },
};

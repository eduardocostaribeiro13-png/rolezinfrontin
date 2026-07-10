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
};

/**
 * VehicleService — public listing of active vehicles.
 * Only reads through RLS as anon.
 */
export const VehicleService = {
  async list(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from("vehicles" as never)
      .select("id,name,slug,type,capacity,available_quantity,status,sort_order")
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Vehicle[];
  },

  async getBySlug(slug: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from("vehicles" as never)
      .select("id,name,slug,type,capacity,available_quantity,status,sort_order")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as unknown as Vehicle | null;
  },
};

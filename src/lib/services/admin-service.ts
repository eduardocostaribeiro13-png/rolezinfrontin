import { supabase } from "@/integrations/supabase/client";

export type Reservation = {
  id: string;
  order_nsu: string;
  tour_name: string;
  tour_slug: string;
  vehicle: string;
  vehicle_id: string | null;
  reservation_date: string;
  reservation_time: string;
  adults: number;
  kids: number;
  quantity: number;
  total_price: number;
  paid_amount: number | null;
  payment_status: "PENDING_PAYMENT" | "PAID" | "FAILED" | "CANCELLED" | "COMPLETED";
  payment_method: string | null;
  transaction_nsu: string | null;
  invoice_slug: string | null;
  receipt_url: string | null;
  installments: number | null;
  paid_at: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  customer_city: string | null;
  customer_state: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

export type AdminVehicle = {
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

export type BlockedSlot = {
  id: string;
  vehicle_id: string | null;
  blocked_date: string;
  blocked_time: string | null;
  reason: string | null;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  company_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  address: string | null;
  business_hours: string | null;
  cancellation_policy: string | null;
  email_message: string | null;
  voucher_message: string | null;
  logo_url: string | null;
};

export const AdminService = {
  async listReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Reservation[];
  },
  async updateReservationStatus(
    id: string,
    status: Reservation["payment_status"],
  ): Promise<void> {
    const { error } = await supabase
      .from("reservations")
      .update({ payment_status: status })
      .eq("id", id);
    if (error) throw error;
  },

  async listVehiclesAll(): Promise<AdminVehicle[]> {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as AdminVehicle[];
  },
  async upsertVehicle(v: Partial<AdminVehicle> & { id?: string }): Promise<void> {
    const payload = {
      name: v.name ?? "",
      slug: v.slug ?? "",
      type: v.type ?? "",
      capacity: v.capacity ?? 1,
      status: v.status ?? "ACTIVE",
      sort_order: v.sort_order ?? 0,
      description: v.description ?? null,
      price_cents: v.price_cents ?? 0,
      image_url: v.image_url ?? null,
    };
    if (v.id) {
      const { error } = await supabase.from("vehicles").update(payload).eq("id", v.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("vehicles").insert(payload);
      if (error) throw error;
    }
  },
  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) throw error;
  },

  async listBlockedSlots(): Promise<BlockedSlot[]> {
    const { data, error } = await supabase
      .from("blocked_slots")
      .select("*")
      .order("blocked_date", { ascending: true });
    if (error) throw error;
    return (data ?? []) as BlockedSlot[];
  },
  async addBlockedSlot(input: {
    vehicle_id: string | null;
    blocked_date: string;
    blocked_time: string | null;
    reason: string | null;
  }): Promise<void> {
    const { error } = await supabase.from("blocked_slots").insert(input);
    if (error) throw error;
  },
  async removeBlockedSlot(id: string): Promise<void> {
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
    if (error) throw error;
  },

  async getSettings(): Promise<SiteSettings | null> {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as SiteSettings | null;
  },
  async updateSettings(patch: Partial<SiteSettings>): Promise<void> {
    const { id: _id, ...rest } = patch;
    void _id;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
    if (error) throw error;
  },
};

export const brlCents = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

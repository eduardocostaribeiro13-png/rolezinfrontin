import { supabase } from "@/integrations/supabase/client";

/**
 * ReservationService — read-side helpers for the reservation lifecycle.
 *
 * Writes always go through server functions (`createCheckout`, webhook).
 * This surface is prepared for future admin/reschedule flows.
 */
export const ReservationService = {
  async getByOrderNsu(orderNsu: string) {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("order_nsu", orderNsu)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

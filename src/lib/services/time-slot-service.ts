import { supabase } from "@/integrations/supabase/client";

export type TimeSlot = {
  id: string;
  time: string;
  active: boolean;
  sort_order: number;
};

/**
 * TimeSlotService — public listing of active time slots.
 * New slots can be added/reordered in the database without any code change.
 */
export const TimeSlotService = {
  async list(): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from("time_slots" as never)
      .select("id,time,active,sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as TimeSlot[];
  },
};

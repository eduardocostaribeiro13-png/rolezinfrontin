import { supabase } from "@/integrations/supabase/client";

/**
 * AvailabilityService — realtime slot availability.
 * All queries are indexed on (vehicle_id, reservation_date, reservation_time)
 * and go through SECURITY DEFINER RPCs that return only times/dates (no PII).
 */
export const AvailabilityService = {
  /** Returns the list of times already taken for the given vehicle+date. */
  async getTakenTimes(vehicleId: string, dateISO: string): Promise<string[]> {
    const { data, error } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: { reservation_time: string }[] | null; error: unknown }>
    )("get_taken_times", { p_vehicle_id: vehicleId, p_date: dateISO });
    if (error) throw error;
    return (data ?? []).map((r) => r.reservation_time);
  },

  /** Dates in the range where every active time_slot is already taken. */
  async getFullyBookedDates(
    vehicleId: string,
    fromISO: string,
    toISO: string,
  ): Promise<string[]> {
    const { data, error } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: { reservation_date: string }[] | null; error: unknown }>
    )("get_fully_booked_dates", {
      p_vehicle_id: vehicleId,
      p_from: fromISO,
      p_to: toISO,
    });
    if (error) throw error;
    return (data ?? []).map((r) => r.reservation_date);
  },
};

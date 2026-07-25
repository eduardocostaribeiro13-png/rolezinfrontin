import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const takenInput = z.object({
  vehicleId: z.string().uuid(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const rangeInput = z.object({
  vehicleId: z.string().uuid(),
  fromISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const getTakenTimesFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => takenInput.parse(data))
  .handler(async ({ data }): Promise<string[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (
      supabaseAdmin.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: { reservation_time: string }[] | null; error: unknown }>
    )("get_taken_times", { p_vehicle_id: data.vehicleId, p_date: data.dateISO });
    if (error) throw new Error("Failed to load availability");
    return (rows ?? []).map((r) => r.reservation_time);
  });

export const getFullyBookedDatesFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => rangeInput.parse(data))
  .handler(async ({ data }): Promise<string[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (
      supabaseAdmin.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: { reservation_date: string }[] | null; error: unknown }>
    )("get_fully_booked_dates", {
      p_vehicle_id: data.vehicleId,
      p_from: data.fromISO,
      p_to: data.toISO,
    });
    if (error) throw new Error("Failed to load availability");
    return (rows ?? []).map((r) => r.reservation_date);
  });

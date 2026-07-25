import { getTakenTimesFn, getFullyBookedDatesFn } from "@/lib/availability.functions";

/**
 * AvailabilityService — realtime slot availability.
 * Calls server functions (which use a privileged server client) so we can
 * keep the underlying SECURITY DEFINER database functions closed to
 * anon/authenticated roles.
 */
export const AvailabilityService = {
  async getTakenTimes(vehicleId: string, dateISO: string): Promise<string[]> {
    return await getTakenTimesFn({ data: { vehicleId, dateISO } });
  },
  async getFullyBookedDates(
    vehicleId: string,
    fromISO: string,
    toISO: string,
  ): Promise<string[]> {
    return await getFullyBookedDatesFn({
      data: { vehicleId, fromISO, toISO },
    });
  },
};

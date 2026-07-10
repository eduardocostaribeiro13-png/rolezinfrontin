import { useQuery } from "@tanstack/react-query";
import { VehicleService } from "@/lib/services/vehicle-service";
import { TimeSlotService } from "@/lib/services/time-slot-service";
import { AvailabilityService } from "@/lib/services/availability-service";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => VehicleService.list(),
    staleTime: 60_000,
  });
}

export function useTimeSlots() {
  return useQuery({
    queryKey: ["time-slots"],
    queryFn: () => TimeSlotService.list(),
    staleTime: 60_000,
  });
}

export function useTakenTimes(vehicleId: string | null, dateISO: string | null) {
  return useQuery({
    queryKey: ["availability", "taken-times", vehicleId, dateISO],
    queryFn: () => AvailabilityService.getTakenTimes(vehicleId!, dateISO!),
    enabled: !!vehicleId && !!dateISO,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useFullyBookedDates(
  vehicleId: string | null,
  fromISO: string,
  toISO: string,
) {
  return useQuery({
    queryKey: ["availability", "fully-booked", vehicleId, fromISO, toISO],
    queryFn: () => AvailabilityService.getFullyBookedDates(vehicleId!, fromISO, toISO),
    enabled: !!vehicleId,
    staleTime: 30_000,
  });
}

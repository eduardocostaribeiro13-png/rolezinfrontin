// Motor de simulação: percorre a rota real, calcula velocidade/altitude/ETA/progresso.
import type { LngLat, POI, RealRoute } from "./data";
import { cumulativeLengths, distanceM, interpolateRoute, toLocal } from "./geo";
import { fetchElevations } from "./elevation";

export interface RouteState {
  progress: number; // 0..1
  distanceTraveledM: number;
  distanceRemainingM: number;
  totalDistanceM: number;
  speedKmh: number;
  altitudeM: number;
  etaSeconds: number;
  headingRad: number;
  lngLat: LngLat;
  localXZ: [number, number];
  activePoi: POI | null;
  finished: boolean;
}

export interface CompiledRoute {
  raw: RealRoute;
  cum: number[]; // metragem acumulada
  totalM: number;
  elevations: number[]; // altitude por vértice (m)
  headings: number[]; // heading por vértice (rad)
}

export async function compileRoute(route: RealRoute): Promise<CompiledRoute> {
  const cum = cumulativeLengths(route.coordinates);
  const totalM = cum[cum.length - 1];
  const elevations = await fetchElevations(route.coordinates);
  const headings: number[] = [];
  for (let i = 0; i < route.coordinates.length; i++) {
    const a = route.coordinates[Math.max(0, i - 1)];
    const b = route.coordinates[Math.min(route.coordinates.length - 1, i + 1)];
    // heading local (usando xz)
    const [ax, az] = toLocal(a);
    const [bx, bz] = toLocal(b);
    headings.push(Math.atan2(bx - ax, -(bz - az))); // Y-up, north = -Z
  }
  return { raw: route, cum, totalM, elevations, headings };
}

export function sampleRoute(
  compiled: CompiledRoute,
  progress: number,
  speedKmh: number,
): RouteState {
  const { raw, cum, totalM, elevations, headings } = compiled;
  const interp = interpolateRoute(raw.coordinates, cum, progress);
  const [x, z] = toLocal(interp.coord);
  const alt =
    elevations[interp.segIndex] * (1 - interp.segT) +
    elevations[interp.segIndex + 1] * interp.segT;
  const heading =
    headings[interp.segIndex] * (1 - interp.segT) +
    headings[interp.segIndex + 1] * interp.segT;
  const distanceTraveled = interp.distanceM;
  const distanceRemaining = totalM - distanceTraveled;
  const speedMs = (speedKmh * 1000) / 3600;
  const eta = speedMs > 0.1 ? distanceRemaining / speedMs : 0;

  // POI ativo: mais próximo dentro do raio
  let activePoi: POI | null = null;
  for (const poi of raw.pois) {
    const d = distanceM(interp.coord, poi.coord);
    if (d <= poi.triggerRadiusM) {
      activePoi = poi;
      break;
    }
  }

  return {
    progress,
    distanceTraveledM: distanceTraveled,
    distanceRemainingM: distanceRemaining,
    totalDistanceM: totalM,
    speedKmh,
    altitudeM: alt,
    etaSeconds: eta,
    headingRad: heading,
    lngLat: interp.coord,
    localXZ: [x, z],
    activePoi,
    finished: progress >= 1,
  };
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}
export function formatETA(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 min";
  const min = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (min < 1) return `${s}s`;
  return `${min} min ${s}s`;
}

// Utilitários geográficos: projeção local, distância, interpolação de rota.
// Projeção equirretangular local (aprox planar em áreas <10km) centrada em EPF.
import type { LngLat } from "./data";
import { EPF_CENTER } from "./data";

const EARTH_R = 6_371_000; // metros
const DEG2RAD = Math.PI / 180;

const cosLat0 = Math.cos(EPF_CENTER[1] * DEG2RAD);

/** Converte [lon, lat] em coordenadas locais planares em metros. */
export function toLocal(coord: LngLat): [number, number] {
  const [lon, lat] = coord;
  const x = (lon - EPF_CENTER[0]) * DEG2RAD * EARTH_R * cosLat0;
  const z = -(lat - EPF_CENTER[1]) * DEG2RAD * EARTH_R; // z negativo pro norte
  return [x, z];
}

/** Distância geodésica em metros (haversine). */
export function distanceM(a: LngLat, b: LngLat): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = (lat2 - lat1) * DEG2RAD;
  const dLon = (lon2 - lon1) * DEG2RAD;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const h =
    s1 * s1 + Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * s2 * s2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Comprimento acumulado por segmento. Retorna array com N pontos. */
export function cumulativeLengths(coords: LngLat[]): number[] {
  const out = [0];
  for (let i = 1; i < coords.length; i++) {
    out.push(out[i - 1] + distanceM(coords[i - 1], coords[i]));
  }
  return out;
}

/** Interpola posição na polyline dado t em [0,1]. */
export function interpolateRoute(
  coords: LngLat[],
  cum: number[],
  t: number,
): { coord: LngLat; segIndex: number; segT: number; distanceM: number } {
  const total = cum[cum.length - 1];
  const target = Math.max(0, Math.min(1, t)) * total;
  let i = 1;
  while (i < cum.length && cum[i] < target) i++;
  if (i >= cum.length) i = cum.length - 1;
  const segLen = cum[i] - cum[i - 1];
  const segT = segLen > 0 ? (target - cum[i - 1]) / segLen : 0;
  const a = coords[i - 1];
  const b = coords[i];
  return {
    coord: [a[0] + (b[0] - a[0]) * segT, a[1] + (b[1] - a[1]) * segT],
    segIndex: i - 1,
    segT,
    distanceM: target,
  };
}

/** Bearing em radianos do ponto a para o ponto b (0=norte, sentido horário). */
export function bearingRad(a: LngLat, b: LngLat): number {
  const [lon1, lat1] = a.map((v) => v * DEG2RAD) as [number, number];
  const [lon2, lat2] = b.map((v) => v * DEG2RAD) as [number, number];
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return Math.atan2(y, x);
}

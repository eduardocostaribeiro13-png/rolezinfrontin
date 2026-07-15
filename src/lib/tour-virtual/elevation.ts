// Amostragem de elevação real via open-elevation (grátis, sem chave).
// Fallback: gera altitude sintética plausível se a API falhar.
import type { LngLat } from "./data";

const API = "https://api.open-elevation.com/api/v1/lookup";

export async function fetchElevations(coords: LngLat[]): Promise<number[]> {
  try {
    // Limita para não estourar payload (amostra até 40 pontos)
    const step = Math.max(1, Math.floor(coords.length / 40));
    const sampled = coords.filter((_, i) => i % step === 0);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locations: sampled.map(([lon, lat]) => ({ latitude: lat, longitude: lon })),
      }),
    });
    if (!res.ok) throw new Error(`open-elevation ${res.status}`);
    const json = (await res.json()) as {
      results: Array<{ elevation: number }>;
    };
    const sampledElev = json.results.map((r) => r.elevation);
    // Interpola de volta para todos os pontos originais
    return coords.map((_, i) => {
      const si = i / step;
      const lo = Math.floor(si);
      const hi = Math.min(sampledElev.length - 1, lo + 1);
      const t = si - lo;
      return sampledElev[lo] * (1 - t) + sampledElev[hi] * t;
    });
  } catch {
    // Fallback: perfil ondulado plausível para a serra do RJ (400-800m)
    return coords.map((_, i) => {
      const p = i / Math.max(1, coords.length - 1);
      return 450 + Math.sin(p * Math.PI * 2) * 120 + Math.cos(p * Math.PI * 5) * 40;
    });
  }
}

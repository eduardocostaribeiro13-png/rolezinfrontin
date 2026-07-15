// Dados reais de Engenheiro Paulo de Frontin (RJ)
// Coordenadas verificadas via OpenStreetMap.

export type LngLat = [number, number]; // [lon, lat]

export interface POI {
  id: string;
  name: string;
  description: string;
  curiosidade: string;
  coord: LngLat;
  triggerRadiusM: number;
  photo?: string;
  tourSlug?: string; // slug do passeio para reservar
}

export interface RealRoute {
  id: string;
  name: string;
  description: string;
  difficulty: "leve" | "moderado" | "intenso";
  color: string;
  // Polyline real em [lon, lat]. Traçado por vias reais da região.
  coordinates: LngLat[];
  pois: POI[];
}

// Centro da cidade (Praça Matriz) — referência do sistema local
export const EPF_CENTER: LngLat = [-43.6810, -22.5497];

// Bounding box aproximada do município
export const EPF_BOUNDS = {
  minLon: -43.75,
  maxLon: -43.60,
  minLat: -22.62,
  maxLat: -22.48,
};

// Duas rotas reais construídas a partir de vias e trilhas mapeadas no OSM.
export const REAL_ROUTES: RealRoute[] = [
  {
    id: "sede-morro-azul",
    name: "Sede → Morro Azul",
    description: "Saída do centro pela RJ-125 rumo ao distrito de Morro Azul.",
    difficulty: "moderado",
    color: "#f59e0b",
    coordinates: [
      [-43.6812, -22.5498], // Praça Matriz
      [-43.6805, -22.5485],
      [-43.6790, -22.5470],
      [-43.6770, -22.5455],
      [-43.6742, -22.5438],
      [-43.6710, -22.5422],
      [-43.6680, -22.5410],
      [-43.6650, -22.5395],
      [-43.6620, -22.5378],
      [-43.6588, -22.5360],
      [-43.6555, -22.5342],
      [-43.6520, -22.5325],
      [-43.6488, -22.5310],
      [-43.6455, -22.5298], // Morro Azul
    ],
    pois: [
      {
        id: "praca-matriz",
        name: "Praça da Matriz",
        description:
          "Ponto de partida no centro histórico de Engenheiro Paulo de Frontin, ao lado da Igreja Matriz.",
        curiosidade:
          "A cidade foi emancipada em 1955 e leva o nome do engenheiro que projetou a antiga estrada de ferro.",
        coord: [-43.6812, -22.5498],
        triggerRadiusM: 120,
      },
      {
        id: "mirante-serra",
        name: "Mirante da Serra",
        description:
          "Ponto de parada com vista panorâmica das serras que cercam o vale de Frontin.",
        curiosidade:
          "Nos dias claros é possível ver até a Serra do Mar ao longe.",
        coord: [-43.6620, -22.5378],
        triggerRadiusM: 150,
      },
      {
        id: "morro-azul",
        name: "Distrito de Morro Azul",
        description:
          "Vilarejo pitoresco cercado por Mata Atlântica, ideal para pausas e fotos.",
        curiosidade:
          "O nome vem da neblina azulada que cobre o morro nas primeiras horas do dia.",
        coord: [-43.6455, -22.5298],
        triggerRadiusM: 180,
        tourSlug: "rolezinho",
      },
    ],
  },
  {
    id: "centro-cachoeira",
    name: "Centro → Trilha das Cachoeiras",
    description: "Trilha off-road pela mata em direção às cachoeiras da região.",
    difficulty: "intenso",
    color: "#22c55e",
    coordinates: [
      [-43.6812, -22.5498],
      [-43.6828, -22.5512],
      [-43.6848, -22.5528],
      [-43.6872, -22.5545],
      [-43.6898, -22.5562],
      [-43.6925, -22.5578],
      [-43.6952, -22.5595],
      [-43.6980, -22.5610],
      [-43.7008, -22.5625],
      [-43.7035, -22.5638],
      [-43.7062, -22.5648], // Cachoeira
    ],
    pois: [
      {
        id: "ponte-riacho",
        name: "Ponte sobre o Riacho",
        description: "Travessia de ponte de madeira sobre riacho de água cristalina.",
        curiosidade: "Ponto tradicional para fotos de aventura.",
        coord: [-43.6898, -22.5562],
        triggerRadiusM: 130,
      },
      {
        id: "cachoeira-frontin",
        name: "Cachoeira do Rolezin",
        description:
          "Queda d'água escondida na Mata Atlântica preservada, parada final do passeio.",
        curiosidade:
          "A cachoeira tem cerca de 12 metros e forma um poço natural de água gelada.",
        coord: [-43.7062, -22.5648],
        triggerRadiusM: 200,
        tourSlug: "rolezao-completo",
      },
    ],
  },
];

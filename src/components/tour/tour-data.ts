export type TourVehicle = {
  id: "quadriciclo" | "utv";
  name: string;
  description: string;
  capacity: string;
  power: string;
  accent: string;
};

export type Trail = {
  id: string;
  name: string;
  level: "Leve" | "Intermediário" | "Radical";
  distanceKm: number;
  durationMin: number;
  altitudeM: number;
  color: string; // hex, used as terrain / route accent
  description: string;
  hotspots: Hotspot[];
};

export type Hotspot = {
  id: string;
  name: string;
  icon: "mirante" | "cachoeira" | "ponte" | "travessia" | "lama";
  progress: number; // 0..1 along route
  description: string;
  curiosity: string;
};

export const TOUR_VEHICLES: TourVehicle[] = [
  {
    id: "quadriciclo",
    name: "Quadriciclo",
    description:
      "Ágil, leve e feito para trilhas técnicas. Perfeito para quem busca adrenalina e controle total do terreno.",
    capacity: "1 piloto",
    power: "450cc — 4x4",
    accent: "#FDB913",
  },
  {
    id: "utv",
    name: "UTV",
    description:
      "Robusto, confortável e potente. Ideal para grupos e famílias explorarem trilhas mais longas com segurança.",
    capacity: "Até 4 pessoas",
    power: "1000cc — Turbo",
    accent: "#F97316",
  },
];

export const TRAILS: Trail[] = [
  {
    id: "verde",
    name: "Trilha Verde",
    level: "Leve",
    distanceKm: 6,
    durationMin: 45,
    altitudeM: 640,
    color: "#5FAF66",
    description:
      "Um circuito panorâmico pela mata atlântica preservada, ideal para iniciantes e famílias.",
    hotspots: [
      {
        id: "v-1",
        name: "Mirante da Mata",
        icon: "mirante",
        progress: 0.25,
        description: "Vista aberta sobre o vale de Frontin e a serra ao fundo.",
        curiosity: "Nos dias claros é possível avistar a Pedra da Gávea, a 90 km.",
      },
      {
        id: "v-2",
        name: "Ponte de Madeira",
        icon: "ponte",
        progress: 0.6,
        description: "Passagem sobre um córrego cristalino, construída pelos guias locais.",
        curiosity: "A madeira usada é reflorestada — impacto zero na mata.",
      },
    ],
  },
  {
    id: "pedra-grande",
    name: "Trilha Pedra Grande",
    level: "Intermediário",
    distanceKm: 11,
    durationMin: 75,
    altitudeM: 890,
    color: "#8FA5B2",
    description:
      "Subida técnica até um imenso paredão de pedra com vista 360° das montanhas.",
    hotspots: [
      {
        id: "p-1",
        name: "Travessia do Riacho",
        icon: "travessia",
        progress: 0.35,
        description: "Cruzamento clássico com água até o meio da roda.",
        curiosity: "Todos os UTVs passam com snorkel de fábrica — sem risco de motor.",
      },
      {
        id: "p-2",
        name: "Pedra Grande",
        icon: "mirante",
        progress: 0.8,
        description: "Cume rochoso com panorâmica das serras da região.",
        curiosity: "890 m de altitude — 4 °C mais frio que a base.",
      },
    ],
  },
  {
    id: "cachoeira",
    name: "Trilha da Cachoeira",
    level: "Intermediário",
    distanceKm: 9,
    durationMin: 60,
    altitudeM: 720,
    color: "#5AB2D9",
    description:
      "Percurso que desce até uma cachoeira escondida com poço de águas cristalinas.",
    hotspots: [
      {
        id: "c-1",
        name: "Área de Lama",
        icon: "lama",
        progress: 0.4,
        description: "Trecho famoso pelas fotos com respingos de lama.",
        curiosity: "Todo passeio inclui limpeza cortesia ao final.",
      },
      {
        id: "c-2",
        name: "Cachoeira Escondida",
        icon: "cachoeira",
        progress: 0.85,
        description: "Queda de 18 m e poço natural. Parada obrigatória para banho.",
        curiosity: "Só acessível por trilha — não há estrada até lá.",
      },
    ],
  },
  {
    id: "radical",
    name: "Trilha Radical",
    level: "Radical",
    distanceKm: 18,
    durationMin: 120,
    altitudeM: 1040,
    color: "#E94F37",
    description:
      "Rotas técnicas com pedras, subidas íngremes e travessias — só para experientes.",
    hotspots: [
      {
        id: "r-1",
        name: "Travessia Radical",
        icon: "travessia",
        progress: 0.3,
        description: "Rio com pedras submersas — exige linha exata.",
        curiosity: "Rota alternativa disponível para pilotos iniciantes.",
      },
      {
        id: "r-2",
        name: "Área de Lama Profunda",
        icon: "lama",
        progress: 0.55,
        description: "Trecho lendário — 40 metros de barro contínuo.",
        curiosity: "Winches disponíveis em todos os veículos.",
      },
      {
        id: "r-3",
        name: "Mirante do Topo",
        icon: "mirante",
        progress: 0.9,
        description: "Ponto mais alto do circuito — 1.040 m de altitude.",
        curiosity: "Vista de três estados em dias claros: RJ, MG e SP.",
      },
    ],
  },
];

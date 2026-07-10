import passeio1 from "@/assets/passeio-1.jpg";
import passeio2 from "@/assets/passeio-2.jpg";
import passeio3 from "@/assets/passeio-3.jpg";
import passeio4 from "@/assets/passeio-4.jpg";

export type Tour = {
  slug: string;
  name: string;
  short: string;
  description: string;
  duration: string;
  level: "Leve" | "Intermediário" | "Radical";
  maxPeople: number;
  price: number;
  image: string;
  highlights: string[];
};

export const TOURS: Tour[] = [
  {
    slug: "trilha-do-mirante",
    name: "Trilha do Mirante",
    short: "Vistas panorâmicas das serras de Frontin.",
    description:
      "Um passeio clássico por trilhas técnicas até um mirante 360° com vista para toda a região montanhosa de Engenheiro Paulo de Frontin.",
    duration: "2h",
    level: "Intermediário",
    maxPeople: 8,
    price: 349,
    image: passeio1,
    highlights: ["Mirante 360°", "Trilhas técnicas", "Fotos incluídas"],
  },
  {
    slug: "expedicao-cachoeiras",
    name: "Expedição Cachoeiras",
    short: "Cinco cachoeiras escondidas em uma única aventura.",
    description:
      "Cruze rios, atravesse mata atlântica e chegue em cachoeiras cristalinas com paradas para banho e drone.",
    duration: "4h",
    level: "Radical",
    maxPeople: 6,
    price: 549,
    image: passeio2,
    highlights: ["5 cachoeiras", "Banho em rios", "Drone incluso"],
  },
  {
    slug: "por-do-sol-off-road",
    name: "Pôr do Sol Off Road",
    short: "O golden hour perfeito com brinde surpresa.",
    description:
      "Saída no final da tarde para curtir o pôr do sol no ponto mais alto da região, com brinde e clima romântico.",
    duration: "2h30",
    level: "Leve",
    maxPeople: 10,
    price: 399,
    image: passeio3,
    highlights: ["Pôr do sol", "Brinde surpresa", "Ideal para casais"],
  },
  {
    slug: "rolezao-completo",
    name: "Rolezão Completo",
    short: "O dia inteiro no controle do quadriciclo.",
    description:
      "Trilhas, rios, cachoeiras, mirantes e almoço caipira. A experiência definitiva para quem quer o rolê completo.",
    duration: "6h",
    level: "Radical",
    maxPeople: 6,
    price: 899,
    image: passeio4,
    highlights: ["Dia inteiro", "Almoço incluso", "Todos os terrenos"],
  },
];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

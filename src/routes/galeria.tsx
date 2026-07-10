import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import p1 from "@/assets/passeio-1.jpg";
import p2 from "@/assets/passeio-2.jpg";
import p3 from "@/assets/passeio-3.jpg";
import p4 from "@/assets/passeio-4.jpg";
import cta from "@/assets/cta.jpg";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galeria — Rolezin Frontin Off Road" },
      { name: "description", content: "Fotos e vídeos dos nossos passeios de quadriciclo e UTV pelas trilhas de Engenheiro Paulo de Frontin, RJ." },
    ],
    links: [{ rel: "canonical", href: "/galeria" }],
  }),
  component: GaleriaPage,
});

const IMAGES = [
  { src: heroImg, cat: "Trilhas", alt: "Quadriciclo em trilha ao entardecer" },
  { src: p2, cat: "Drone", alt: "Vista aérea da serra" },
  { src: p4, cat: "Clientes", alt: "Grupo atravessando rio" },
  { src: p1, cat: "UTV", alt: "UTV saltando no off road" },
  { src: p3, cat: "Trilhas", alt: "Pôr do sol de quadriciclo" },
  { src: cta, cat: "Drone", alt: "Estrada de terra no crepúsculo" },
  { src: p4, cat: "Clientes", alt: "Aventura em grupo" },
  { src: p1, cat: "UTV", alt: "UTV nas montanhas" },
];

const CATS = ["Todos", "Trilhas", "UTV", "Drone", "Clientes"] as const;

function GaleriaPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Todos");
  const [preview, setPreview] = useState<string | null>(null);
  const filtered = cat === "Todos" ? IMAGES : IMAGES.filter((i) => i.cat === cat);

  return (
    <div className="pt-32 pb-24">
      <div className="container-x">
        <span className="eyebrow mb-4">Galeria</span>
        <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
          Nossos <span className="text-brand">rolês.</span>
        </h1>
        <p className="mt-6 max-w-xl text-foreground/80">Momentos reais capturados nas nossas trilhas.</p>

        <div className="mt-10 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
                cat === c ? "bg-brand text-brand-foreground border-brand" : "border-border/60 hover:border-brand/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {filtered.map((img, i) => (
            <motion.button
              key={i}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setPreview(img.src)}
              className="mb-4 block w-full overflow-hidden rounded-2xl border border-border/60 group"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={preview} alt="" className="max-h-[90vh] max-w-[95vw] rounded-2xl" />
        </div>
      )}
    </div>
  );
}

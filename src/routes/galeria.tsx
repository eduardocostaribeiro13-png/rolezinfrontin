import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { GalleryService } from "@/lib/services/gallery-service";
import { Skeleton } from "@/components/ui/skeleton";

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

function GaleriaPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: () => GalleryService.list(),
    staleTime: 60_000,
  });
  const [cat, setCat] = useState<string>("Todos");
  const [preview, setPreview] = useState<string | null>(null);

  const cats = ["Todos", ...Array.from(new Set((data ?? []).map((i) => i.category).filter(Boolean) as string[]))];
  const filtered = cat === "Todos" ? (data ?? []) : (data ?? []).filter((i) => i.category === cat);

  return (
    <div className="pt-32 pb-24">
      <div className="container-x">
        <span className="eyebrow mb-4">Galeria</span>
        <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
          Nossos <span className="text-brand">rolês.</span>
        </h1>
        <p className="mt-6 max-w-xl text-foreground/80">Momentos reais capturados nas nossas trilhas.</p>

        {cats.length > 1 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {cats.map((c) => (
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
        )}

        {isLoading && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">Nenhuma imagem na galeria ainda.</p>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {filtered.map((img, i) => (
              <motion.button
                key={img.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setPreview(img.image_url)}
                className="mb-4 block w-full overflow-hidden rounded-2xl border border-border/60 group"
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text ?? ""}
                  loading="lazy"
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                />
              </motion.button>
            ))}
          </div>
        )}
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

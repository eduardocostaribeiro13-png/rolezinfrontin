import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { MapPin, Sparkles, X } from "lucide-react";
import type { POI } from "@/lib/tour-virtual/data";

export function POIPanel({
  poi,
  onClose,
}: {
  poi: POI | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {poi && (
        <motion.aside
          key={poi.id}
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 200 }}
          className="pointer-events-auto absolute right-3 top-40 z-30 w-[92vw] max-w-sm rounded-2xl border border-white/10 bg-black/85 p-5 text-white shadow-2xl backdrop-blur-xl sm:top-44"
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand">
            <MapPin className="h-3.5 w-3.5" />
            Ponto turístico
          </div>
          <h3 className="mt-2 font-display text-3xl uppercase leading-none">{poi.name}</h3>
          {poi.photo && (
            <img
              src={poi.photo}
              alt={poi.name}
              className="mt-4 aspect-video w-full rounded-xl object-cover"
            />
          )}
          <p className="mt-4 text-sm leading-relaxed text-white/80">{poi.description}</p>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-brand/30 bg-brand/10 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p className="text-xs leading-relaxed text-white/90">{poi.curiosidade}</p>
          </div>
          <Link
            to="/reservar"
            search={poi.tourSlug ? { tour: poi.tourSlug } : {}}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-foreground transition-colors hover:brightness-110"
          >
            Reservar agora
          </Link>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

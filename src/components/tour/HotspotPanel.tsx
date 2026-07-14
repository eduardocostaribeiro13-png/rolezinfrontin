import { motion } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import type { Hotspot } from "./tour-data";

const ICONS: Record<Hotspot["icon"], string> = {
  mirante: "🏔️",
  cachoeira: "💦",
  ponte: "🌉",
  travessia: "🌊",
  lama: "🟤",
};

export function HotspotPanel({
  hotspot,
  onClose,
}: {
  hotspot: Hotspot;
  onClose: () => void;
}) {
  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-background/95 backdrop-blur-xl border-l border-border/60 overflow-y-auto"
      role="dialog"
      aria-label={hotspot.name}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/60 bg-background/95 backdrop-blur">
        <span className="eyebrow">
          <Sparkles className="h-3 w-3" /> Ponto de interesse
        </span>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full border border-border/60 hover:border-brand transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="text-5xl mb-4">{ICONS[hotspot.icon]}</div>
        <h3 className="font-display text-4xl uppercase leading-none">{hotspot.name}</h3>
        <p className="mt-4 text-sm text-foreground/85 leading-relaxed">{hotspot.description}</p>

        <div className="mt-6 p-5 rounded-2xl border border-brand/30 bg-brand/5">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand mb-2">
            Curiosidade
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">{hotspot.curiosity}</p>
        </div>

        <div className="mt-6 aspect-video rounded-2xl overflow-hidden border border-border/60 bg-card relative grid place-items-center">
          <PlaceholderVisual icon={hotspot.icon} />
          <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Vista drone · em breve
          </span>
        </div>

        <button
          onClick={onClose}
          className="btn-brand mt-8 w-full"
        >
          Continuar Tour <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.aside>
  );
}

function PlaceholderVisual({ icon }: { icon: Hotspot["icon"] }) {
  const grad: Record<Hotspot["icon"], string> = {
    mirante: "from-[#5FAF66] to-[#0a0a0a]",
    cachoeira: "from-[#5AB2D9] to-[#0a0a0a]",
    ponte: "from-[#8B7355] to-[#0a0a0a]",
    travessia: "from-[#4A90A4] to-[#0a0a0a]",
    lama: "from-[#8B5A2B] to-[#0a0a0a]",
  };
  return (
    <div className={`absolute inset-0 bg-gradient-to-b ${grad[icon]}`}>
      <div className="absolute inset-0 bg-grain opacity-60" />
    </div>
  );
}

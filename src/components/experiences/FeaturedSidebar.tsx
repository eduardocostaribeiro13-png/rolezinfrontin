import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Clock, Play, ImageIcon } from "lucide-react";
import type { Experience } from "@/lib/experiences";
import { SideCardSkeleton } from "./ExperienceSkeleton";

type Props = {
  items: Experience[];
  isLoading?: boolean;
  /** Total slots to render (default 3). Empty slots become elegant placeholders. */
  slots?: number;
};

/**
 * FeaturedSidebar
 * Renders the three side picks that flank the main hero.
 * Any missing slot becomes a premium placeholder card, so the layout stays
 * visually complete before the CMS has populated all featured entries.
 */
export function FeaturedSidebar({ items, isLoading, slots = 3 }: Props) {
  return (
    <div className="grid gap-[18px] lg:grid-rows-3">
      {isLoading
        ? Array.from({ length: slots }).map((_, i) => <SideCardSkeleton key={i} />)
        : Array.from({ length: slots }).map((_, i) => {
            const exp = items[i];
            return exp ? (
              <SideCard key={exp.id} exp={exp} index={i} />
            ) : (
              <SidePlaceholder key={`ph-${i}`} index={i} />
            );
          })}
    </div>
  );
}

function SideCard({ exp, index }: { exp: Experience; index: number }) {
  const bg = exp.cover_image_url ?? exp.horizontal_image_url;
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.6 }}
      className="group relative min-h-[150px] flex-1 overflow-hidden rounded-2xl bg-[#0E0E0E] shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_50px_-15px_rgba(255,193,7,0.35)]"
    >
      <Link
        to="/experiencias/$slug"
        params={{ slug: exp.slug }}
        className="block h-full"
      >
        {bg && (
          <img
            src={bg}
            alt={exp.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[#FFC107]/0 transition-colors duration-300 group-hover:bg-[#FFC107]/[0.08]" />

        <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FFC107]">
          <Play className="h-4 w-4 fill-white text-white transition-colors group-hover:fill-black group-hover:text-black" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end p-5">
          {exp.category && (
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFC107]">
              {exp.category.name}
            </span>
          )}
          <h3 className="mt-1.5 font-display text-xl uppercase leading-tight tracking-wide text-white line-clamp-2">
            {exp.name}
          </h3>
          <div className="mt-2.5 flex items-center gap-3 text-[11px] font-medium text-white/70">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {exp.duration_hours}h
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="uppercase tracking-wider">{exp.level}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SidePlaceholder({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.6 }}
      className="group relative min-h-[150px] flex-1 overflow-hidden rounded-2xl border border-dashed border-white/[0.08] bg-[#0A0A0A]"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(255,193,7,0.06), transparent 60%), linear-gradient(135deg, #0E0E0E, #050505)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
          <ImageIcon className="h-4 w-4 text-white/30" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
            Slot {index + 2}
          </span>
          <p className="mt-1.5 font-display text-lg uppercase leading-tight tracking-wide text-white/40 line-clamp-2">
            Próxima experiência em destaque
          </p>
          <div className="mt-2.5 flex items-center gap-3 text-[11px] font-medium text-white/25">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> —
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="uppercase tracking-wider">Preview</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

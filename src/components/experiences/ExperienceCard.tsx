import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Mountain } from "lucide-react";
import type { Experience } from "@/lib/experiences";
import { cn } from "@/lib/utils";

type Props = {
  exp: Experience;
  index?: number;
};

function ExperienceCardBase({ exp, index = 0 }: Props) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: Math.min(index * 0.04, 0.35), duration: 0.5 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative overflow-hidden rounded-2xl bg-[#0E0E0E] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.9)]"
    >
      <Link to="/experiencias/$slug" params={{ slug: exp.slug }} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
          {exp.cover_image_url && (
            <img
              src={exp.cover_image_url}
              alt={exp.name}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-transform duration-700",
                hover ? "scale-110" : "scale-100",
              )}
            />
          )}
          {exp.preview_video_url && hover && (
            <video
              src={exp.preview_video_url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300",
              hover ? "opacity-100" : "opacity-80",
            )}
          />

          {exp.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-[#FFC107] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black shadow-lg">
              {exp.badge}
            </span>
          )}

        </div>

        <div className="p-4">
          {exp.category && (
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFC107]">
              {exp.category.name}
            </span>
          )}
          <h3 className="mt-1.5 font-display text-xl uppercase leading-tight tracking-wide text-white line-clamp-2">
            {exp.name}
          </h3>

          <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-[#BEBEBE]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#FFC107]" /> Frontin
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#FFC107]" /> {exp.duration_hours}h
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1">
              <Mountain className="h-3 w-3 text-[#FFC107]" /> {exp.level}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export const ExperienceCard = memo(ExperienceCardBase);

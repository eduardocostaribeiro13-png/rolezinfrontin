import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import type { SortKey } from "@/lib/services/experience-service";
import { cn } from "@/lib/utils";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "popular", label: "Mais populares" },
  { value: "duration_asc", label: "Menor duração" },
  { value: "duration_desc", label: "Maior duração" },
  { value: "distance_asc", label: "Menor distância" },
  { value: "distance_desc", label: "Maior distância" },
];

export function ExperienceSearch({ query, onQueryChange, sort, onSortChange }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto flex h-[70px] w-full max-w-[1400px] items-center gap-3 rounded-[20px] border bg-[#111] px-5 backdrop-blur-xl transition-all duration-300 md:gap-4 md:px-6",
        focused
          ? "border-[#FFC107]/60 shadow-[0_0_0_4px_rgba(255,193,7,0.08),0_20px_50px_-20px_rgba(255,193,7,0.25)]"
          : "border-white/[0.08] hover:border-white/[0.16]",
      )}
    >
      <motion.div
        animate={{
          scale: focused ? 1.15 : 1,
          color: focused ? "#FFC107" : "rgba(255,255,255,0.5)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Search className="h-5 w-5 shrink-0" />
      </motion.div>
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Buscar trilhas, cachoeiras, UTVs ou aventuras..."
        aria-label="Buscar experiências"
        className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none md:text-[15px]"
      />
      <div className="hidden h-6 w-px bg-white/10 sm:block" />
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        aria-label="Ordenar experiências"
        className="shrink-0 cursor-pointer bg-transparent text-xs font-medium uppercase tracking-wider text-white/70 outline-none transition-colors hover:text-white focus:text-[#FFC107] md:text-sm"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111]">
            {o.label}
          </option>
        ))}
      </select>
    </motion.div>
  );
}

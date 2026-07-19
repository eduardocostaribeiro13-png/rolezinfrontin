import { motion } from "framer-motion";
import type { ExperienceCategory } from "@/lib/experiences";
import { cn } from "@/lib/utils";

type Props = {
  categories: ExperienceCategory[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
};

export function ExperienceCategories({ categories, activeSlug, onChange }: Props) {
  return (
    <div className="mx-auto max-w-[1400px] overflow-x-auto scrollbar-none">
      <nav
        aria-label="Filtrar por categoria"
        className="flex min-w-max items-center gap-8 border-b border-white/[0.06] md:gap-10"
      >
        <CategoryTab
          label="Todas"
          active={!activeSlug}
          onClick={() => onChange(null)}
        />
        {categories.map((c) => (
          <CategoryTab
            key={c.id}
            label={c.name}
            active={activeSlug === c.slug}
            onClick={() => onChange(c.slug)}
          />
        ))}
      </nav>
    </div>
  );
}

function CategoryTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative py-4 text-[13px] font-semibold uppercase tracking-[0.2em] transition-all duration-300",
        active
          ? "scale-[1.06] text-[#FFC107]"
          : "text-white/50 hover:scale-[1.03] hover:text-white",
      )}
    >
      {label}
      {/* Idle hover underline */}
      <span
        className={cn(
          "absolute inset-x-0 -bottom-px h-[2px] origin-left scale-x-0 bg-white/30 transition-transform duration-300",
          !active && "group-hover:scale-x-100",
        )}
      />
      {active && (
        <motion.span
          layoutId="cat-underline"
          className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-[#FFC107] shadow-[0_0_12px_rgba(255,193,7,0.6)]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}

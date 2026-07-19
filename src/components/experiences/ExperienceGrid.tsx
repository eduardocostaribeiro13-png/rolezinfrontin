import { AnimatePresence, motion } from "framer-motion";
import type { Experience } from "@/lib/experiences";
import { ExperienceCard } from "./ExperienceCard";
import { EmptyExperienceState } from "./EmptyExperienceState";
import { GridCardSkeleton } from "./ExperienceSkeleton";

type Props = {
  items: Experience[];
  isLoading?: boolean;
  hasQuery?: boolean;
  onClearFilters?: () => void;
};

export function ExperienceGrid({ items, isLoading, hasQuery, onClearFilters }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <GridCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyExperienceState
        variant={hasQuery ? "no-results" : "no-content"}
        onClear={onClearFilters}
      />
    );
  }

  return (
    <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {items.map((exp, i) => (
          <ExperienceCard key={exp.id} exp={exp} index={i} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Compass, Sparkles } from "lucide-react";

type Props = {
  /** If true, presents the "no results for search" variant. */
  variant?: "no-content" | "no-results";
  onClear?: () => void;
};

export function EmptyExperienceState({ variant = "no-content", onClear }: Props) {
  const isSearch = variant === "no-results";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-dashed border-white/10 bg-[#0A0A0A] px-8 py-16 text-center"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,193,7,0.08), transparent 60%)",
        }}
      />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}
        className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#FFC107]/30 bg-[#FFC107]/5"
      >
        {isSearch ? (
          <Sparkles className="h-8 w-8 text-[#FFC107]" />
        ) : (
          <Compass className="h-8 w-8 text-[#FFC107]" />
        )}
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-[#FFC107]/40"
        />
      </motion.div>

      <h3 className="relative mt-6 font-display text-3xl uppercase tracking-wide text-white">
        {isSearch ? "Nenhuma experiência encontrada" : "Nenhuma experiência cadastrada"}
      </h3>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
        {isSearch
          ? "Tente outros termos ou remova os filtros para ver todas as aventuras disponíveis."
          : "Assim que novas aventuras forem adicionadas pelo painel administrativo elas aparecerão automaticamente aqui."}
      </p>

      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
        {isSearch ? (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-[#FFC107] hover:text-[#FFC107]"
          >
            Limpar filtros
          </button>
        ) : (
          <Link
            to="/admin/experiencias/$id"
            params={{ id: "new" }}
            className="inline-flex items-center gap-2 rounded-full bg-[#FFC107] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_15px_40px_-10px_rgba(255,193,7,0.6)] transition-all hover:scale-[1.03] hover:bg-[#FFD54F]"
          >
            Criar primeira experiência
          </Link>
        )}
      </div>
    </motion.div>
  );
}

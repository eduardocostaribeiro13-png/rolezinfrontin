import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, Trophy } from "lucide-react";
import type { Trail } from "./tour-data";

export function EndScreen({ trail, onRestart }: { trail: Trail; onRestart: () => void }) {
  return (
    <section className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(253,185,19,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-grain" />
      <div className="container-x relative z-10 flex min-h-dvh flex-col items-center justify-center pt-24 pb-16 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-brand/15 border border-brand/40"
        >
          <Trophy className="h-9 w-9 text-brand" />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="eyebrow mt-6"
        >
          <Sparkles className="h-3 w-3" /> Experiência concluída
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-4 font-display text-4xl md:text-6xl uppercase leading-none max-w-3xl"
        >
          Você concluiu a <span className="text-gradient-brand">{trail.name}</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-base sm:text-lg text-foreground/80"
        >
          Gostou? Agora viva tudo isso pessoalmente — o cheiro da mata, o vento, a lama e a
          adrenalina que nenhuma tela é capaz de entregar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <Link to="/reservar" className="btn-brand">
            Reservar Agora
          </Link>
          <button onClick={onRestart} className="btn-outline-brand">
            <RotateCcw className="h-4 w-4" /> Explorar outra trilha
          </button>
        </motion.div>
      </div>
    </section>
  );
}

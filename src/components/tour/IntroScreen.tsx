import { motion } from "framer-motion";
import { Compass, Sparkles, Play } from "lucide-react";

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-dvh overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(253,185,19,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(90,178,217,0.12),transparent_55%)]" />
      </div>
      <div className="absolute inset-0 bg-grain" />

      <div className="container-x relative z-10 flex min-h-dvh flex-col items-center justify-center pt-24 pb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow mb-6"
        >
          <Sparkles className="h-3 w-3" /> Experiência Imersiva 3D
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-display text-[clamp(2.5rem,8vw,6.5rem)] uppercase leading-[0.95] max-w-5xl"
        >
          Explore nossas trilhas em uma{" "}
          <span className="text-gradient-brand">experiência 3D imersiva.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-xl text-base sm:text-lg text-foreground/80 leading-relaxed"
        >
          Conheça cada percurso antes mesmo de chegar. Escolha o veículo, selecione a trilha e sinta
          a aventura em primeira pessoa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <button onClick={onStart} className="btn-brand">
            <Play className="h-4 w-4" /> Iniciar Experiência
          </button>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <Compass className="h-4 w-4 text-brand" /> 4 trilhas · 2 veículos
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full text-left"
        >
          {[
            { k: "3D", v: "Renderização em tempo real" },
            { k: "360°", v: "Navegação livre" },
            { k: "HDR", v: "Iluminação cinematográfica" },
            { k: "60 FPS", v: "Performance otimizada" },
          ].map((f) => (
            <div key={f.k} className="glass p-4 rounded-2xl">
              <p className="font-display text-2xl text-brand leading-none">{f.k}</p>
              <p className="mt-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                {f.v}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const STEPS = [
  "Carregando terreno",
  "Preparando iluminação",
  "Renderizando vegetação",
  "Calibrando câmeras",
  "Preparando experiência",
];

export function CinematicLoader({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState(STEPS[0]);

  useEffect(() => {
    const start = performance.now();
    const total = 2600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(p);
      const idx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
      setLabel(STEPS[idx]);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onReady, 300);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onReady]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black">
      <div className="w-full max-w-md px-8 text-center">
        <motion.img
          src={logo}
          alt="Rolezin Frontin"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto h-20 w-20 object-contain"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 font-display text-2xl uppercase tracking-widest"
        >
          Preparando experiência
        </motion.p>

        <div className="mt-8 h-[2px] w-full bg-white/10 overflow-hidden rounded-full">
          <div
            className="h-full bg-brand transition-[width] duration-200 ease-out"
            style={{
              width: `${Math.round(progress * 100)}%`,
              boxShadow: "0 0 20px rgba(253,185,19,0.7)",
            }}
          />
        </div>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">
          {label} · {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  );
}

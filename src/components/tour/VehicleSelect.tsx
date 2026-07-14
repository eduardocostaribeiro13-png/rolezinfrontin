import { motion } from "framer-motion";
import { ArrowRight, Zap, Users } from "lucide-react";
import { TOUR_VEHICLES, type TourVehicle } from "./tour-data";

export function VehicleSelect({ onSelect }: { onSelect: (v: TourVehicle) => void }) {
  return (
    <section className="relative min-h-dvh pt-28 pb-16">
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow mb-4">Etapa 1 · Veículo</span>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">
            Escolha seu <span className="text-brand">veículo</span>.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md">
            Cada veículo entrega uma sensação diferente. Escolha o que combina com sua aventura.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TOUR_VEHICLES.map((v, i) => (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => onSelect(v)}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 text-left hover:border-brand/60 transition-all"
            >
              <div
                className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
                style={{ background: v.accent }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="h-14 w-14 rounded-2xl grid place-items-center"
                    style={{ background: `${v.accent}22`, border: `1px solid ${v.accent}55` }}
                  >
                    <VehicleGlyph id={v.id} color={v.accent} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>

                <h3 className="font-display text-4xl uppercase leading-none">{v.name}</h3>
                <p className="mt-4 text-sm text-foreground/80 leading-relaxed max-w-md">
                  {v.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand" /> {v.capacity}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-brand" /> {v.power}
                  </span>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 text-brand font-mono text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                  Selecionar <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function VehicleGlyph({ id, color }: { id: TourVehicle["id"]; color: string }) {
  if (id === "quadriciclo") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M4 14 L8 8 L16 8 L20 14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8 L11 5 L13 5 L15 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
      <path d="M6 9 L8 5 L16 5 L18 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

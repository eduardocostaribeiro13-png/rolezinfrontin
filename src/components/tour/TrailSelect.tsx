import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Clock, Mountain, Route as RouteIcon, Gauge } from "lucide-react";
import { TRAILS, type Trail } from "./tour-data";

export function TrailSelect({
  onSelect,
  onBack,
}: {
  onSelect: (t: Trail) => void;
  onBack: () => void;
}) {
  return (
    <section className="relative min-h-dvh pt-28 pb-16">
      <div className="container-x">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-brand transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>

        <div className="max-w-2xl">
          <span className="eyebrow mb-4">Etapa 2 · Trilha</span>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">
            Escolha sua <span className="text-brand">trilha</span>.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md">
            Cada percurso oferece uma experiência única de paisagem, técnica e intensidade.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TRAILS.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => onSelect(t)}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card text-left hover:border-brand/60 transition-all"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <TrailPreview color={t.color} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest"
                    style={{ background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}55` }}
                  >
                    {t.level}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-2xl md:text-3xl uppercase leading-none">
                    {t.name}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-foreground/80 leading-relaxed">{t.description}</p>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Stat icon={<RouteIcon className="h-3.5 w-3.5 text-brand" />} v={`${t.distanceKm} km`} />
                  <Stat icon={<Clock className="h-3.5 w-3.5 text-brand" />} v={`${t.durationMin} min`} />
                  <Stat icon={<Gauge className="h-3.5 w-3.5 text-brand" />} v={t.level} />
                  <Stat icon={<Mountain className="h-3.5 w-3.5 text-brand" />} v={`${t.altitudeM} m`} />
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-brand font-mono text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                  Explorar trilha <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, v }: { icon: React.ReactNode; v: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {icon} {v}
    </span>
  );
}

function TrailPreview({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`ground-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#sky-${color})`} />
      <polygon points="0,140 90,80 170,130 260,60 340,120 400,90 400,220 0,220" fill={`url(#ground-${color})`} />
      <polygon points="0,180 60,150 140,170 220,140 300,175 400,155 400,220 0,220" fill="#0a0a0a" opacity="0.7" />
      <path
        d="M20,205 Q120,180 200,190 T380,175"
        stroke="#FDB913"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
        opacity="0.9"
      />
    </svg>
  );
}

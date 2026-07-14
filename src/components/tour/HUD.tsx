import { Clock, Gauge, LogOut, Mountain, Pause, Play, Route as RouteIcon } from "lucide-react";
import type { Trail } from "./tour-data";

type CameraMode = "pilot" | "external" | "drone" | "free";

const MODES: { id: CameraMode; label: string }[] = [
  { id: "pilot", label: "Piloto" },
  { id: "external", label: "Externa" },
  { id: "drone", label: "Drone" },
  { id: "free", label: "Livre" },
];

export function HUD({
  mode,
  onModeChange,
  progress,
  trail,
  paused,
  onTogglePause,
  onExit,
}: {
  mode: CameraMode;
  onModeChange: (m: CameraMode) => void;
  progress: number;
  trail: Trail;
  paused: boolean;
  onTogglePause: () => void;
  onExit: () => void;
}) {
  const distanceDone = (progress * trail.distanceKm).toFixed(1);
  const timeDone = Math.round(progress * trail.durationMin);
  const currentAlt = Math.round(
    trail.altitudeM - 40 + Math.sin(progress * Math.PI * 3) * 40,
  );
  const speed = paused ? 0 : Math.round(18 + Math.sin(progress * 20) * 8);
  const pct = Math.round(progress * 100);

  return (
    <>
      {/* Top-left: exit + trail */}
      <div className="pointer-events-none fixed top-4 left-4 right-4 z-50 flex items-start justify-between gap-3">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onExit}
            className="glass px-3 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest text-foreground/85 hover:text-brand transition-colors inline-flex items-center gap-1.5"
            aria-label="Sair do tour"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
          <div className="glass px-3 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest">
            <span className="text-muted-foreground">Trilha · </span>
            <span className="text-brand">{trail.name}</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1 glass rounded-full p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground"
                  : "text-foreground/70 hover:text-brand"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom center: HUD stats */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
        <div className="glass rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
            <HudStat icon={<Clock className="h-3.5 w-3.5 text-brand" />} v={`${timeDone} min`} />
            <HudStat icon={<RouteIcon className="h-3.5 w-3.5 text-brand" />} v={`${distanceDone} km`} />
            <HudStat icon={<Mountain className="h-3.5 w-3.5 text-brand" />} v={`${currentAlt} m`} />
            <HudStat icon={<Gauge className="h-3.5 w-3.5 text-brand" />} v={`${speed} km/h`} />
          </div>

          <div className="pointer-events-auto flex items-center gap-3 min-w-[180px] flex-1 justify-end">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden max-w-[220px]">
              <div
                className="h-full bg-brand transition-[width] duration-200"
                style={{ width: `${pct}%`, boxShadow: "0 0 12px rgba(253,185,19,0.7)" }}
              />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand w-8 text-right">
              {pct}%
            </span>
            <button
              onClick={onTogglePause}
              className="grid h-8 w-8 place-items-center rounded-full bg-brand text-brand-foreground hover:brightness-110 transition-all"
              aria-label={paused ? "Retomar" : "Pausar"}
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hidden sm:block">
          Teclas 1–4 alternam a câmera · Espaço pausa
        </p>
      </div>
    </>
  );
}

function HudStat({ icon, v }: { icon: React.ReactNode; v: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-foreground/85">
      {icon} {v}
    </span>
  );
}

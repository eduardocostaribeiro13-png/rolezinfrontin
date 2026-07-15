import { Gauge, Mountain, Route, Timer, Milestone } from "lucide-react";
import { formatDistance, formatETA, type RouteState } from "@/lib/tour-virtual/route-engine";
import type { RealRoute } from "@/lib/tour-virtual/data";

export function NavigationHUD({
  state,
  route,
}: {
  state: RouteState;
  route: RealRoute;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 sm:p-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-stretch gap-2 sm:gap-3">
        <HudCard icon={<Gauge className="h-4 w-4" />} label="Velocidade" value={`${state.speedKmh.toFixed(0)} km/h`} />
        <HudCard icon={<Mountain className="h-4 w-4" />} label="Altitude" value={`${state.altitudeM.toFixed(0)} m`} />
        <HudCard icon={<Route className="h-4 w-4" />} label="Restam" value={formatDistance(state.distanceRemainingM)} />
        <HudCard icon={<Timer className="h-4 w-4" />} label="ETA" value={formatETA(state.etaSeconds)} />
        <HudCard icon={<Milestone className="h-4 w-4" />} label="Rota" value={route.name} className="hidden md:flex" />
      </div>
      {/* Barra de progresso */}
      <div className="mx-auto mt-3 max-w-6xl">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40 backdrop-blur">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{
              width: `${(state.progress * 100).toFixed(1)}%`,
              background: `linear-gradient(90deg, ${route.color}, #fff)`,
            }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/70">
          <span>{formatDistance(state.distanceTraveledM)}</span>
          <span>{(state.progress * 100).toFixed(0)}%</span>
          <span>{formatDistance(state.totalDistanceM)}</span>
        </div>
      </div>
    </div>
  );
}

function HudCard({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-auto flex flex-1 min-w-[110px] items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md ${className}`}
    >
      <div className="text-brand">{icon}</div>
      <div className="min-w-0">
        <p className="truncate font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">{label}</p>
        <p className="truncate font-display text-lg leading-none text-white">{value}</p>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Pause, Play, RotateCcw } from "lucide-react";
import { REAL_ROUTES } from "@/lib/tour-virtual/data";
import {
  compileRoute,
  sampleRoute,
  type CompiledRoute,
  type RouteState,
} from "@/lib/tour-virtual/route-engine";
import { TourWorld, type CameraMode } from "./world/TourWorld";
import { WazeMinimap } from "./world/WazeMinimap";
import { NavigationHUD } from "./world/NavigationHUD";
import { CameraSwitcher } from "./world/CameraSwitcher";
import { POIPanel } from "./world/POIPanel";

const SPEED_KMH = 32; // velocidade cinemática do simulador

export function TourVirtualExperience() {
  const [routeId, setRouteId] = useState(REAL_ROUTES[0].id);
  const [compiled, setCompiled] = useState<CompiledRoute | null>(null);
  const [state, setState] = useState<RouteState | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>("chase");
  const [paused, setPaused] = useState(false);
  const [dismissedPoi, setDismissedPoi] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const route = useMemo(
    () => REAL_ROUTES.find((r) => r.id === routeId) ?? REAL_ROUTES[0],
    [routeId],
  );

  // Compila rota (fetch elevations)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    compileRoute(route).then((c) => {
      if (cancelled) return;
      setCompiled(c);
      setState(sampleRoute(c, 0, 0));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [route]);

  // Loop de simulação
  const progressRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  useEffect(() => {
    if (!compiled) return;
    let raf = 0;
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (!paused && progressRef.current < 1) {
        const speedMs = (SPEED_KMH * 1000) / 3600;
        progressRef.current = Math.min(
          1,
          progressRef.current + (speedMs * dt) / compiled.totalM,
        );
      }
      const s = sampleRoute(
        compiled,
        progressRef.current,
        paused ? 0 : SPEED_KMH,
      );
      setState(s);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [compiled, paused]);

  const restart = () => {
    progressRef.current = 0;
    lastTsRef.current = null;
    setDismissedPoi(null);
    setPaused(false);
  };

  const changeRoute = (id: string) => {
    progressRef.current = 0;
    lastTsRef.current = null;
    setDismissedPoi(null);
    setRouteId(id);
  };

  const activePoi =
    state?.activePoi && state.activePoi.id !== dismissedPoi ? state.activePoi : null;

  return (
    <div className="relative min-h-dvh bg-black text-white">
      {/* Barra superior */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-3 sm:p-4">
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur-md hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </Link>
        <div className="pointer-events-auto flex gap-1 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-md">
          {REAL_ROUTES.map((r) => (
            <button
              key={r.id}
              onClick={() => changeRoute(r.id)}
              className={`rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                r.id === routeId
                  ? "bg-brand text-brand-foreground"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">{r.name}</span>
              <span className="sm:hidden">
                {r.id === "sede-morro-azul" ? "Morro Azul" : "Cachoeira"}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Mundo 3D */}
      <div className="absolute inset-0">
        {loading || !compiled || !state ? (
          <div className="grid h-full place-items-center">
            <div className="flex flex-col items-center gap-3 text-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="font-mono text-xs uppercase tracking-[0.3em]">
                Carregando dados reais · OSM + DEM
              </p>
            </div>
          </div>
        ) : (
          <TourWorld compiled={compiled} state={state} cameraMode={cameraMode} />
        )}
      </div>

      {/* HUD */}
      {state && !loading && <NavigationHUD state={state} route={route} />}

      {/* Câmeras */}
      {!loading && <CameraSwitcher mode={cameraMode} onChange={setCameraMode} />}

      {/* Controles laterais direita */}
      {!loading && state && (
        <div className="pointer-events-none absolute bottom-4 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={() => setPaused((p) => !p)}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-md hover:bg-black/85"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? "Continuar" : "Pausar"}
          </button>
          <button
            onClick={restart}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-md hover:bg-black/85"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reiniciar
          </button>
        </div>
      )}

      {/* Minimapa Waze */}
      {state && !loading && (
        <div className="absolute bottom-4 left-3 z-10 h-40 w-56 sm:h-56 sm:w-72">
          <WazeMinimap
            route={route}
            vehicleLngLat={state.lngLat}
            headingRad={state.headingRad}
          />
        </div>
      )}

      {/* POI Panel */}
      <POIPanel poi={activePoi} onClose={() => activePoi && setDismissedPoi(activePoi.id)} />

      {/* Fim de rota */}
      {state?.finished && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-white/10 bg-black/90 p-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand">Chegou ao destino</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-none">{route.name}</h2>
            <p className="mt-4 text-sm text-white/70">
              Você acabou de percorrer virtualmente essa rota real. Reserve agora e viva a aventura de verdade.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/reservar"
                className="rounded-full bg-brand px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-foreground hover:brightness-110"
              >
                Reservar agora
              </Link>
              <button
                onClick={restart}
                className="rounded-full border border-white/20 px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white/10"
              >
                Refazer trajeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

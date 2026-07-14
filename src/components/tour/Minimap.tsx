import { useMemo } from "react";
import type * as THREE from "three";
import type { Trail } from "./tour-data";

export function Minimap({
  trail,
  progress,
  curve,
}: {
  trail: Trail;
  progress: number;
  curve: THREE.CatmullRomCurve3;
}) {
  const { pathD, points, bounds } = useMemo(() => {
    const pts = curve.getSpacedPoints(120);
    const xs = pts.map((p) => p.x);
    const zs = pts.map((p) => p.z);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const scale = (v: number, a: number, b: number) => (v - a) / (b - a || 1);
    const project = (x: number, z: number) => [8 + scale(x, minX, maxX) * 104, 8 + scale(z, minZ, maxZ) * 104];
    const [x0, y0] = project(pts[0].x, pts[0].z);
    let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = project(pts[i].x, pts[i].z);
      d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
    }
    return { pathD: d, points: pts, bounds: { project } };
  }, [curve]);

  const current = curve.getPointAt(progress);
  const [cx, cy] = bounds.project(current.x, current.z);
  const remainingKm = ((1 - progress) * trail.distanceKm).toFixed(1);

  return (
    <div className="pointer-events-none fixed top-20 right-4 z-40 hidden sm:block">
      <div className="glass rounded-2xl p-3 w-48">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Minimapa
        </p>
        <svg viewBox="0 0 120 120" className="w-full h-auto rounded-lg bg-black/40">
          <defs>
            <radialGradient id="mm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={trail.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={trail.color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="120" height="120" fill="url(#mm-glow)" />
          <path d={pathD} stroke={trail.color} strokeWidth="1.2" fill="none" opacity="0.5" />
          <path
            d={pathD}
            stroke="#FDB913"
            strokeWidth="1.6"
            fill="none"
            strokeDasharray={`${progress * 500} 500`}
          />
          {/* Hotspot dots */}
          {trail.hotspots.map((h) => {
            const p = curve.getPointAt(h.progress);
            const [hx, hy] = bounds.project(p.x, p.z);
            return <circle key={h.id} cx={hx} cy={hy} r="2" fill="#FDB913" opacity="0.9" />;
          })}
          {/* Current position */}
          <circle cx={cx} cy={cy} r="4" fill="#FDB913">
            <animate attributeName="r" values="4;6;4" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r="2" fill="#111" />
        </svg>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
          <span className="text-muted-foreground">Restante</span>
          <span className="text-brand">{remainingKm} km</span>
        </div>
      </div>
    </div>
  );
}

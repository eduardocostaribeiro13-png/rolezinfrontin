import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Sparkles,
  Sky,
  OrbitControls,
  Html,
  Cloud,
  Clouds,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { HUD } from "./HUD";
import { Minimap } from "./Minimap";
import { HotspotPanel } from "./HotspotPanel";
import type { Hotspot, Trail, TourVehicle } from "./tour-data";

type CameraMode = "pilot" | "external" | "drone" | "free";

export function TourScene({
  vehicle,
  trail,
  onFinish,
}: {
  vehicle: TourVehicle;
  trail: Trail;
  onFinish: () => void;
}) {
  const [mode, setMode] = useState<CameraMode>("external");
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [openHotspot, setOpenHotspot] = useState<Hotspot | null>(null);
  const [ready, setReady] = useState(false);

  // Route as CatmullRom curve, deterministic per trail
  const curve = useMemo(() => buildCurve(trail.id), [trail.id]);

  const startTime = useRef(performance.now());
  const totalMs = 90_000; // 90s virtual tour

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const tick = () => {
      if (!paused && !openHotspot) {
        const elapsed = performance.now() - startTime.current;
        const p = Math.min(1, elapsed / totalMs);
        setProgress(p);
        if (p >= 1) {
          setTimeout(onFinish, 500);
          return;
        }
      } else {
        startTime.current = performance.now() - progress * totalMs;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, openHotspot, ready, onFinish, progress]);

  // Detect hotspot proximity
  useEffect(() => {
    if (openHotspot) return;
    for (const h of trail.hotspots) {
      if (Math.abs(progress - h.progress) < 0.008) {
        setOpenHotspot(h);
        break;
      }
    }
  }, [progress, trail.hotspots, openHotspot]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") setMode("pilot");
      if (e.key === "2") setMode("external");
      if (e.key === "3") setMode("drone");
      if (e.key === "4") setMode("free");
      if (e.key === " ") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 30, 60], fov: 55, near: 0.1, far: 1000 }}
        onCreated={() => setReady(true)}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={["#0b0d10"]} />
        <fog attach="fog" args={["#101418", 60, 260]} />

        <Suspense fallback={null}>
          <SceneLighting trailColor={trail.color} />
          <Terrain trailColor={trail.color} />
          <Trees seed={trail.id} count={90} />
          <Rocks seed={trail.id} count={35} />
          <Route curve={curve} />
          <VehicleMarker curve={curve} progress={progress} vehicleId={vehicle.id} />
          <HotspotMarkers
            trail={trail}
            curve={curve}
            onClick={(h) => setOpenHotspot(h)}
          />
          <CameraRig mode={mode} curve={curve} progress={progress} />

          <Sparkles count={80} scale={[200, 30, 200]} size={2} speed={0.3} opacity={0.35} />
          <Sky sunPosition={[100, 20, 100]} turbidity={6} rayleigh={2} inclination={0.48} />
          <Clouds material={THREE.MeshBasicMaterial} limit={20}>
            <Cloud seed={1} bounds={[80, 4, 60]} volume={12} color="#c8d4de" opacity={0.5} position={[0, 40, -80]} />
            <Cloud seed={2} bounds={[60, 3, 40]} volume={8} color="#b8c4d0" opacity={0.4} position={[-90, 45, -40]} />
          </Clouds>
          <Environment preset="sunset" />
        </Suspense>

        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.55} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.7} />
        </EffectComposer>
      </Canvas>

      <HUD
        mode={mode}
        onModeChange={setMode}
        progress={progress}
        trail={trail}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        onExit={onFinish}
      />

      <Minimap trail={trail} progress={progress} curve={curve} />

      {openHotspot && (
        <HotspotPanel
          hotspot={openHotspot}
          onClose={() => setOpenHotspot(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Scene primitives ---------------- */

function SceneLighting({ trailColor }: { trailColor: string }) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#cfe6ff", "#3a2a1a", 0.5]} />
      <directionalLight
        ref={sunRef}
        position={[80, 90, 40]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />
      <pointLight position={[0, 20, 0]} intensity={0.4} color={trailColor} distance={80} />
    </>
  );
}

function Terrain({ trailColor }: { trailColor: string }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(400, 400, 128, 128);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h =
        Math.sin(x * 0.03) * 3 +
        Math.cos(z * 0.025) * 4 +
        Math.sin((x + z) * 0.07) * 1.5 +
        pseudoNoise(x * 0.09, z * 0.09) * 2;
      pos.setY(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(trailColor).lerp(new THREE.Color("#2a2a2a"), 0.65),
      roughness: 1,
      metalness: 0,
      flatShading: false,
    });
    return m;
  }, [trailColor]);

  return <mesh geometry={geo} material={mat} receiveShadow />;
}

function pseudoNoise(x: number, y: number) {
  return (
    Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 -
    Math.floor(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453)
  );
}

function Trees({ seed, count }: { seed: string; count: number }) {
  const positions = useMemo(() => {
    const rng = mulberry32(hashString(seed));
    const arr: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const r = 40 + rng() * 130;
      arr.push([Math.cos(angle) * r, 0, Math.sin(angle) * r]);
    }
    return arr;
  }, [seed, count]);

  return (
    <group>
      {positions.map((p, i) => {
        const scale = 0.7 + ((i * 7) % 10) / 10;
        return (
          <group key={i} position={p}>
            <mesh position={[0, 1.2 * scale, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.35, 2.4 * scale, 6]} />
              <meshStandardMaterial color="#3d2a1c" roughness={1} />
            </mesh>
            <mesh position={[0, 3.5 * scale, 0]} castShadow>
              <coneGeometry args={[1.6 * scale, 4 * scale, 8]} />
              <meshStandardMaterial color="#2d5a35" roughness={0.9} />
            </mesh>
            <mesh position={[0, 5 * scale, 0]} castShadow>
              <coneGeometry args={[1.1 * scale, 2.6 * scale, 8]} />
              <meshStandardMaterial color="#3a6d43" roughness={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Rocks({ seed, count }: { seed: string; count: number }) {
  const rocks = useMemo(() => {
    const rng = mulberry32(hashString(seed) + 999);
    return Array.from({ length: count }, () => ({
      pos: [(rng() - 0.5) * 260, 0, (rng() - 0.5) * 260] as [number, number, number],
      scale: 0.6 + rng() * 1.8,
      rot: rng() * Math.PI,
    }));
  }, [seed, count]);
  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[0, r.rot, 0]} scale={r.scale} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#6b6a67" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Route({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const geom = useMemo(() => {
    const g = new THREE.TubeGeometry(curve, 300, 0.6, 8, false);
    return g;
  }, [curve]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color="#FDB913"
        emissive="#FDB913"
        emissiveIntensity={0.35}
        roughness={0.4}
      />
    </mesh>
  );
}

function VehicleMarker({
  curve,
  progress,
  vehicleId,
}: {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  vehicleId: TourVehicle["id"];
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const p = curve.getPointAt(progress);
    const t = curve.getTangentAt(progress);
    ref.current.position.set(p.x, p.y + 1.4, p.z);
    ref.current.lookAt(p.x + t.x, p.y + 1.4 + t.y, p.z + t.z);
  });

  const color = vehicleId === "quadriciclo" ? "#FDB913" : "#F97316";
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[2.2, 1, 3.2]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.7, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.6, 1.6]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
      </mesh>
      {[
        [-1, -0.5, 1.1],
        [1, -0.5, 1.1],
        [-1, -0.5, -1.1],
        [1, -0.5, -1.1],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.45, 0.45, 0.5, 12]} />
          <meshStandardMaterial color="#111" roughness={1} />
        </mesh>
      ))}
      <pointLight position={[0, 0.8, 1.6]} intensity={2} distance={20} color="#fffbe6" />
    </group>
  );
}

function HotspotMarkers({
  trail,
  curve,
  onClick,
}: {
  trail: Trail;
  curve: THREE.CatmullRomCurve3;
  onClick: (h: Hotspot) => void;
}) {
  return (
    <>
      {trail.hotspots.map((h) => {
        const p = curve.getPointAt(h.progress);
        return (
          <group key={h.id} position={[p.x, p.y + 5, p.z]}>
            <mesh>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial
                color="#FDB913"
                emissive="#FDB913"
                emissiveIntensity={1.5}
              />
            </mesh>
            <Html center distanceFactor={20}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(h);
                }}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-black/70 backdrop-blur border border-brand/60 text-[10px] font-mono uppercase tracking-widest text-brand hover:bg-brand hover:text-brand-foreground transition-colors"
              >
                📍 {h.name}
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}

function CameraRig({
  mode,
  curve,
  progress,
}: {
  mode: CameraMode;
  curve: THREE.CatmullRomCurve3;
  progress: number;
}) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (mode === "free") return;
    const p = curve.getPointAt(progress);
    const t = curve.getTangentAt(progress);
    const ahead = curve.getPointAt(Math.min(1, progress + 0.01));

    if (mode === "pilot") {
      desired.set(p.x - t.x * 0.5, p.y + 2.6, p.z - t.z * 0.5);
      target.copy(ahead).setY(ahead.y + 1.5);
    } else if (mode === "external") {
      desired.set(p.x - t.x * 12, p.y + 6, p.z - t.z * 12);
      target.copy(p).setY(p.y + 1.5);
    } else if (mode === "drone") {
      desired.set(p.x + 25, p.y + 40, p.z + 25);
      target.copy(p);
    }
    camera.position.lerp(desired, 0.06);
    camera.lookAt(target);
  });

  return mode === "free" ? <OrbitControls makeDefault enableDamping /> : null;
}

/* ---------------- Utilities ---------------- */

function buildCurve(seed: string): THREE.CatmullRomCurve3 {
  const rng = mulberry32(hashString(seed) + 7);
  const points: THREE.Vector3[] = [];
  const segments = 12;
  const radius = 70;
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2 + rng() * 0.4;
    const r = radius + (rng() - 0.5) * 30;
    const y = Math.sin(t * Math.PI * 4) * 3 + (rng() - 0.5) * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
  }
  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5);
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

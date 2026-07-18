import { useMemo, useRef } from "react";
function getTerrainHeight(x: number, z: number, compiled: CompiledRoute) {
  const route = compiled.raw.coordinates.map(toLocal);

  let best = Infinity;
  let elevation = compiled.elevations.length > 0 ? compiled.elevations[0] : 0;

  for (let i = 0; i < route.length; i++) {
    const [rx, rz] = route[i];

    const dx = rx - x;
    const dz = rz - z;

    const d = dx * dx + dz * dz;

    if (d < best) {
      best = d;
      elevation = compiled.elevations[i];
    }
  }

  const avg = compiled.elevations.reduce((a, b) => a + b, 0) / compiled.elevations.length;

  const mountain = Math.sin(x * 0.0015) * 45 + Math.cos(z * 0.0018) * 32 + Math.sin((x + z) * 0.0012) * 18;

  const detail = Math.sin(x * 0.015) * 2 + Math.cos(z * 0.018) * 2;

  return (elevation - avg) * 0.8 + mountain + detail;
}
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";
import type { CompiledRoute, RouteState } from "@/lib/tour-virtual/route-engine";
import { toLocal } from "@/lib/tour-virtual/geo";

interface WorldProps {
  compiled: CompiledRoute;
  state: RouteState;
  cameraMode: CameraMode;
}

export type CameraMode = "chase" | "drone" | "hood" | "side" | "aerial";

export function TourWorld({ compiled, state, cameraMode }: WorldProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 40, 60], fov: 55, near: 0.5, far: 6000 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ background: "#7dc4ff" }}
    >
      <Sky
        distance={4500}
        sunPosition={[80, 40, 20]}
        turbidity={3}
        rayleigh={1.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#bfe4ff", "#3a5a2a", 0.5]} />
      <directionalLight
        position={[120, 200, 100]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={800}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
      />
      <fog attach="fog" args={["#c9dcff", 900, 3200]} />

      <Terrain compiled={compiled} />
      <RoadNetwork compiled={compiled} />
      <Vegetation compiled={compiled} />
      <Buildings compiled={compiled} />
      <Vehicle state={state} />
      <CameraRig state={state} mode={cameraMode} />

      <Clouds material={THREE.MeshBasicMaterial} limit={30}>
        <Cloud seed={7} bounds={[600, 20, 600]} volume={100} color="#ffffff" opacity={0.55} position={[0, 260, 0]} />
      </Clouds>
    </Canvas>
  );
}

/* ---------- TERRENO ---------- */
function Terrain({ compiled }: { compiled: CompiledRoute }) {
  const size = 3200;
  const segs = 512;

  const { geometry, avgAlt } = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, segs, segs);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const avg = compiled.elevations.reduce((a, b) => a + b, 0) / Math.max(1, compiled.elevations.length);

    const routeLocal = compiled.raw.coordinates.map(toLocal);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let bestAlt = avg;
      let bestDist = Infinity;
      for (let k = 0; k < routeLocal.length; k++) {
        const [rx, rz] = routeLocal[k];
        const d = (rx - x) * (rx - x) + (rz - z) * (rz - z);
        if (d < bestDist) {
          bestDist = d;
          bestAlt = compiled.elevations[k];
        }
      }
      const distToRoad = Math.sqrt(bestDist);

const flatten = Math.min(
  1,
  Math.max(0, (distToRoad - 8) / 40),
);

const terrainHeight = getTerrainHeight(
  x,
  z,
  compiled,
);

pos.setY(
  i,
  terrainHeight * flatten,
);
    }
    g.computeVertexNormals();
    return { geometry: g, avgAlt: avg };
  }, [compiled]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color="#4d6b3a" roughness={0.95} />
      </mesh>
      {/* "Chão infinito" para nunca haver horizonte branco */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5500, 64]} />
        <meshStandardMaterial color="#3f5a30" roughness={1} />
      </mesh>
      {/* referência interna */}
      <group userData={{ avgAlt }} />
    </group>
  );
}

/* ---------- REDE VIÁRIA ---------- */
function RoadNetwork({ compiled }: { compiled: CompiledRoute }) {
  const geometry = useMemo(() => {

  const points = compiled.raw.coordinates.map(toLocal);

  const path: THREE.Vector3[] = [];

  for (const [x, z] of points) {

    const y = getTerrainHeight(
      x,
      z,
      compiled,
    );

    path.push(
      new THREE.Vector3(
        x,
        y + 0.08,
        z,
      ),
    );
  }

  const curve = new THREE.CatmullRomCurve3(
    path,
    false,
    "centripetal",
    0.35,
  );

  return new THREE.TubeGeometry(
    curve,
    points.length * 20,
    5.5,
    24,
    false,
  );

}, [compiled]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
    color="#3a3a3a"
    roughness={0.95}
    metalness={0.02}
/>
    </mesh>
  );
}

/* ---------- CONSTRUÇÕES ---------- */
function Buildings({ compiled }: { compiled: CompiledRoute }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9b998", roughness: 0.85 }), []);

  const matrices = useMemo(() => {
    const routePts = compiled.raw.coordinates.map(toLocal);
    const dummies: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    let seed = 1337;
    const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

    for (const [rx, rz] of routePts) {
      const clusterCount = 3 + Math.floor(rand() * 4);
      for (let c = 0; c < clusterCount; c++) {
        const a = rand() * Math.PI * 2;
        const r = 22 + rand() * 55;
        const x = rx + Math.cos(a) * r;
        const z = rz + Math.sin(a) * r;
        const w = 4 + rand() * 6;
        const d = 4 + rand() * 6;
        const h = 3 + rand() * 6;
        m.compose(
          new THREE.Vector3(x, h / 2, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rand() * Math.PI, 0)),
          new THREE.Vector3(w, h, d),
        );
        dummies.push(m.clone());
      }
    }
    return dummies;
  }, [compiled]);

  useMemo(() => {
    if (!meshRef.current) return;
    matrices.forEach((m, i) => meshRef.current!.setMatrixAt(i, m));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return <instancedMesh ref={meshRef} args={[geom, mat, matrices.length]} castShadow receiveShadow frustumCulled />;
}

/* ---------- VEGETAÇÃO (Mata Atlântica) ---------- */
function Vegetation({ compiled }: { compiled: CompiledRoute }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 1200;

  const geom = useMemo(() => new THREE.ConeGeometry(3, 10, 6), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2d5a2a", roughness: 0.95 }), []);

  const matrices = useMemo(() => {
    const m = new THREE.Matrix4();
    const dummies: THREE.Matrix4[] = [];
    // Distribui árvores em raio 800m, evitando faixa de 15m ao redor da rota
    const routePts = compiled.raw.coordinates.map(toLocal);
    // seed determinístico
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    let placed = 0;
    let tries = 0;
    while (placed < count && tries < count * 6) {
      tries++;
      const r = Math.sqrt(rand()) * 900;
      const a = rand() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      // Checa distância à rota
      let minD = Infinity;
      for (const [rx, rz] of routePts) {
        const d = (rx - x) * (rx - x) + (rz - z) * (rz - z);
        if (d < minD) minD = d;
      }
      if (minD < 18 * 18) continue;
      const s = 0.6 + rand() * 1.4;
      m.compose(
        new THREE.Vector3(x, 4 * s, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rand() * Math.PI * 2, 0)),
        new THREE.Vector3(s, s + rand() * 0.6, s),
      );
      dummies.push(m.clone());
      placed++;
    }
    return dummies;
  }, [compiled]);

  useMemo(() => {
    if (!meshRef.current) return;
    matrices.forEach((m, i) => meshRef.current!.setMatrixAt(i, m));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return <instancedMesh ref={meshRef} args={[geom, mat, matrices.length]} castShadow receiveShadow frustumCulled />;
}

/* ---------- VEÍCULO ---------- */
function Vehicle({ state }: { state: RouteState }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const [x, z] = state.localXZ;
    ref.current.position.set(x, 1.5, z);
    ref.current.rotation.y = state.headingRad;
  });
  return (
    <group ref={ref}>
      {/* Chassi */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.2, 1.0, 3.6]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Cabine */}
      <mesh position={[0, 1.5, -0.2]} castShadow>
        <boxGeometry args={[1.9, 0.9, 1.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Rodas */}
      {[
        [-1.05, 0.35, 1.2],
        [1.05, 0.35, 1.2],
        [-1.05, 0.35, -1.2],
        [1.05, 0.35, -1.2],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.5, 16]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}
      {/* Farol */}
      <pointLight position={[0, 1.2, 2]} intensity={1.5} distance={40} color="#fff8d6" />
    </group>
  );
}

/* ---------- CÂMERA ---------- */
function CameraRig({ state, mode }: { state: RouteState; mode: CameraMode }) {
  const desired = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());

  useFrame((three) => {
    const [x, z] = state.localXZ;
    const h = state.headingRad;
    const forward = new THREE.Vector3(Math.sin(h), 0, -Math.cos(h));
    const right = new THREE.Vector3(Math.cos(h), 0, Math.sin(h));
    const base = new THREE.Vector3(x, 1.5, z);

    switch (mode) {
      case "chase":
        desired.current
          .copy(base)
          .addScaledVector(forward, -12)
          .add(new THREE.Vector3(0, 6, 0));
        desiredLook.current.copy(base).addScaledVector(forward, 8);
        break;
      case "drone":
        desired.current
          .copy(base)
          .add(new THREE.Vector3(0, 40, 0))
          .addScaledVector(forward, -18);
        desiredLook.current.copy(base).addScaledVector(forward, 20);
        break;
      case "hood":
        desired.current
          .copy(base)
          .addScaledVector(forward, 1.2)
          .add(new THREE.Vector3(0, 1.6, 0));
        desiredLook.current.copy(base).addScaledVector(forward, 40);
        break;
      case "side":
        desired.current
          .copy(base)
          .addScaledVector(right, 14)
          .add(new THREE.Vector3(0, 4, 0));
        desiredLook.current.copy(base);
        break;
      case "aerial":
        desired.current.copy(base).add(new THREE.Vector3(0, 220, 0));
        desiredLook.current.copy(base);
        break;
    }
    three.camera.position.lerp(desired.current, 0.08);
    three.camera.lookAt(desiredLook.current);
  });
  return null;
}

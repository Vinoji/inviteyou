"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Pose, ShotTrack } from "./shots";
import { makePalaceTextures } from "./textures";

export type Quality = "low" | "mid" | "high";

/** Per-tier budget. Low-end phones get no dynamic lights and far fewer particles. */
const BUDGET: Record<Quality, { dust: number; petals: number; lights: number; dpr: [number, number] }> = {
  low: { dust: 70, petals: 0, lights: 0, dpr: [1, 1] },
  mid: { dust: 140, petals: 14, lights: 2, dpr: [1, 1.5] },
  high: { dust: 240, petals: 28, lights: 4, dpr: [1, 1.75] },
};

/** Pillar rows down the hall, both sides. */
const PILLAR_Z = [-3, -7, -11, -15, -19, -23, -27, -31, -35, -39];
const PILLAR_X = 3.4;
const LANTERN_Z = [-5, -13, -21, -29, -37];
const CHANDELIER_Z = [-9, -25];

const tmp = new THREE.Object3D();
const WINDOW_DIM = new THREE.Color("#6A4A24");
const WINDOW_LIT = new THREE.Color("#FFFFFF");

/** Seeded random numbers, so the dust and petals are laid out the same on every render. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Petal {
  x: number;
  y: number;
  z: number;
  spin: number;
  v: number;
}

/* ------------------------------------------------------------------ */
/* Procedural textures and geometry (made once per mount)              */
/* ------------------------------------------------------------------ */

/** A soft round glow, for lamp halos and gold dust. */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,244,214,1)");
  grad.addColorStop(0.25, "rgba(255,214,140,0.65)");
  grad.addColorStop(1, "rgba(255,190,90,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A Mughal-style jali: eight-point stars in a lattice, gold on transparent. */
function jaliTexture(gold: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.strokeStyle = gold;
  g.lineWidth = 3;
  const star = (cx: number, cy: number, r: number) => {
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const rr = i % 2 === 0 ? r : r * 0.62;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.stroke();
  };
  star(64, 64, 34);
  [0, 128].forEach((x) => [0, 128].forEach((y) => star(x, y, 34)));
  g.beginPath();
  g.arc(64, 64, 10, 0, Math.PI * 2);
  g.stroke();
  g.strokeRect(1.5, 1.5, 125, 125);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A wall with an arched opening (outer w×h, opening ±half wide, springing at `spring`). */
function archedWall(w: number, h: number, half: number, spring: number, depth: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(-half, 0);
  shape.lineTo(-half, spring);
  shape.absarc(0, spring, half, Math.PI, 0, true);
  shape.lineTo(half, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h);
  shape.lineTo(-w / 2, h);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 20 });
}

/** One door leaf filling half of that arch, hinged at x = 0. */
function doorLeaf(half: number, spring: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(half, 0);
  shape.lineTo(half, spring + half);
  shape.absarc(half, spring, half, Math.PI / 2, Math.PI, false);
  shape.lineTo(0, 0);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false, curveSegments: 12 });
}

/** Writes a list of transforms into an instanced mesh. */
function useInstances(
  ref: MutableRefObject<THREE.InstancedMesh | null>,
  items: { p: [number, number, number]; s?: [number, number, number]; r?: [number, number, number] }[]
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, i) => {
      tmp.position.set(...it.p);
      tmp.rotation.set(...(it.r ?? [0, 0, 0]));
      tmp.scale.set(...(it.s ?? [1, 1, 1]));
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [ref, items]);
}

/* ------------------------------------------------------------------ */
/* Materials shared across the scene                                   */
/* ------------------------------------------------------------------ */

function useMaterials(gold: string, quality: Quality) {
  return useMemo(() => {
    const tx = makePalaceTextures(quality === "low" ? 256 : 512, gold);
    return {
      gold: new THREE.MeshStandardMaterial({ color: gold, metalness: 0.9, roughness: 0.28, emissive: gold, emissiveIntensity: 0.1 }),
      stone: new THREE.MeshStandardMaterial({ color: "#FFDDB0", map: tx.sandstone.map, bumpMap: tx.sandstone.bump, bumpScale: 3, roughness: 0.85, metalness: 0.02 }),
      marble: new THREE.MeshStandardMaterial({ map: tx.marble.map, roughness: 0.3, metalness: 0.05 }),
      pillar: new THREE.MeshStandardMaterial({ color: "#FFF1DC", map: tx.pillar.map, bumpMap: tx.pillar.bump, bumpScale: 4, roughness: 0.32, metalness: 0.05 }),
      dome: new THREE.MeshStandardMaterial({ map: tx.dome.map, bumpMap: tx.dome.bump, bumpScale: 2, roughness: 0.35, metalness: 0.15 }),
      floor: new THREE.MeshStandardMaterial({ map: tx.floor.map, bumpMap: tx.floor.bump, bumpScale: 1.5, roughness: 0.3, metalness: 0.15 }),
      carpet: new THREE.MeshStandardMaterial({ map: tx.carpet.map, roughness: 0.95 }),
      wood: new THREE.MeshStandardMaterial({ map: tx.door.map, bumpMap: tx.door.bump, bumpScale: 3, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide }),
      wall: new THREE.MeshStandardMaterial({ map: tx.wall.map, roughness: 0.8, emissive: "#0B1230", emissiveIntensity: 0.4 }),
      hedge: new THREE.MeshStandardMaterial({ map: tx.hedge.map, roughness: 0.95 }),
      water: new THREE.MeshStandardMaterial({ color: "#163A55", roughness: 0.1, metalness: 0.6, emissive: "#0E2A44", emissiveIntensity: 0.6 }),
      flame: new THREE.MeshBasicMaterial({ color: "#FFD27A" }),
      lantern: new THREE.MeshStandardMaterial({ color: "#FFC766", emissive: "#FFB347", emissiveIntensity: 1.4, roughness: 0.4 }),
      window: new THREE.MeshBasicMaterial({ map: tx.window.map, color: "#FFCF7A" }),
    };
  }, [gold, quality]);
}
type Mats = ReturnType<typeof useMaterials>;

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/** A brass lamp stand with a flickering flame. */
function BrassLamp({ position, mats, flames }: { position: [number, number, number]; mats: Mats; flames: MutableRefObject<THREE.Object3D[]> }) {
  return (
    <group position={position}>
      <mesh material={mats.gold} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 0.12, 16]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 1.3, 10]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.26, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <mesh
        material={mats.flame}
        position={[0, 1.62, 0]}
        ref={(m) => {
          if (m && !flames.current.includes(m)) flames.current.push(m);
        }}
      >
        <coneGeometry args={[0.07, 0.26, 8]} />
      </mesh>
    </group>
  );
}

/** A palace front: arched wall, gold trim, domes and lit jharokha windows. */
function Facade({
  z,
  mats,
  children,
}: {
  z: number;
  mats: Mats;
  children?: ReactNode;
}) {
  const wall = useMemo(() => archedWall(22, 8, 2, 3.6, 1), []);
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={wall} material={mats.stone} position={[0, 0, -0.5]} />
      <mesh material={mats.gold} position={[0, 3.6, 0.55]}>
        <torusGeometry args={[2.12, 0.1, 8, 32, Math.PI]} />
      </mesh>
      <mesh material={mats.gold} position={[-2.12, 1.8, 0.55]}>
        <boxGeometry args={[0.2, 3.6, 0.2]} />
      </mesh>
      <mesh material={mats.gold} position={[2.12, 1.8, 0.55]}>
        <boxGeometry args={[0.2, 3.6, 0.2]} />
      </mesh>
      {/* Cornice and domes */}
      <mesh material={mats.gold} position={[0, 8.1, 0]}>
        <boxGeometry args={[22.4, 0.25, 1.3]} />
      </mesh>
      <mesh material={mats.dome} position={[0, 8.2, -1.2]}>
        <sphereGeometry args={[2.6, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 11.3, -1.2]}>
        <coneGeometry args={[0.18, 1.1, 8]} />
      </mesh>
      {[-8, 8].map((x) => (
        <group key={x} position={[x, 8.2, -0.2]}>
          <mesh material={mats.stone} position={[0, 0.6, 0]}>
            <boxGeometry args={[1.8, 1.2, 1.8]} />
          </mesh>
          <mesh material={mats.dome} position={[0, 1.2, 0]}>
            <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={mats.gold} position={[0, 2.5, 0]}>
            <coneGeometry args={[0.1, 0.6, 6]} />
          </mesh>
        </group>
      ))}
      {/* Jharokha windows: they brighten as the palace lights up. */}
      {[-5.5, 5.5].flatMap((x) =>
        [2.2, 5.6].map((y) => (
          <group key={`${x}-${y}`} position={[x, y, 0.52]}>
            <mesh material={mats.window}>
              <planeGeometry args={[1, 1.5]} />
            </mesh>
            <mesh material={mats.gold} position={[0, 0.75, 0.02]}>
              <torusGeometry args={[0.5, 0.05, 6, 16, Math.PI]} />
            </mesh>
            <mesh material={mats.gold} position={[0, -0.8, 0.12]}>
              <boxGeometry args={[1.3, 0.1, 0.35]} />
            </mesh>
          </group>
        ))
      )}
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The scene                                                           */
/* ------------------------------------------------------------------ */

const lerp3 = (a: [number, number, number], b: [number, number, number], t: number) =>
  new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
const smooth = (t: number) => t * t * (3 - 2 * t);

function samplePose(track: ShotTrack): { pos: THREE.Vector3; look: THREE.Vector3; bg: THREE.Color; gate: number; glow: number } | null {
  const { poses, at } = track;
  if (poses.length === 0) return null;
  const i = Math.max(0, Math.min(poses.length - 1, Math.floor(at)));
  const a: Pose = poses[i];
  const b: Pose = poses[Math.min(poses.length - 1, i + 1)];
  const t = smooth(Math.max(0, Math.min(1, at - i)));
  return {
    pos: lerp3(a.pos, b.pos, t),
    look: lerp3(a.look, b.look, t),
    bg: new THREE.Color(a.bg).lerp(new THREE.Color(b.bg), t),
    gate: a.gate + (b.gate - a.gate) * t,
    glow: a.glow + (b.glow - a.glow) * t,
  };
}

function Palace({
  track,
  quality,
  still,
  gold,
}: {
  track: MutableRefObject<ShotTrack>;
  quality: Quality;
  still: boolean;
  gold: string;
}) {
  const budget = BUDGET[quality];
  const mats = useMaterials(gold, quality);
  const glowTex = useMemo(() => glowTexture(), []);
  const jali = useMemo(() => {
    const tex = jaliTexture(gold);
    tex.repeat.set(16, 2);
    return tex;
  }, [gold]);
  const { scene, camera, gl } = useThree();

  // Soft studio reflections so gold and marble read as metal and stone
  // rather than flat paint. Generated, not downloaded; skipped on low-end.
  const envMap = useMemo(() => {
    if (quality === "low") return null;
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl, quality]);
  useEffect(() => () => envMap?.dispose(), [envMap]);

  // Free the painted textures with their materials.
  useEffect(
    () => () =>
      Object.values(mats).forEach((m) => {
        const std = m as THREE.MeshStandardMaterial;
        std.map?.dispose();
        std.bumpMap?.dispose();
        m.dispose();
      }),
    [mats]
  );
  // Brightened every frame with the palace's glow (shared by all windows).
  const windowMat = useRef<THREE.MeshBasicMaterial | null>(null);
  useLayoutEffect(() => {
    windowMat.current = mats.window;
  }, [mats]);

  const flames = useRef<THREE.Object3D[]>([]);
  const doorL = useRef<THREE.Group>(null);
  const doorR = useRef<THREE.Group>(null);
  const chandeliers = useRef<THREE.Group>(null);
  const dustGroup = useRef<THREE.Group>(null);
  const dustGeo = useRef<THREE.BufferGeometry>(null);
  const dustMat = useRef<THREE.PointsMaterial>(null);
  const haloMat = useRef<THREE.PointsMaterial>(null);
  const petals = useRef<THREE.InstancedMesh>(null);
  const diyas = useRef<THREE.InstancedMesh>(null);
  const lights = useRef<THREE.PointLight[]>([]);
  const look = useRef(new THREE.Vector3(0, 2.6, 0));
  const state = useRef({ gate: 0, glow: 0.3, bg: new THREE.Color("#04060E") });

  const leaf = useMemo(() => doorLeaf(2, 3.6), []);

  // Pillars, capitals, bases, arches, lanterns: instanced.
  const pillarItems = useMemo(
    () => PILLAR_Z.flatMap((z) => [-PILLAR_X, PILLAR_X].map((x) => ({ p: [x, 2.1, z] as [number, number, number] }))),
    []
  );
  const capitalItems = useMemo(() => pillarItems.map((it) => ({ p: [it.p[0], 4.35, it.p[2]] as [number, number, number] })), [pillarItems]);
  const baseItems = useMemo(() => pillarItems.map((it) => ({ p: [it.p[0], 0.17, it.p[2]] as [number, number, number] })), [pillarItems]);
  const archItems = useMemo(() => PILLAR_Z.map((z) => ({ p: [0, 4.5, z] as [number, number, number] })), []);
  const lanternItems = useMemo(
    () => LANTERN_Z.map((z) => ({ p: [0, 5.4, z] as [number, number, number], s: [0.22, 0.34, 0.22] as [number, number, number] })),
    []
  );
  const pillarRef = useRef<THREE.InstancedMesh>(null);
  const capitalRef = useRef<THREE.InstancedMesh>(null);
  const baseRef = useRef<THREE.InstancedMesh>(null);
  const archRef = useRef<THREE.InstancedMesh>(null);
  const lanternRef = useRef<THREE.InstancedMesh>(null);
  useInstances(pillarRef, pillarItems);
  useInstances(capitalRef, capitalItems);
  useInstances(baseRef, baseItems);
  useInstances(archRef, archItems);
  useInstances(lanternRef, lanternItems);

  // Halos: one Points layer for every light source (cheap "bloom").
  const halos = useMemo(() => {
    const pts: number[] = [];
    [-3.3, 3.3].forEach((x) => pts.push(x, 1.66, 1.8));
    LANTERN_Z.forEach((z) => pts.push(0, 5.4, z));
    CHANDELIER_Z.forEach((z) => pts.push(0, 6.1, z));
    [-6, 6].forEach((x) => [-44, -56].forEach((z) => pts.push(x, 1.66, z)));
    pts.push(0, 2.2, -60.3);
    return new Float32Array(pts);
  }, []);

  // Gold dust around the camera.
  const dust = useMemo(() => {
    const arr = new Float32Array(budget.dust * 3);
    const speed = new Float32Array(budget.dust);
    const random = seeded(7);
    for (let i = 0; i < budget.dust; i++) {
      arr[i * 3] = (random() - 0.5) * 12;
      arr[i * 3 + 1] = random() * 6;
      arr[i * 3 + 2] = (random() - 0.5) * 18;
      speed[i] = 0.05 + random() * 0.12;
    }
    return { arr, speed };
  }, [budget.dust]);

  // Mutated every frame, so it lives in a ref.
  const petalState = useRef<Petal[]>([]);
  useLayoutEffect(() => {
    const random = seeded(11);
    petalState.current = Array.from({ length: budget.petals }, () => ({
        x: (random() - 0.5) * 10,
        y: random() * 6,
        z: (random() - 0.5) * 14,
        spin: random() * Math.PI,
      v: 0.25 + random() * 0.25,
    }));
    const mesh = petals.current;
    if (!mesh) return;
    const palette = ["#F3D27A", "#FFF6E8", "#B5374E", "#E98A3B"].map((c) => new THREE.Color(c));
    petalState.current.forEach((_, i) => mesh.setColorAt(i, palette[i % palette.length]));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [budget.petals]);

  const diyaItems = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { p: [Math.cos(a) * 1.5, 0.56, -51 + Math.sin(a) * 1.5] as [number, number, number] };
      }),
    []
  );
  useInstances(diyas, diyaItems);

  useFrame((frame, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const t = frame.clock.elapsedTime;
    const target = samplePose(track.current);
    if (target) {
      const k = still ? 1 : 1 - Math.exp(-2.4 * delta);
      camera.position.lerp(target.pos, k);
      look.current.lerp(target.look, k);
      camera.lookAt(look.current);
      const s = state.current;
      s.gate += (target.gate - s.gate) * (still ? 1 : 1 - Math.exp(-1.6 * delta));
      s.glow += (target.glow - s.glow) * k;
      s.bg.lerp(target.bg, k);
    }
    const s = state.current;
    if (scene.background instanceof THREE.Color) scene.background.copy(s.bg);
    if (scene.fog) scene.fog.color.copy(s.bg);

    // Doors swing inward.
    const swing = smooth(Math.min(1, s.gate)) * 1.75;
    if (doorL.current) doorL.current.rotation.y = swing;
    if (doorR.current) doorR.current.rotation.y = -swing;

    // Light levels follow the glow.
    if (windowMat.current) windowMat.current.color.copy(WINDOW_DIM).lerp(WINDOW_LIT, s.glow);
    if (haloMat.current) haloMat.current.opacity = 0.45 + s.glow * 0.55;
    lights.current.forEach((l, i) => {
      l.intensity = (6 + s.glow * 10) * (still ? 1 : 0.92 + Math.sin(t * 9 + i * 2.1) * 0.08);
    });

    if (still) return;

    flames.current.forEach((f, i) => {
      f.scale.y = 1 + Math.sin(t * 13 + i * 1.7) * 0.12 + Math.sin(t * 7.3 + i) * 0.06;
      f.scale.x = f.scale.z = 1 - Math.sin(t * 11 + i) * 0.06;
    });
    if (chandeliers.current) chandeliers.current.children.forEach((c, i) => (c.rotation.y = t * 0.08 * (i % 2 ? -1 : 1)));

    // Dust and petals ride along with the camera.
    if (dustGroup.current) dustGroup.current.position.lerp(camera.position, 1 - Math.exp(-1.2 * delta));
    const geo = dustGeo.current;
    if (geo) {
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < budget.dust; i++) {
        let y = pos.getY(i) + dust.speed[i] * delta;
        if (y > 6) y = 0;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(t * 0.4 + i) * 0.002);
      }
      pos.needsUpdate = true;
    }
    if (dustMat.current) dustMat.current.opacity = 0.55 + Math.sin(t * 1.3) * 0.15;
    const pm = petals.current;
    if (pm) {
      petalState.current.forEach((p, i) => {
        p.y -= p.v * delta;
        if (p.y < -1.5) p.y = 5.5;
        tmp.position.set(p.x + Math.sin(t * 0.7 + i) * 0.4, p.y - 1.5, p.z);
        tmp.rotation.set(t * 0.9 + p.spin, t * 0.6 + i, p.spin);
        tmp.scale.setScalar(1);
        tmp.updateMatrix();
        pm.setMatrixAt(i, tmp.matrix);
      });
      pm.instanceMatrix.needsUpdate = true;
    }
    const dm = diyas.current;
    if (dm) {
      diyaItems.forEach((d, i) => {
        tmp.position.set(d.p[0], d.p[1] + Math.sin(t * 1.2 + i) * 0.03, d.p[2]);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.setScalar(1);
        tmp.updateMatrix();
        dm.setMatrixAt(i, tmp.matrix);
      });
      dm.instanceMatrix.needsUpdate = true;
    }
  });

  const addLight = (l: THREE.PointLight | null) => {
    if (l && !lights.current.includes(l)) lights.current.push(l);
  };

  return (
    <>
      <color attach="background" args={["#04060E"]} />
      {envMap && <primitive attach="environment" object={envMap} />}
      <fog attach="fog" args={["#04060E", 12, 52]} />
      <ambientLight intensity={budget.lights === 0 ? 0.75 : 0.45} color="#A8A2B8" />
      <hemisphereLight args={["#3A4A80", "#5A3A18", 0.6]} />
      <directionalLight position={[-6, 12, 8]} intensity={0.7} color="#BFCBFF" />
      <directionalLight position={[0, 8, -30]} intensity={0.35} color="#FFC877" />

      {/* Floor, carpet and gold borders */}
      <mesh material={mats.floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]}>
        <planeGeometry args={[40, 120]} />
      </mesh>
      <mesh material={mats.carpet} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -20]}>
        <planeGeometry args={[2.2, 40]} />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} material={mats.gold} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, -20]}>
          <planeGeometry args={[0.08, 40]} />
        </mesh>
      ))}

      {/* Front facade with the gate */}
      <Facade z={0} mats={mats}>
        <group ref={doorL} position={[-2, 0, -0.1]}>
          <mesh geometry={leaf} material={mats.wood} />
          <mesh material={mats.gold} position={[1.7, 1.7, 0.2]}>
            <torusGeometry args={[0.12, 0.025, 6, 16]} />
          </mesh>
        </group>
        <group ref={doorR} position={[2, 0, -0.1]} scale={[-1, 1, 1]}>
          <mesh geometry={leaf} material={mats.wood} />
          <mesh material={mats.gold} position={[1.7, 1.7, 0.2]}>
            <torusGeometry args={[0.12, 0.025, 6, 16]} />
          </mesh>
        </group>
      </Facade>
      <BrassLamp position={[-3.3, 0, 1.8]} mats={mats} flames={flames} />
      <BrassLamp position={[3.3, 0, 1.8]} mats={mats} flames={flames} />
      {budget.lights >= 2 && (
        <>
          <pointLight ref={addLight} position={[-3.3, 2, 2.2]} color="#FFB45C" distance={12} decay={2} />
          <pointLight ref={addLight} position={[3.3, 2, 2.2]} color="#FFB45C" distance={12} decay={2} />
        </>
      )}

      {/* The pillared hall */}
      <instancedMesh ref={pillarRef} args={[undefined, undefined, pillarItems.length]} material={mats.pillar}>
        <cylinderGeometry args={[0.3, 0.34, 4.2, 14]} />
      </instancedMesh>
      <instancedMesh ref={capitalRef} args={[undefined, undefined, capitalItems.length]} material={mats.gold}>
        <boxGeometry args={[0.85, 0.3, 0.85]} />
      </instancedMesh>
      <instancedMesh ref={baseRef} args={[undefined, undefined, baseItems.length]} material={mats.stone}>
        <boxGeometry args={[0.9, 0.34, 0.9]} />
      </instancedMesh>
      <instancedMesh ref={archRef} args={[undefined, undefined, archItems.length]} material={mats.gold}>
        <torusGeometry args={[PILLAR_X, 0.1, 6, 28, Math.PI]} />
      </instancedMesh>
      <instancedMesh ref={lanternRef} args={[undefined, undefined, lanternItems.length]} material={mats.lantern}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>
      {/* Jali screens glowing along both sides, dark walls behind */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 5.2, 2.4, -20]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <planeGeometry args={[40, 4.8]} />
            <meshBasicMaterial map={jali} transparent opacity={0.55} color={gold} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh material={mats.wall} position={[side * 5.6, 3, -20]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <planeGeometry args={[40, 6]} />
          </mesh>
        </group>
      ))}
      {/* Chandeliers */}
      <group ref={chandeliers}>
        {CHANDELIER_Z.map((z) => (
          <group key={z} position={[0, 6.1, z]}>
            <mesh material={mats.gold}>
              <torusGeometry args={[1.1, 0.04, 6, 40]} />
            </mesh>
            <mesh material={mats.gold} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.6, 0.03, 6, 30]} />
            </mesh>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <mesh key={i} material={mats.lantern} position={[Math.cos(a) * 1.1, 0.08, Math.sin(a) * 1.1]}>
                  <sphereGeometry args={[0.07, 8, 6]} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
      {budget.lights >= 4 &&
        CHANDELIER_Z.map((z) => <pointLight key={z} ref={addLight} position={[0, 5.6, z]} color="#FFC877" distance={14} decay={2} />)}

      {/* Courtyard: hedges, fountain with floating diyas, lamp posts */}
      {[-1, 1].map((side) => (
        <mesh key={side} material={mats.hedge} position={[side * 8, 0.6, -50]}>
          <boxGeometry args={[1.2, 1.2, 16]} />
        </mesh>
      ))}
      <group position={[0, 0, -51]}>
        <mesh material={mats.marble} position={[0, 0.27, 0]}>
          <cylinderGeometry args={[2.4, 2.5, 0.55, 40]} />
        </mesh>
        <mesh material={mats.water} position={[0, 0.55, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.02, 40]} />
        </mesh>
        <mesh material={mats.marble} position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 1.2, 12]} />
        </mesh>
        <mesh material={mats.marble} position={[0, 1.7, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.8, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.76, 0.82, 32]} />
        </mesh>
      </group>
      <instancedMesh ref={diyas} args={[undefined, undefined, diyaItems.length]} material={mats.lantern}>
        <sphereGeometry args={[0.07, 8, 6]} />
      </instancedMesh>
      {[-6, 6].flatMap((x) => [-44, -56].map((z) => <BrassLamp key={`${x}${z}`} position={[x, 0, z]} mats={mats} flames={flames} />))}
      {budget.lights >= 2 && <pointLight ref={addLight} position={[0, 3, -51]} color="#FFB45C" distance={16} decay={2} />}

      {/* The inner palace, lit from within */}
      <Facade z={-60} mats={mats}>
        <mesh material={mats.window} position={[0, 2.6, -0.3]}>
          <planeGeometry args={[4, 5.6]} />
        </mesh>
      </Facade>
      {budget.lights >= 4 && <pointLight ref={addLight} position={[0, 3, -57]} color="#FFC877" distance={14} decay={2} />}

      {/* Halos for every flame and lantern */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[halos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={haloMat}
          map={glowTex}
          size={2.2}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#FFD08A"
        />
      </points>

      {/* Gold dust and petals that travel with the camera */}
      <group ref={dustGroup} position={[0, 0, 13]}>
        <points position={[0, -1.6, 0]}>
          <bufferGeometry ref={dustGeo}>
            <bufferAttribute attach="attributes-position" args={[dust.arr, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={dustMat}
            map={glowTex}
            size={0.09}
            sizeAttenuation
            transparent
            opacity={0.6}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color={gold}
          />
        </points>
        {budget.petals > 0 && (
          <instancedMesh ref={petals} args={[undefined, undefined, budget.petals]}>
            <planeGeometry args={[0.12, 0.07]} />
            <meshStandardMaterial side={THREE.DoubleSide} roughness={0.8} />
          </instancedMesh>
        )}
      </group>
    </>
  );
}

/**
 * The Royal Palace 3D world: a gate in a moonlit facade, a pillared hall
 * with jali screens and chandeliers, a courtyard fountain with floating
 * diyas, and the inner palace. The camera follows `track` (scroll), so the
 * scene is pure decoration — every word on the page is HTML above it.
 *
 * Kept light for phones: instanced pillars/arches/lanterns, no shadows, no
 * post-processing, one Points layer standing in for bloom, a capped DPR and
 * a per-device budget (`quality`). `frameloop` is decided by the parent:
 * "never" off screen or in a hidden tab, "demand" for reduced motion.
 */
export default function PalaceScene({
  track,
  quality,
  still,
  frameloop,
  gold,
  onInvalidate,
}: {
  track: MutableRefObject<ShotTrack>;
  quality: Quality;
  /** Reduced motion: no idle animation, camera jumps straight to its pose. */
  still: boolean;
  frameloop: "always" | "demand" | "never";
  gold: string;
  /** Hands the parent a way to request a frame in "demand" mode. */
  onInvalidate: (fn: () => void) => void;
}) {
  return (
    <Canvas
      dpr={BUDGET[quality].dpr}
      frameloop={frameloop}
      gl={{ antialias: quality === "high", alpha: false, powerPreference: quality === "low" ? "low-power" : "default" }}
      camera={{ position: [0, 1.7, 13], fov: 55, near: 0.1, far: 120 }}
      scene={{ environmentIntensity: 0.3 }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ invalidate }) => onInvalidate(() => invalidate())}
    >
      <Palace track={track} quality={quality} still={still} gold={gold} />
    </Canvas>
  );
}

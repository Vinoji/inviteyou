"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Pose, ShotTrack, WorldId } from "./shots";
import { seeded } from "./textures";
import { BUDGET, tmp, useCommonMaterials, type Quality, type WorldDef } from "./scene/kit";
import { palaceWorld } from "./scene/PalaceWorld";
import { templeWorld } from "./scene/TempleWorld";
import { cathedralWorld } from "./scene/CathedralWorld";

export type { Quality } from "./scene/kit";

const WORLDS: Record<WorldId, WorldDef> = {
  palace: palaceWorld,
  temple: templeWorld,
  cathedral: cathedralWorld,
};

const WINDOW_DIM = new THREE.Color("#6A4A24");
const WINDOW_LIT = new THREE.Color("#FFFFFF");

interface Petal {
  x: number;
  y: number;
  z: number;
  spin: number;
  v: number;
}

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

const lerp3 = (a: [number, number, number], b: [number, number, number], t: number) =>
  new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
const smooth = (t: number) => t * t * (3 - 2 * t);

function samplePose(track: ShotTrack) {
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

/** The engine: camera on the scroll path, sky and fog, glow, lights,
 * halos, gold dust and petals — around whichever world's architecture. */
function Engine({
  world,
  track,
  quality,
  still,
  gold,
}: {
  world: WorldDef;
  track: MutableRefObject<ShotTrack>;
  quality: Quality;
  still: boolean;
  gold: string;
}) {
  const budget = BUDGET[quality];
  const mats = useCommonMaterials(gold, budget.tex);
  const glowTex = useMemo(() => glowTexture(), []);
  const { scene, camera, gl } = useThree();
  const { Architecture, light } = world;

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

  const flames = useRef<THREE.Object3D[]>([]);
  const doorL = useRef<THREE.Group>(null);
  const doorR = useRef<THREE.Group>(null);
  const dustGroup = useRef<THREE.Group>(null);
  const dustGeo = useRef<THREE.BufferGeometry>(null);
  const dustMat = useRef<THREE.PointsMaterial>(null);
  const haloMat = useRef<THREE.PointsMaterial>(null);
  const smallHaloMat = useRef<THREE.PointsMaterial>(null);
  const petals = useRef<THREE.InstancedMesh>(null);
  const lights = useRef<THREE.PointLight[]>([]);
  const glass = useRef<THREE.MeshBasicMaterial[]>([]);
  const look = useRef(new THREE.Vector3(0, 2.6, 0));
  const state = useRef({ gate: 0, glow: 0.3, bg: new THREE.Color("#04060E") });

  const addLight = useCallback((l: THREE.PointLight | null) => {
    if (l && !lights.current.includes(l)) lights.current.push(l);
  }, []);
  const addGlow = useCallback((m: THREE.MeshBasicMaterial | null) => {
    if (m && !glass.current.includes(m)) glass.current.push(m);
  }, []);
  useLayoutEffect(() => addGlow(mats.window), [mats, addGlow]);

  const halos = useMemo(() => new Float32Array(world.halos), [world]);
  const smallHalos = useMemo(() => (world.smallHalos ? new Float32Array(world.smallHalos) : null), [world]);

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
    const palette = world.petals.map((c) => new THREE.Color(c));
    petalState.current.forEach((_, i) => mesh.setColorAt(i, palette[i % palette.length]));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [budget.petals, world]);

  useFrame((frame, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const t = frame.clock.elapsedTime;
    const target = samplePose(track.current);
    const s = state.current;
    if (target) {
      const k = still ? 1 : 1 - Math.exp(-2.4 * delta);
      camera.position.lerp(target.pos, k);
      look.current.lerp(target.look, k);
      camera.lookAt(look.current);
      s.gate += (target.gate - s.gate) * (still ? 1 : 1 - Math.exp(-1.6 * delta));
      s.glow += (target.glow - s.glow) * k;
      s.bg.lerp(target.bg, k);
    }
    if (scene.background instanceof THREE.Color) scene.background.copy(s.bg);
    if (scene.fog) scene.fog.color.copy(s.bg);

    // Doors swing inward.
    const swing = smooth(Math.min(1, s.gate)) * 1.75;
    if (doorL.current) doorL.current.rotation.y = swing;
    if (doorR.current) doorR.current.rotation.y = -swing;

    // Light levels follow the glow.
    glass.current.forEach((m) => m.color.copy(WINDOW_DIM).lerp(WINDOW_LIT, s.glow));
    if (haloMat.current) haloMat.current.opacity = 0.45 + s.glow * 0.55;
    if (smallHaloMat.current) smallHaloMat.current.opacity = 0.5 + s.glow * 0.5;
    lights.current.forEach((l, i) => {
      l.intensity = (6 + s.glow * 10) * (still ? 1 : 0.92 + Math.sin(t * 9 + i * 2.1) * 0.08);
    });

    if (still) return;

    flames.current.forEach((f, i) => {
      f.scale.y = 1 + Math.sin(t * 13 + i * 1.7) * 0.12 + Math.sin(t * 7.3 + i) * 0.06;
      f.scale.x = f.scale.z = 1 - Math.sin(t * 11 + i) * 0.06;
    });

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
  });

  return (
    <>
      <color attach="background" args={["#04060E"]} />
      {envMap && <primitive attach="environment" object={envMap} />}
      <fog attach="fog" args={["#04060E", light.fog[0], light.fog[1]]} />
      <ambientLight intensity={budget.lights === 0 ? light.ambientIntensity + 0.3 : light.ambientIntensity} color={light.ambient} />
      <hemisphereLight args={[light.sky, light.ground, 0.6]} />
      <directionalLight position={[-6, 12, 8]} intensity={0.7} color={light.moon} />
      <directionalLight position={[0, 8, -30]} intensity={0.35} color={light.warm} />

      <Architecture
        mats={mats}
        budget={budget}
        gold={gold}
        still={still}
        flames={flames}
        doorL={doorL}
        doorR={doorR}
        addLight={addLight}
        addGlow={addGlow}
      />

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
      {smallHalos && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[smallHalos, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={smallHaloMat}
            map={glowTex}
            size={0.55}
            sizeAttenuation
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color="#FFD08A"
          />
        </points>
      )}

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
 * The 3D world behind a premium invitation — the royal palace, the Hindu
 * temple or the cathedral (scene/*World.tsx). The camera follows `track`
 * (scroll), so the scene is pure decoration: every word on the page is
 * HTML above it.
 *
 * Kept light for phones: instanced architecture, no shadows, no
 * post-processing, Points layers standing in for bloom, a capped DPR and a
 * per-device budget (`quality`). `frameloop` is decided by the parent:
 * "never" off screen or in a hidden tab, "demand" for reduced motion.
 */
export default function PalaceScene({
  world,
  track,
  quality,
  still,
  frameloop,
  gold,
  onInvalidate,
}: {
  world: WorldId;
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
      camera={{ position: [0, 1.7, 13], fov: 55, near: 0.1, far: 140 }}
      scene={{ environmentIntensity: 0.3 }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ invalidate }) => onInvalidate(() => invalidate())}
    >
      <Engine world={WORLDS[world]} track={track} quality={quality} still={still} gold={gold} />
    </Canvas>
  );
}

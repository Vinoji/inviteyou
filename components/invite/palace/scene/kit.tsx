"use client";

import { useEffect, useLayoutEffect, useMemo, type ComponentType, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import { makeCommonTextures } from "../textures";

/**
 * Shared pieces for the 3D worlds (palace, temple, cathedral): device
 * budgets, geometry helpers, the materials every world uses, and the props
 * a world's architecture receives from the engine (PalaceScene).
 */

export type Quality = "low" | "mid" | "high";

export interface Budget {
  dust: number;
  petals: number;
  lights: number;
  dpr: [number, number];
  /** Texture resolution. */
  tex: number;
}

/** Per-tier budget. Low-end phones get no dynamic lights and far fewer particles. */
export const BUDGET: Record<Quality, Budget> = {
  low: { dust: 70, petals: 0, lights: 0, dpr: [1, 1], tex: 256 },
  mid: { dust: 140, petals: 14, lights: 2, dpr: [1, 1.5], tex: 512 },
  high: { dust: 240, petals: 28, lights: 4, dpr: [1, 1.75], tex: 512 },
};

/** Pillar rows down every world's hall (the camera path assumes these). */
export const PILLAR_Z = [-3, -7, -11, -15, -19, -23, -27, -31, -35, -39];

export const tmp = new THREE.Object3D();

export type V3 = [number, number, number];
export interface Item {
  p: V3;
  s?: V3;
  r?: V3;
}

/** Writes a list of transforms (and optional colours) into an instanced mesh. */
export function useInstances(ref: RefObject<THREE.InstancedMesh | null>, items: Item[], colors?: string[]) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, i) => {
      tmp.position.set(...it.p);
      tmp.rotation.set(...(it.r ?? [0, 0, 0]));
      tmp.scale.set(...(it.s ?? [1, 1, 1]));
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
      if (colors) mesh.setColorAt(i, new THREE.Color(colors[i % colors.length]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [ref, items, colors]);
}

/** Disposes a record of materials (and their textures) on unmount. */
export function useDisposeMaterials(mats: Record<string, THREE.Material | THREE.Material[]>) {
  useEffect(
    () => () =>
      Object.values(mats)
        .flat()
        .forEach((m) => {
          const std = m as THREE.MeshStandardMaterial;
          std.map?.dispose();
          std.bumpMap?.dispose();
          m.dispose();
        }),
    [mats]
  );
}

/** A wall with an opening: "round" arch, "pointed" Gothic arch or a "flat"
 * lintel. Outer w × h, opening ±half wide, springing at `spring`. */
export function gatewayWall(w: number, h: number, half: number, spring: number, depth: number, kind: "round" | "pointed" | "flat") {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(-half, 0);
  shape.lineTo(-half, spring);
  if (kind === "round") shape.absarc(0, spring, half, Math.PI, 0, true);
  else if (kind === "pointed") {
    shape.quadraticCurveTo(-half, spring + half * 1.25, 0, spring + half * 1.7);
    shape.quadraticCurveTo(half, spring + half * 1.25, half, spring);
  } else shape.lineTo(half, spring);
  shape.lineTo(half, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h);
  shape.lineTo(-w / 2, h);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 20 });
}

/** One door leaf filling half of that opening, hinged at x = 0. */
export function doorLeaf(half: number, spring: number, kind: "round" | "pointed" | "flat") {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(half, 0);
  if (kind === "round") {
    shape.lineTo(half, spring + half);
    shape.absarc(half, spring, half, Math.PI / 2, Math.PI, false);
  } else if (kind === "pointed") {
    shape.lineTo(half, spring + half * 1.7);
    shape.quadraticCurveTo(0, spring + half * 1.25, 0, spring);
  } else {
    shape.lineTo(half, spring);
    shape.lineTo(0, spring);
  }
  shape.lineTo(0, 0);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false, curveSegments: 12 });
}

/** A band shaped like an arch (outer minus inner), for ribs and arcades. */
export function archRib(half: number, rise: number, thick: number, depth: number, pointed: boolean) {
  const outer = new THREE.Shape();
  const o = half + thick;
  outer.moveTo(-o, 0);
  if (pointed) {
    outer.quadraticCurveTo(-o, rise * 0.75 + thick, 0, rise + thick);
    outer.quadraticCurveTo(o, rise * 0.75 + thick, o, 0);
  } else outer.absarc(0, 0, o, Math.PI, 0, true);
  outer.lineTo(half, 0);
  if (pointed) {
    outer.quadraticCurveTo(half, rise * 0.75, 0, rise);
    outer.quadraticCurveTo(-half, rise * 0.75, -half, 0);
  } else outer.absarc(0, 0, half, 0, Math.PI, false);
  outer.closePath();
  return new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: false, curveSegments: 16 });
}

/** Points along a hanging garland from a to b (a catenary-ish sag). */
export function garland(a: V3, b: V3, beads: number, sag: number): V3[] {
  return Array.from({ length: beads }, (_, i) => {
    const t = i / (beads - 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * sag, a[2] + (b[2] - a[2]) * t];
  });
}

/** Materials every world shares: gold, the gate doors, flames, lanterns
 * and lit window glass. */
export function useCommonMaterials(gold: string, size: number) {
  const mats = useMemo(() => {
    const tx = makeCommonTextures(size, gold);
    return {
      gold: new THREE.MeshStandardMaterial({ color: gold, metalness: 0.9, roughness: 0.28, emissive: gold, emissiveIntensity: 0.1 }),
      wood: new THREE.MeshStandardMaterial({ map: tx.door.map, bumpMap: tx.door.bump, bumpScale: 3, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide }),
      flame: new THREE.MeshBasicMaterial({ color: "#FFD27A" }),
      lantern: new THREE.MeshStandardMaterial({ color: "#FFC766", emissive: "#FFB347", emissiveIntensity: 1.4, roughness: 0.4 }),
      window: new THREE.MeshBasicMaterial({ map: tx.window.map, color: "#FFCF7A" }),
    };
  }, [gold, size]);
  useDisposeMaterials(mats);
  return mats;
}
export type CommonMats = ReturnType<typeof useCommonMaterials>;

/** What the engine hands each world's architecture. */
export interface WorldProps {
  mats: CommonMats;
  budget: Budget;
  gold: string;
  still: boolean;
  /** Flames to flicker. */
  flames: MutableRefObject<THREE.Object3D[]>;
  /** The gate's two leaves; the engine swings them open with the scroll. */
  doorL: RefObject<THREE.Group | null>;
  doorR: RefObject<THREE.Group | null>;
  /** Point lights whose intensity follows the glow. */
  addLight: (l: THREE.PointLight | null) => void;
  /** Unlit glass (windows, stained glass) brightened with the glow. */
  addGlow: (m: THREE.MeshBasicMaterial | null) => void;
  /** Taps on the scene (from the page, where no content covers it):
   * the handler gets a ray from the camera through the tap. */
  registerTap: (handler: (ray: THREE.Raycaster) => void) => void;
}

/** A world: its architecture plus what the engine needs to light it. */
export interface WorldDef {
  Architecture: ComponentType<WorldProps>;
  /** Positions of every flame / lamp, for the additive halo layer. */
  halos: number[];
  /** Small flames (candles, agal lamps) — a smaller halo each. */
  smallHalos?: number[];
  light: {
    ambient: string;
    ambientIntensity: number;
    sky: string;
    ground: string;
    moon: string;
    warm: string;
    fog: [number, number];
  };
  petals: string[];
}

/** Registers a flame mesh with the flicker list. */
export function flameRef(flames: MutableRefObject<THREE.Object3D[]>) {
  return (m: THREE.Object3D | null) => {
    if (m && !flames.current.includes(m)) flames.current.push(m);
  };
}

/** A brass lamp stand with a flickering flame. */
export function BrassLamp({
  position,
  mats,
  flames,
  scale = 1,
}: {
  position: V3;
  mats: CommonMats;
  flames: MutableRefObject<THREE.Object3D[]>;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh material={mats.gold} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 0.12, 16]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 1.3, 10]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.26, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <mesh material={mats.flame} position={[0, 1.62, 0]} ref={flameRef(flames)}>
        <coneGeometry args={[0.07, 0.26, 8]} />
      </mesh>
    </group>
  );
}

/** The two gate leaves, hinged on either side of an opening ±half wide. */
export function GateDoors({
  doorL,
  doorR,
  geometry,
  mats,
  half,
  z = -0.1,
}: {
  doorL: RefObject<THREE.Group | null>;
  doorR: RefObject<THREE.Group | null>;
  geometry: THREE.BufferGeometry;
  mats: CommonMats;
  half: number;
  z?: number;
}) {
  return (
    <>
      <group ref={doorL} position={[-half, 0, z]}>
        <mesh geometry={geometry} material={mats.wood} />
        <mesh material={mats.gold} position={[half - 0.3, 1.7, 0.2]}>
          <torusGeometry args={[0.12, 0.025, 6, 16]} />
        </mesh>
      </group>
      <group ref={doorR} position={[half, 0, z]} scale={[-1, 1, 1]}>
        <mesh geometry={geometry} material={mats.wood} />
        <mesh material={mats.gold} position={[half - 0.3, 1.7, 0.2]}>
          <torusGeometry args={[0.12, 0.025, 6, 16]} />
        </mesh>
      </group>
    </>
  );
}

"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeParkTextures } from "../parkTextures";
import { seeded } from "../textures";
import Couple from "./Couple";
import { tmp, useDisposeMaterials, useInstances, type Item, type V3, type WorldDef, type WorldProps } from "./kit";

/**
 * Blossom Park 3D: a park at twilight. Iron gates under an arch of
 * blossom open onto a winding stone path between cherry trees, over a red
 * bridge across a river, to a waterfall falling into a lily pool. Lamps
 * light the path, fireflies drift, birds circle — and the couple walk hand
 * in hand ahead of the camera as the guest scrolls.
 *
 * Interactive: a tap on the scene (anywhere not covered by content) shakes
 * a blossom tree into a shower of petals, ripples the water, scatters the
 * birds, makes the couple glow with hearts, or puffs petals on the grass.
 */

/** The path's gentle S-curve. */
export const pathX = (z: number) => 1.6 * Math.sin(z / 9);
const RIVER_Z = -26;
const BRIDGE = { from: -22, to: -30, rise: 1.1 };
const POOL_Z = -55;
const LAMP_Z = [-2, -8, -14, -20, -33, -39, -45, -51];
const BLOSSOMS = ["#F7C6D9", "#F2A7C3", "#FADDE8", "#E88BB0", "#FFE4EE"];

/** Height of the walkway at z (the bridge arches over the river). */
function walkY(z: number) {
  if (z > BRIDGE.from || z < BRIDGE.to) return 0.02;
  const t = (z - BRIDGE.from) / (BRIDGE.to - BRIDGE.from);
  return 0.05 + Math.sin(Math.PI * t) * BRIDGE.rise;
}

interface Tree {
  p: V3;
  scale: number;
  lean: number;
}

/** Trees either side of the path (not on the river), plus an outer row. */
function plantTrees(): Tree[] {
  const rand = seeded(201);
  const trees: Tree[] = [];
  for (const z of [-4, -9, -14, -19, -33, -38, -43, -48]) {
    for (const side of [-1, 1]) {
      trees.push({ p: [pathX(z) + side * (3.1 + rand() * 0.8), 0, z + (rand() - 0.5) * 1.5], scale: 0.9 + rand() * 0.35, lean: (rand() - 0.5) * 0.25 });
      trees.push({ p: [pathX(z) + side * (7.5 + rand() * 3), 0, z - 2 + rand() * 2], scale: 1 + rand() * 0.4, lean: (rand() - 0.5) * 0.25 });
    }
  }
  return trees;
}
const BLOBS_PER_TREE = 6;

function useParkMaterials(size: number) {
  const mats = useMemo(() => {
    const tx = makeParkTextures(size);
    return {
      sky: new THREE.MeshBasicMaterial({ map: tx.sky.map, side: THREE.BackSide, fog: false, depthWrite: false }),
      grass: new THREE.MeshStandardMaterial({ map: tx.grass.map, roughness: 0.95 }),
      path: new THREE.MeshStandardMaterial({ map: tx.path.map, bumpMap: tx.path.bump, bumpScale: 2, roughness: 0.85 }),
      bark: new THREE.MeshStandardMaterial({ map: tx.bark.map, roughness: 0.9 }),
      blossom: new THREE.MeshStandardMaterial({ roughness: 0.75, flatShading: true, emissive: "#3A1424", emissiveIntensity: 0.35 }),
      water: new THREE.MeshStandardMaterial({ map: tx.water.map, roughness: 0.12, metalness: 0.35, emissive: "#0A2A36", emissiveIntensity: 0.6 }),
      fall: new THREE.MeshBasicMaterial({ map: tx.waterfall.map, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
      rock: new THREE.MeshStandardMaterial({ map: tx.rock.map, roughness: 0.95, flatShading: true }),
      foliage: new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }),
      foam: new THREE.MeshStandardMaterial({ color: "#F4FBFF", roughness: 0.4, transparent: true, opacity: 0.75, emissive: "#9FD4EA", emissiveIntensity: 0.35 }),
      hill: new THREE.MeshStandardMaterial({ color: "#3A3858", roughness: 1, flatShading: true }),
      hedge: new THREE.MeshStandardMaterial({ color: "#2E5A2A", roughness: 1, flatShading: true }),
      iron: new THREE.MeshStandardMaterial({ color: "#1E1E26", roughness: 0.4, metalness: 0.7 }),
      lacquer: new THREE.MeshStandardMaterial({ color: "#B0303A", roughness: 0.5 }),
      plank: new THREE.MeshStandardMaterial({ color: "#7A4A2A", roughness: 0.8 }),
      stonePost: new THREE.MeshStandardMaterial({ color: "#CFC6B4", roughness: 0.8 }),
      pad: new THREE.MeshStandardMaterial({ color: "#3E7A3A", roughness: 0.8, side: THREE.DoubleSide }),
      groundPetal: new THREE.MeshStandardMaterial({ color: "#F7C6D9", roughness: 0.9, side: THREE.DoubleSide }),
      bird: new THREE.MeshBasicMaterial({ color: "#2A2238", side: THREE.DoubleSide }),
      petal: new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
      firefly: new THREE.PointsMaterial({ color: "#F6FF9A", size: 0.12, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
    };
  }, [size]);
  useDisposeMaterials(mats as unknown as Record<string, THREE.Material>);
  return mats;
}

/** A ribbon following the path, `width` wide. */
function pathRibbon(width: number) {
  const pts: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  const zs: number[] = [];
  for (let z = 18; z >= -58; z -= 0.5) zs.push(z);
  zs.forEach((z, i) => {
    const x = pathX(z);
    const y = walkY(z) > 0.05 ? -0.5 : 0.02; // the bridge carries the path over the river
    pts.push(x - width / 2, y, z, x + width / 2, y, z);
    const v = (18 - z) / 3;
    uvs.push(0, v, 1, v);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A cherry petal: a rounded teardrop with the little notch at its tip. */
function petalShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.07);
  s.bezierCurveTo(0.06, -0.04, 0.07, 0.04, 0.025, 0.07);
  s.lineTo(0, 0.05);
  s.lineTo(-0.025, 0.07);
  s.bezierCurveTo(-0.07, 0.04, -0.06, -0.04, 0, -0.07);
  return new THREE.ShapeGeometry(s, 6);
}

/** A swept bird wing, hinged at the body (x = 0) and reaching out along +x. */
function wingShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.08);
  s.quadraticCurveTo(0.25, 0.14, 0.62, -0.06);
  s.quadraticCurveTo(0.3, -0.02, 0, -0.1);
  s.closePath();
  return new THREE.ShapeGeometry(s, 8);
}

/** A heart, for when someone taps the couple. */
function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.06);
  s.bezierCurveTo(-0.12, 0.02, -0.06, 0.1, 0, 0.04);
  s.bezierCurveTo(0.06, 0.1, 0.12, 0.02, 0, -0.06);
  return new THREE.ShapeGeometry(s);
}

interface Particle {
  p: THREE.Vector3;
  v: THREE.Vector3;
  life: number;
  spin: number;
}

const BURST = 220;
const HEARTS = 30;
const RIPPLES = 6;
const BIRDS = 9;

function ParkArchitecture({ budget, still, doorL, doorR, addLight, registerTap }: WorldProps) {
  const pm = useParkMaterials(budget.tex);
  const trees = useMemo(() => plantTrees(), []);
  const ribbon = useMemo(() => pathRibbon(2.4), []);
  const heart = useMemo(() => heartShape(), []);
  const wing = useMemo(() => wingShape(), []);
  const petalGeo = useMemo(() => petalShape(), []);

  /* ---------------- static instances ---------------- */
  const trunkItems = useMemo<Item[]>(() => trees.map((t) => ({ p: [t.p[0], 1.3 * t.scale, t.p[2]], s: [t.scale, t.scale, t.scale], r: [t.lean, 0, t.lean * 0.6] })), [trees]);
  const blobItems = useMemo<Item[]>(() => {
    const rand = seeded(203);
    return trees.flatMap((t) =>
      Array.from({ length: BLOBS_PER_TREE }, (_, i) => {
        const a = (i / BLOBS_PER_TREE) * Math.PI * 2 + rand();
        const r = i === 0 ? 0 : 0.9 + rand() * 0.4;
        const s = (i === 0 ? 1.5 : 1 + rand() * 0.35) * t.scale;
        return {
          p: [t.p[0] + Math.cos(a) * r * t.scale + t.lean * 2, (2.9 + (i === 0 ? 0.6 : rand() * 0.6)) * t.scale, t.p[2] + Math.sin(a) * r * t.scale],
          s: [s, s * 0.8, s],
        };
      })
    );
  }, [trees]);
  const blobColors = useMemo(() => {
    const rand = seeded(205);
    return blobItems.map(() => BLOSSOMS[Math.floor(rand() * BLOSSOMS.length)]);
  }, [blobItems]);
  const groundPetals = useMemo<Item[]>(() => {
    const rand = seeded(207);
    return Array.from({ length: 260 }, () => {
      const t = trees[Math.floor(rand() * trees.length)];
      const a = rand() * Math.PI * 2;
      const r = rand() * 2.6;
      return { p: [t.p[0] + Math.cos(a) * r, 0.03, t.p[2] + Math.sin(a) * r], r: [-Math.PI / 2, 0, rand() * 3], s: [1, 1, 1] };
    });
  }, [trees]);
  const plankItems = useMemo<Item[]>(() => {
    const n = 22;
    return Array.from({ length: n }, (_, i) => {
      const z = BRIDGE.from + ((BRIDGE.to - BRIDGE.from) * i) / (n - 1);
      const dz = 0.01;
      const slope = (walkY(z - dz) - walkY(z + dz)) / (2 * dz);
      return { p: [pathX(z), walkY(z), z], r: [Math.atan(slope), 0, 0] };
    });
  }, []);
  const postItems = useMemo<Item[]>(
    () => plankItems.filter((_, i) => i % 3 === 0).flatMap((pl) => [-1.35, 1.35].map((dx) => ({ p: [pl.p[0] + dx, pl.p[1] + 0.45, pl.p[2]] }))),
    [plankItems]
  );
  const rails = useMemo(
    () =>
      [-1.35, 1.35].map((dx) => {
        const pts = plankItems.map((pl) => new THREE.Vector3(pl.p[0] + dx, pl.p[1] + 0.9, pl.p[2]));
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.05, 6, false);
      }),
    [plankItems]
  );
  const rockItems = useMemo<Item[]>(() => {
    const rand = seeded(209);
    const out: Item[] = [];
    // The cliff: courses of boulders, smaller towards an uneven top, with
    // a gap for the fall and wings curving forward round the pool.
    for (let row = 0; row < 7; row++) {
      const y = row * 2.1;
      const size = 3.4 - row * 0.3;
      for (let x = -24 + rand() * 2; x < 24; x += size * (1.1 + rand() * 0.4)) {
        if (Math.abs(x) < 3.2 && y < 11.5) continue; // keep the fall clear
        if (row === 6 && rand() < 0.35) continue; // ragged skyline
        const s = size * (0.8 + rand() * 0.5);
        const z = -64 - row * 0.5 + (rand() - 0.5) * 1.2 - Math.abs(x) * 0.02;
        out.push({ p: [x, y + rand() * 0.8, z], s: [s, s * (0.75 + rand() * 0.4), s * 0.9], r: [rand() * 3, rand() * 3, rand() * 3] });
      }
    }
    // A deeper layer behind, filling the gaps (no flat backdrop edges)
    for (let row = 0; row < 5; row++) {
      for (let x = -22 + rand() * 3; x < 22; x += 3.4 + rand()) {
        const s = 3.2 + rand() * 1.4 - row * 0.2;
        out.push({ p: [x, row * 2.6 + rand(), -67.5 - rand()], s: [s, s * 0.85, s], r: [rand() * 3, rand() * 3, rand() * 3] });
      }
    }
    // The lip over the fall
    for (let i = 0; i < 4; i++) {
      const s = 1.6 + rand();
      out.push({ p: [-2.2 + i * 1.5, 13 + rand() * 0.8, -63.5], s: [s, s * 0.8, s], r: [rand() * 3, rand() * 3, 0] });
    }
    // Wings curving forward round the pool
    for (const side of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const s = 2.6 - t * 1.4 + rand() * 0.6;
        out.push({ p: [side * (12 - t * 3 + rand()), s * 0.4 + rand(), -62 + t * 9], s: [s, s * 0.8, s], r: [rand() * 3, rand() * 3, rand() * 3] });
      }
    }
    // Pool rim and river banks
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      if (Math.sin(a) > 0.7) continue; // the side facing the path stays open
      const s = 0.4 + rand() * 0.5;
      out.push({ p: [Math.cos(a) * 5.8, 0.15, POOL_Z + Math.sin(a) * 5.8], s: [s, s * 0.7, s], r: [rand() * 3, rand() * 3, 0] });
    }
    for (let i = 0; i < 30; i++) {
      const x = -30 + rand() * 60;
      if (Math.abs(x - pathX(RIVER_Z)) < 2.2) continue;
      const s = 0.3 + rand() * 0.5;
      out.push({ p: [x, 0.1, RIVER_Z + (rand() > 0.5 ? 3.1 : -3.1)], s: [s, s * 0.6, s], r: [rand() * 3, rand() * 3, 0] });
    }
    return out;
  }, []);
  // Moss, ferns and a few blossoms crowning the cliff
  const crownItems = useMemo<Item[]>(() => {
    const rand = seeded(215);
    return Array.from({ length: 34 }, () => {
      const x = -24 + rand() * 48;
      const s = 0.9 + rand() * 1.4;
      return { p: [x, 13.2 + rand() * 1.6 - Math.abs(x) * 0.02, -66 - rand() * 2], s: [s * 1.3, s * 0.8, s] };
    });
  }, []);
  const crownColors = useMemo(() => ["#2E5A2A", "#3D6B34", "#4E7A3A", "#2A4A28", "#F2A7C3", "#3D6B34"], []);
  const foamItems = useMemo<Item[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI;
        return { p: [Math.cos(a) * 2.4, 0.25, -59.4 + Math.sin(a) * 0.9], s: [0.7, 0.35, 0.6] };
      }),
    []
  );
  const padItems = useMemo<Item[]>(() => {
    const rand = seeded(211);
    return Array.from({ length: 16 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 1.5 + rand() * 3.4;
      const s = 0.6 + rand() * 0.6;
      return { p: [Math.cos(a) * r, 0.09, POOL_Z + Math.sin(a) * r], r: [-Math.PI / 2, 0, rand() * 6], s: [s, s, s] };
    });
  }, []);
  const lampItems = useMemo<Item[]>(() => LAMP_Z.map((z, i) => ({ p: [pathX(z) + (i % 2 ? 1.6 : -1.6), 1.3, z] })), []);
  const globeItems = useMemo<Item[]>(() => lampItems.map((l) => ({ p: [l.p[0], 2.75, l.p[2]] })), [lampItems]);
  const archBlobs = useMemo<Item[]>(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 15) * Math.PI;
        const s = 0.45 + (i % 3) * 0.12;
        return { p: [Math.cos(a) * 2.5, 3 + Math.sin(a) * 2.5, 0.2], s: [s, s, s] };
      }),
    []
  );

  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const blobRef = useRef<THREE.InstancedMesh>(null);
  const groundPetalRef = useRef<THREE.InstancedMesh>(null);
  const plankRef = useRef<THREE.InstancedMesh>(null);
  const postRef = useRef<THREE.InstancedMesh>(null);
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);
  const foamRef = useRef<THREE.InstancedMesh>(null);
  const padRef = useRef<THREE.InstancedMesh>(null);
  const lampRef = useRef<THREE.InstancedMesh>(null);
  const globeRef = useRef<THREE.InstancedMesh>(null);
  const archRef = useRef<THREE.InstancedMesh>(null);
  useInstances(trunkRef, trunkItems);
  useInstances(blobRef, blobItems, blobColors);
  useInstances(groundPetalRef, groundPetals, ["#F7C6D9", "#FADDE8", "#F2A7C3"]);
  useInstances(plankRef, plankItems);
  useInstances(postRef, postItems);
  useInstances(rockRef, rockItems);
  useInstances(crownRef, crownItems, crownColors);
  useInstances(foamRef, foamItems);
  useInstances(padRef, padItems, ["#3E7A3A", "#4E8A42", "#F2A7C3"]);
  useInstances(lampRef, lampItems);
  useInstances(globeRef, globeItems);
  useInstances(archRef, archBlobs, BLOSSOMS);

  /* ---------------- moving parts ---------------- */
  const riverRef = useRef<THREE.Mesh>(null);
  const poolRef = useRef<THREE.Mesh>(null);
  const fallRef = useRef<THREE.Mesh>(null);
  const couple = useRef<THREE.Group>(null);
  const stride = useRef(0);
  const birdsRef = useRef<THREE.Group>(null);
  const burstRef = useRef<THREE.InstancedMesh>(null);
  const heartRef = useRef<THREE.InstancedMesh>(null);
  const rippleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const fireflyGeo = useRef<THREE.BufferGeometry>(null);

  const sim = useRef({
    burst: Array.from({ length: BURST }, (): Particle => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, spin: 0 })),
    burstNext: 0,
    hearts: Array.from({ length: HEARTS }, (): Particle => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, spin: 0 })),
    heartNext: 0,
    ripples: Array.from({ length: RIPPLES }, () => ({ p: new THREE.Vector3(), age: 9 })),
    rippleNext: 0,
    shakes: new Map<number, number>(),
    scatterAt: -99,
    walk: 0,
    lastZ: 0,
    clock: 0,
  });
  const fireflies = useMemo(() => {
    const rand = seeded(213);
    const n = budget.lights > 0 ? 60 : 24;
    const arr = new Float32Array(n * 3);
    const base = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      base[i * 3] = (rand() - 0.5) * 22;
      base[i * 3 + 1] = 0.5 + rand() * 2.5;
      base[i * 3 + 2] = 4 - rand() * 56;
    }
    arr.set(base);
    return { arr, base, n };
  }, [budget.lights]);
  const birdSeeds = useMemo(() => {
    const rand = seeded(217);
    return Array.from({ length: BIRDS }, () => ({ r: 9 + rand() * 9, h: 11 + rand() * 6, speed: 0.12 + rand() * 0.08, phase: rand() * Math.PI * 2, cz: -20 - rand() * 20 }));
  }, []);

  const spawnPetals = (at: THREE.Vector3, count: number, spread: number, colors: string[]) => {
    const s = sim.current;
    const mesh = burstRef.current;
    const rand = Math.random;
    for (let i = 0; i < count; i++) {
      const q = s.burst[s.burstNext];
      q.p.copy(at).add(new THREE.Vector3((rand() - 0.5) * spread, (rand() - 0.2) * spread, (rand() - 0.5) * spread));
      q.v.set((rand() - 0.5) * 2.4, 1.2 + rand() * 1.8, (rand() - 0.5) * 2.4);
      q.life = 2.6 + rand() * 1.4;
      q.spin = rand() * 6;
      mesh?.setColorAt(s.burstNext, new THREE.Color(colors[i % colors.length]));
      s.burstNext = (s.burstNext + 1) % BURST;
    }
    if (mesh?.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  // Taps from the page (see PalaceStage).
  useLayoutEffect(
    () =>
      registerTap((ray) => {
        const s = sim.current;
        // The couple
        if (couple.current && ray.intersectObject(couple.current, true).length) {
          const at = couple.current.position.clone().add(new THREE.Vector3(0, 1.9, 0));
          for (let i = 0; i < 12; i++) {
            const q = s.hearts[s.heartNext];
            q.p.copy(at).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.3, (Math.random() - 0.5) * 0.3));
            q.v.set((Math.random() - 0.5) * 0.4, 0.5 + Math.random() * 0.6, 0);
            q.life = 2.4;
            q.spin = (Math.random() - 0.5) * 0.6;
            s.heartNext = (s.heartNext + 1) % HEARTS;
          }
          return;
        }
        // A blossom tree
        const tree = blobRef.current ? ray.intersectObject(blobRef.current, false)[0] : undefined;
        // Water
        const wet = [riverRef.current, poolRef.current, fallRef.current].filter(Boolean) as THREE.Object3D[];
        const water = ray.intersectObjects(wet, false)[0];
        if (tree && (!water || tree.distance < water.distance) && tree.instanceId !== undefined) {
          const idx = Math.floor(tree.instanceId / BLOBS_PER_TREE);
          s.shakes.set(idx, s.clock);
          spawnPetals(tree.point, 70, 2.2, BLOSSOMS);
          return;
        }
        if (water) {
          const r = s.ripples[s.rippleNext];
          const onFall = water.object === fallRef.current;
          r.p.set(water.point.x, onFall ? 0.12 : water.point.y + 0.03, onFall ? POOL_Z - 4.5 : water.point.z);
          r.age = 0;
          s.rippleNext = (s.rippleNext + 1) % RIPPLES;
          spawnPetals(r.p.clone().add(new THREE.Vector3(0, 0.15, 0)), 26, 0.5, ["#DFF6FF", "#FFFFFF", "#A8DDEE"]);
          return;
        }
        // Birds / the sky
        const birds = birdsRef.current;
        let nearBird = false;
        birds?.children.forEach((b) => {
          if (ray.ray.distanceToPoint(b.getWorldPosition(new THREE.Vector3())) < 2.5) nearBird = true;
        });
        if (nearBird || ray.ray.direction.y > 0.12) {
          s.scatterAt = s.clock;
          return;
        }
        // Anywhere else: a puff of petals where the tap lands.
        const ground = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3());
        if (ground) spawnPetals(ground.add(new THREE.Vector3(0, 0.5, 0)), 36, 0.9, BLOSSOMS);
      }),
    [registerTap]
  );

  useFrame((frame, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const s = sim.current;
    s.clock = frame.clock.elapsedTime;
    const t = s.clock;
    const cam = frame.camera.position;

    // The couple walk ahead of the camera along the path.
    const cg = couple.current;
    if (cg) {
      const z = Math.min(9, Math.max(-50, cam.z - 8.5));
      const moved = Math.abs(z - s.lastZ);
      s.lastZ = z;
      s.walk += Math.min(moved, 0.3) * 4 + (still ? 0 : delta * 0.4);
      const ahead = z - 0.6;
      cg.position.set(pathX(z), walkY(z), z);
      cg.rotation.y = Math.atan2(pathX(ahead) - pathX(z), ahead - z) + Math.PI;
      stride.current = s.walk * 2.2;
    }

    if (still) return;

    // Water and the waterfall flow.
    const river = (riverRef.current?.material as THREE.MeshStandardMaterial | undefined)?.map;
    river?.offset.setX((t * 0.03) % 1);
    const fall = (fallRef.current?.material as THREE.MeshBasicMaterial | undefined)?.map;
    fall?.offset.setY((t * 0.6) % 1);

    // Shaken trees sway, then settle.
    const bm = blobRef.current;
    if (bm && s.shakes.size) {
      s.shakes.forEach((start, idx) => {
        const age = t - start;
        const amp = age > 1.4 ? 0 : Math.sin(age * 18) * 0.12 * (1 - age / 1.4);
        for (let k = 0; k < BLOBS_PER_TREE; k++) {
          const it = blobItems[idx * BLOBS_PER_TREE + k];
          tmp.position.set(it.p[0] + amp, it.p[1], it.p[2] + amp * 0.5);
          tmp.rotation.set(0, 0, amp);
          tmp.scale.set(...(it.s ?? [1, 1, 1]));
          tmp.updateMatrix();
          bm.setMatrixAt(idx * BLOBS_PER_TREE + k, tmp.matrix);
        }
        if (age > 1.4) s.shakes.delete(idx);
      });
      bm.instanceMatrix.needsUpdate = true;
    }

    // Petal bursts
    const pmesh = burstRef.current;
    if (pmesh) {
      s.burst.forEach((q, i) => {
        if (q.life > 0) {
          q.life -= delta;
          q.v.y -= 0.9 * delta;
          q.v.multiplyScalar(0.985);
          q.p.addScaledVector(q.v, delta);
          q.p.x += Math.sin(t * 2 + i) * 0.004;
          if (q.p.y < 0.03) {
            q.p.y = 0.03;
            q.v.set(0, 0, 0);
          }
        }
        tmp.position.copy(q.p);
        tmp.rotation.set(t * 2 + q.spin, t * 1.3 + i, q.spin);
        tmp.scale.setScalar(q.life > 0 ? Math.min(1, q.life) : 0);
        tmp.updateMatrix();
        pmesh.setMatrixAt(i, tmp.matrix);
      });
      pmesh.instanceMatrix.needsUpdate = true;
    }
    const hmesh = heartRef.current;
    if (hmesh) {
      s.hearts.forEach((q, i) => {
        if (q.life > 0) {
          q.life -= delta;
          q.p.addScaledVector(q.v, delta);
        }
        tmp.position.copy(q.p);
        tmp.lookAt(cam);
        tmp.rotateZ(q.spin + Math.sin(t * 3 + i) * 0.2);
        tmp.scale.setScalar(q.life > 0 ? Math.min(1, q.life) * 0.75 : 0);
        tmp.updateMatrix();
        hmesh.setMatrixAt(i, tmp.matrix);
      });
      hmesh.instanceMatrix.needsUpdate = true;
    }
    // Ripples
    s.ripples.forEach((r, i) => {
      const m = rippleRefs.current[i];
      if (!m) return;
      r.age += delta;
      const on = r.age < 2;
      m.visible = on;
      if (on) {
        m.position.copy(r.p);
        m.scale.setScalar(0.4 + r.age * 2.4);
        (m.material as THREE.MeshBasicMaterial).opacity = 0.95 * (1 - r.age / 2);
      }
    });

    // Birds circle; a tap scatters them up and away for a few seconds.
    const since = t - s.scatterAt;
    const scatter = since < 5 ? Math.sin((since / 5) * Math.PI) : 0;
    birdsRef.current?.children.forEach((b, i) => {
      const bs = birdSeeds[i];
      const a = bs.phase + t * bs.speed * (1 + scatter * 2.5);
      const r = bs.r * (1 + scatter * 0.8);
      b.position.set(Math.cos(a) * r, bs.h + scatter * 8 + Math.sin(t * 0.7 + i) * 0.5, bs.cz + Math.sin(a) * r * 0.6);
      b.rotation.set(0, -a, Math.sin(t + i) * 0.15);
      const flap = Math.sin(t * (8 + scatter * 10) + i) * 0.7;
      const [wl, wr] = b.children.slice(1);
      if (wl) wl.rotation.z = flap * 0.8;
      if (wr) wr.rotation.z = flap * 0.8;
    });

    // Foam churns at the foot of the fall.
    const fm = foamRef.current;
    if (fm) {
      foamItems.forEach((it, i) => {
        const k = 1 + Math.sin(t * 3 + i * 1.3) * 0.18;
        tmp.position.set(it.p[0], it.p[1] + Math.sin(t * 2.4 + i) * 0.05, it.p[2]);
        tmp.rotation.set(0, i, 0);
        tmp.scale.set(0.7 * k, 0.35 * k, 0.6 * k);
        tmp.updateMatrix();
        fm.setMatrixAt(i, tmp.matrix);
      });
      fm.instanceMatrix.needsUpdate = true;
    }

    // Fireflies drift.
    const fg = fireflyGeo.current;
    if (fg) {
      const pos = fg.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < fireflies.n; i++) {
        pos.setXYZ(
          i,
          fireflies.base[i * 3] + Math.sin(t * 0.5 + i) * 0.6,
          fireflies.base[i * 3 + 1] + Math.sin(t * 0.8 + i * 1.7) * 0.4,
          fireflies.base[i * 3 + 2] + Math.cos(t * 0.4 + i) * 0.6
        );
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Sky dome and distant hills */}
      <mesh material={pm.sky}>
        <sphereGeometry args={[110, 24, 16]} />
      </mesh>
      {[
        [-40, -95, 30],
        [-8, -110, 38],
        [30, -100, 32],
        [60, -80, 26],
        [-70, -70, 24],
      ].map(([x, z, r], i) => (
        <mesh key={i} material={pm.hill} position={[x, -r * 0.55, z]} scale={[1.6, 1, 1]}>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}

      {/* Lawn, the stone path and fallen petals */}
      <mesh material={pm.grass} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
        <planeGeometry args={[150, 200]} />
      </mesh>
      <mesh geometry={ribbon} material={pm.path} />
      <instancedMesh ref={groundPetalRef} args={[undefined, undefined, groundPetals.length]} material={pm.groundPetal}>
        <circleGeometry args={[0.06, 5]} />
      </instancedMesh>

      {/* The gate: stone posts, blossom arch, iron gates, hedges */}
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} material={pm.stonePost} position={[x, 1.6, 0]}>
          <boxGeometry args={[0.6, 3.2, 0.6]} />
        </mesh>
      ))}
      <mesh material={pm.iron} position={[0, 3, 0.2]}>
        <torusGeometry args={[2.4, 0.06, 6, 32, Math.PI]} />
      </mesh>
      <instancedMesh ref={archRef} args={[undefined, undefined, archBlobs.length]} material={pm.blossom}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      {[
        { ref: doorL, x: -2.1, flip: 1 },
        { ref: doorR, x: 2.1, flip: -1 },
      ].map(({ ref, x, flip }) => (
        <group key={x} ref={ref} position={[x, 0, 0]} scale={[flip, 1, 1]}>
          {[0.08, 2.5].map((y) => (
            <mesh key={y} material={pm.iron} position={[1.05, y, 0]}>
              <boxGeometry args={[2.1, 0.07, 0.07]} />
            </mesh>
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} material={pm.iron} position={[0.05 + i * 0.25, 1.3 + Math.sin((i / 8) * Math.PI) * 0.15, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 2.5 + Math.sin((i / 8) * Math.PI) * 0.3, 5]} />
            </mesh>
          ))}
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} material={pm.hedge} position={[side * 9, 0.7, 0]}>
          <boxGeometry args={[13, 1.4, 1.2]} />
        </mesh>
      ))}

      {/* Cherry trees */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trunkItems.length]} material={pm.bark}>
        <cylinderGeometry args={[0.14, 0.24, 2.6, 7]} />
      </instancedMesh>
      <instancedMesh ref={blobRef} args={[undefined, undefined, blobItems.length]} material={pm.blossom} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>

      {/* Lamps along the path */}
      <instancedMesh ref={lampRef} args={[undefined, undefined, lampItems.length]} material={pm.iron}>
        <cylinderGeometry args={[0.05, 0.08, 2.6, 6]} />
      </instancedMesh>
      <instancedMesh ref={globeRef} args={[undefined, undefined, globeItems.length]}>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshStandardMaterial color="#FFE6B0" emissive="#FFC877" emissiveIntensity={1.6} />
      </instancedMesh>
      {budget.lights >= 2 &&
        [LAMP_Z[1], LAMP_Z[5]].map((z, i) => (
          <pointLight key={z} ref={addLight} position={[pathX(z) + (i ? 1.6 : -1.6), 2.6, z]} color="#FFC877" distance={12} decay={2} />
        ))}

      {/* The river and the red bridge */}
      <mesh ref={riverRef} material={pm.water} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, RIVER_Z]}>
        <planeGeometry args={[150, 5.6]} />
      </mesh>
      <instancedMesh ref={plankRef} args={[undefined, undefined, plankItems.length]} material={pm.plank}>
        <boxGeometry args={[2.8, 0.1, 0.4]} />
      </instancedMesh>
      <instancedMesh ref={postRef} args={[undefined, undefined, postItems.length]} material={pm.lacquer}>
        <boxGeometry args={[0.1, 0.9, 0.1]} />
      </instancedMesh>
      {rails.map((g, i) => (
        <mesh key={i} geometry={g} material={pm.lacquer} />
      ))}

      {/* Waterfall, cliff, pool with lily pads */}
      <instancedMesh ref={rockRef} args={[undefined, undefined, rockItems.length]} material={pm.rock}>
        <dodecahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, crownItems.length]} material={pm.foliage}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      <mesh ref={fallRef} material={pm.fall} position={[0, 6.3, -60.6]}>
        <planeGeometry args={[5, 12.6]} />
      </mesh>
      <instancedMesh ref={foamRef} args={[undefined, undefined, foamItems.length]} material={pm.foam}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      <mesh ref={poolRef} material={pm.water} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, POOL_Z]}>
        <circleGeometry args={[5.8, 40]} />
      </mesh>
      <instancedMesh ref={padRef} args={[undefined, undefined, padItems.length]} material={pm.pad}>
        <circleGeometry args={[0.32, 10, 0.3, Math.PI * 1.85]} />
      </instancedMesh>
      {budget.lights >= 4 && <pointLight ref={addLight} position={[0, 3, -56]} color="#BFE6FF" distance={14} decay={2} />}

      {/* The couple, hand in hand */}
      <Couple ref={couple} stride={stride} still={still} />

      {/* Birds */}
      <group ref={birdsRef}>
        {birdSeeds.map((_, i) => (
          <group key={i}>
            <mesh material={pm.bird} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.7]}>
              <coneGeometry args={[0.07, 0.42, 6]} />
            </mesh>
            {[1, -1].map((side) => (
              <group key={side} scale={[side, 1, 1]}>
                <mesh geometry={wing} material={pm.bird} rotation={[-Math.PI / 2, 0, 0]} />
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* Fireflies */}
      <points material={pm.firefly}>
        <bufferGeometry ref={fireflyGeo}>
          <bufferAttribute attach="attributes-position" args={[fireflies.arr, 3]} />
        </bufferGeometry>
      </points>

      {/* Tap effects */}
      <instancedMesh ref={burstRef} args={[petalGeo, pm.petal, BURST]} frustumCulled={false} />
      <instancedMesh ref={heartRef} args={[heart, undefined, HEARTS]} frustumCulled={false}>
        <meshBasicMaterial color="#FF5A7A" side={THREE.DoubleSide} transparent opacity={0.95} />
      </instancedMesh>
      {Array.from({ length: RIPPLES }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            rippleRefs.current[i] = m;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.75, 1, 40]} />
          <meshBasicMaterial color="#E8FAFF" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

const halos: number[] = [];
LAMP_Z.forEach((z, i) => halos.push(pathX(z) + (i % 2 ? 1.6 : -1.6), 2.75, z));

export const parkWorld: WorldDef = {
  Architecture: ParkArchitecture,
  halos,
  light: {
    ambient: "#D8C0D8",
    ambientIntensity: 0.6,
    sky: "#9A80C8",
    ground: "#3A5A30",
    moon: "#FFC8B0",
    warm: "#FFB880",
    fog: [24, 95],
  },
  petals: BLOSSOMS,
};

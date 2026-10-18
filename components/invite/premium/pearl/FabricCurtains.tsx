"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { canvas, grain, seeded, toTexture } from "../../palace/textures";

/**
 * Real-fabric curtains for Pearl Curtain, in three.js: a cloth simulation
 * (Verlet particles held by distance constraints) for each curtain, hung
 * from rings on a gold rod. The fabric is wider than the rod, so it falls
 * in natural folds; ivory satin with sheen, a woven bump map, soft shadows
 * on itself and on the wall, and iridescent pearls down the inner edge and
 * along the hem.
 *
 * Opening slides the rings to the sides (the fabric bunches into deep
 * folds) while a pearl tie-back gathers each curtain at mid-height, so the
 * cloth below flares out in a swag. Both curtains share one simulation —
 * the right one is its mirror. The loop stops once the cloth has settled.
 *
 * `open` starts the opening (after `delay` s); `instant` builds it already
 * open. Without WebGL, `fallback` is shown instead.
 */

const FOV = 32;
const H = 10; // world height of the view

interface Props {
  open: boolean;
  instant?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  fallback?: ReactNode;
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/* Cloth                                                               */
/* ------------------------------------------------------------------ */

class Cloth {
  C: number;
  R: number;
  N: number;
  pos: Float32Array;
  prev: Float32Array;
  inv: Float32Array;
  ca: Int32Array;
  cb: Int32Array;
  rest: Float32Array;
  stiff: Float32Array;
  top: number;
  rowGap: number;
  /** Rod geometry at the current opening (0 closed … 1 open). */
  xOuter: number;
  xInnerClosed: number;
  xInnerOpen: number;
  tieRow: number;
  tieX: number;
  tieY: number;

  constructor(W: number, lowEnd: boolean) {
    this.C = lowEnd ? 26 : 34;
    this.R = lowEnd ? 36 : 46;
    const { C, R } = this;
    this.N = C * R;
    this.xOuter = -W / 2 - 0.25;
    this.xInnerClosed = 0.14;
    this.xInnerOpen = -W / 2 + Math.max(0.42, W * 0.1);
    this.top = H / 2 + 0.12;
    this.rowGap = H / (R - 1);
    this.tieRow = Math.round((R - 1) * 0.56);
    this.tieX = -W / 2 + Math.max(0.24, W * 0.055);
    this.tieY = this.top - this.tieRow * this.rowGap + 0.35;

    this.pos = new Float32Array(this.N * 3);
    this.prev = new Float32Array(this.N * 3);
    this.inv = new Float32Array(this.N).fill(1);
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const i = r * C + c;
        const [x, , z] = this.pin(c, 0);
        this.pos[i * 3] = x;
        this.pos[i * 3 + 1] = this.top - r * this.rowGap;
        this.pos[i * 3 + 2] = z;
        if (r === 0) this.inv[i] = 0;
      }
    }
    this.prev.set(this.pos);

    const a: number[] = [];
    const b: number[] = [];
    const rest: number[] = [];
    const stiff: number[] = [];
    const link = (i: number, j: number, len: number, k: number) => {
      a.push(i);
      b.push(j);
      rest.push(len);
      stiff.push(k);
    };
    // Rest lengths are the folded shape it was hung in, so the folds run
    // the full drop instead of the fabric spreading flat.
    const P = this.pos;
    const d = (i: number, j: number) => Math.hypot(P[j * 3] - P[i * 3], P[j * 3 + 1] - P[i * 3 + 1], P[j * 3 + 2] - P[i * 3 + 2]);
    const tie = (i: number, j: number, k: number) => link(i, j, d(i, j), k);
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const i = r * C + c;
        if (c < C - 1) tie(i, i + 1, 1);
        if (r < R - 1) tie(i, i + C, 1);
        if (c < C - 1 && r < R - 1) {
          tie(i, i + C + 1, 0.6);
          tie(i + 1, i + C, 0.6);
        }
        if (c < C - 2) tie(i, i + 2, 0.1);
        if (r < R - 2) tie(i, i + 2 * C, 0.5);
      }
    }
    this.ca = Int32Array.from(a);
    this.cb = Int32Array.from(b);
    this.rest = Float32Array.from(rest);
    this.stiff = Float32Array.from(stiff);
  }

  /** Where ring c sits on the rod at opening e (0…1). */
  pin(c: number, e: number): [number, number, number] {
    const f = c / (this.C - 1);
    const inner = this.xInnerClosed + (this.xInnerOpen - this.xInnerClosed) * e;
    const x = this.xOuter + (inner - this.xOuter) * f;
    const period = 6;
    // Folds a little uneven, as real ones are.
    const vary = 0.75 + 0.5 * Math.abs(Math.sin(c * 12.9898) * 43758.5453 % 1);
    const amp = (0.32 + 0.42 * e) * vary;
    const z = Math.sin((c / period) * Math.PI * 2) * amp;
    return [x, this.top, z];
  }

  step(e: number, tie: number, time: number, iterations: number) {
    const { pos, prev, inv, N, C } = this;
    const dt = 1 / 60;
    const g = -14 * dt * dt;
    const damp = 0.982;
    for (let i = 0; i < N; i++) {
      if (inv[i] === 0) continue;
      const k = i * 3;
      const y = pos[k + 1];
      // A breath of air while it moves.
      const breeze = Math.sin(time * 1.3 + y * 0.6) * 0.00004;
      for (let d = 0; d < 3; d++) {
        const p = pos[k + d];
        let v = (p - prev[k + d]) * damp;
        if (d === 1) v += g;
        if (d === 2) v += breeze;
        prev[k + d] = p;
        pos[k + d] = p + v;
      }
    }
    // Rings on the rod
    for (let c = 0; c < C; c++) {
      const [x, y, z] = this.pin(c, e);
      pos[c * 3] = x;
      pos[c * 3 + 1] = y;
      pos[c * 3 + 2] = z;
    }
    const { ca, cb, rest, stiff } = this;
    const M = ca.length;
    const row = this.tieRow * C;
    for (let it = 0; it < iterations; it++) {
      for (let m = 0; m < M; m++) {
        const i = ca[m] * 3;
        const j = cb[m] * 3;
        const wi = inv[ca[m]];
        const wj = inv[cb[m]];
        const w = wi + wj;
        if (w === 0) continue;
        const dx = pos[j] - pos[i];
        const dy = pos[j + 1] - pos[i + 1];
        const dz = pos[j + 2] - pos[i + 2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const diff = ((len - rest[m]) / (len * w)) * stiff[m];
        pos[i] += dx * diff * wi;
        pos[i + 1] += dy * diff * wi;
        pos[i + 2] += dz * diff * wi;
        pos[j] -= dx * diff * wj;
        pos[j + 1] -= dy * diff * wj;
        pos[j + 2] -= dz * diff * wj;
      }
      // The tie-back draws its row into a tight bunch at the side.
      if (tie > 0) {
        const k = 0.28 * tie;
        for (let c = 0; c < C; c++) {
          const i = (row + c) * 3;
          const f = c / (C - 1) - 0.5;
          const tx = this.tieX + f * 0.22;
          const ty = this.tieY - Math.abs(f) * 0.1;
          const tz = 0.32 + Math.sin(c * 1.3) * 0.08;
          pos[i] += (tx - pos[i]) * k;
          pos[i + 1] += (ty - pos[i + 1]) * k;
          pos[i + 2] += (tz - pos[i + 2]) * k;
        }
      }
    }
    // Keep the fabric off the wall behind it.
    for (let i = 0; i < N; i++) if (pos[i * 3 + 2] < -0.55) pos[i * 3 + 2] = -0.55;
  }
}

/* ------------------------------------------------------------------ */
/* Textures                                                            */
/* ------------------------------------------------------------------ */

/** Satin weave: fine warp and weft threads as a bump map. */
function weave(size: number) {
  const [c, g] = canvas(size);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 2) {
    g.fillStyle = y % 4 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.12)";
    g.fillRect(0, y, size, 1);
  }
  for (let x = 0; x < size; x += 3) {
    g.fillStyle = x % 6 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)";
    g.fillRect(x, 0, 1, size);
  }
  grain(g, size, size, seeded(7), 0.5, "rgba(255,255,255,.08)", "rgba(0,0,0,.08)");
  return toTexture(c, false, [10, 16]);
}

/** Ivory with slow, faint slubs, like silk. */
function silk(size: number) {
  const [c, g] = canvas(size);
  g.fillStyle = "#f1e8d5";
  g.fillRect(0, 0, size, size);
  const rand = seeded(11);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = rand() > 0.5 ? "rgba(255,252,240,.35)" : "rgba(200,180,140,.12)";
    g.fillRect(0, rand() * size, size, 0.6 + rand() * 1.6);
  }
  grain(g, size, size, rand, 0.4, "rgba(255,255,255,.12)", "rgba(150,120,80,.06)");
  return toTexture(c, true, [2, 3]);
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function FabricCurtains({ open, instant, delay = 0, duration = 2.3, className, fallback }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const openAt = useRef<number | null>(null);
  const kick = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(() => !hasWebGL());

  // Start the opening when asked.
  useEffect(() => {
    if (open && openAt.current === null) {
      openAt.current = performance.now() + delay * 1000;
      kick.current();
    }
  }, [open, delay]);

  useEffect(() => {
    const el = host.current;
    if (!el || failed) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setFailed(true));
      return;
    }
    const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4 || Math.min(window.innerWidth, window.innerHeight) < 500;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    const dist = H / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    camera.position.set(0, 0, dist);

    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6f604a, 0.28));
    // Key from above and in front (its shadows fall short and soft on the
    // wall); a low raking light from the side models every fold.
    const key = new THREE.DirectionalLight(0xfff0d8, 1.5);
    key.position.set(-1.5, 9, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.03;
    key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe2b0, 1.7);
    rim.position.set(-9, 1, 2.5);
    scene.add(rim);
    const rim2 = new THREE.DirectionalLight(0xfff0e0, 0.6);
    rim2.position.set(9, 2, 2.5);
    scene.add(rim2);

    // Wall behind: only the curtains' shadows show on the page.
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.ShadowMaterial({ opacity: 0.14 }));
    wall.position.z = -0.65;
    wall.receiveShadow = true;
    scene.add(wall);

    const fabric = new THREE.MeshPhysicalMaterial({
      map: silk(lowEnd ? 256 : 512),
      color: 0xf2e6cc,
      roughness: 0.48,
      sheen: 1,
      sheenColor: new THREE.Color(0xfff1d6),
      sheenRoughness: 0.32,
      bumpMap: weave(256),
      bumpScale: 0.6,
      side: THREE.DoubleSide,
      envMapIntensity: 0.35,
    });
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbf6ec,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 0.75,
      iridescenceIOR: 1.6,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xffe9f0),
      envMapIntensity: 1.1,
    });
    const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24f, metalness: 1, roughness: 0.28, envMapIntensity: 1.2 });

    let cloth: Cloth;
    let geo: THREE.BufferGeometry;
    const curtains: THREE.Group[] = [];
    let edgePearls: THREE.InstancedMesh, hemPearls: THREE.InstancedMesh, tiePearls: THREE.InstancedMesh;
    let rings: THREE.InstancedMesh;
    let tassels: THREE.Group[] = [];
    const disposables: { dispose: () => void }[] = [];
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();

    function tasselMesh() {
      const g = new THREE.Group();
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), gold);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.14, 18), gold);
      neck.position.y = -0.16;
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.17, 0.7, 24, 1, true), gold);
      skirt.position.y = -0.58;
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gold);
      tip.position.y = -0.93;
      for (const m of [knot, neck, skirt, tip]) {
        m.castShadow = true;
        g.add(m);
      }
      return g;
    }

    function build(W: number) {
      cloth = new Cloth(W, lowEnd);
      const { C, R } = cloth;
      geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(cloth.pos, 3));
      const uv = new Float32Array(C * R * 2);
      const idx: number[] = [];
      for (let r = 0; r < R; r++)
        for (let c = 0; c < C; c++) {
          uv[(r * C + c) * 2] = c / (C - 1);
          uv[(r * C + c) * 2 + 1] = 1 - r / (R - 1);
          if (r < R - 1 && c < C - 1) {
            const i = r * C + c;
            idx.push(i, i + C, i + 1, i + 1, i + C, i + C + 1);
          }
        }
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      disposables.push(geo);

      const pearlGeo = new THREE.SphereGeometry(1, 16, 12);
      const ringGeo = new THREE.TorusGeometry(0.11, 0.025, 8, 20);
      disposables.push(pearlGeo, ringGeo);
      edgePearls = new THREE.InstancedMesh(pearlGeo, pearlMat, (R - 1) * 2 * 2);
      hemPearls = new THREE.InstancedMesh(pearlGeo, pearlMat, C * 2);
      tiePearls = new THREE.InstancedMesh(pearlGeo, pearlMat, 9 * 2);
      rings = new THREE.InstancedMesh(ringGeo, gold, Math.ceil(C / 3) * 2);
      for (const im of [edgePearls, hemPearls, tiePearls, rings]) {
        im.castShadow = true;
        im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        im.frustumCulled = false;
        scene.add(im);
      }

      tassels = [];
      [1, -1].forEach((mirror) => {
        const grp = new THREE.Group();
        const mesh = new THREE.Mesh(geo, fabric);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        grp.add(mesh);
        grp.scale.x = mirror;
        // The right curtain hangs just in front, so they overlap closed.
        grp.position.z = mirror === -1 ? 0.07 : 0;
        scene.add(grp);
        curtains.push(grp);
        const t = tasselMesh();
        t.scale.setScalar(0);
        scene.add(t);
        tassels.push(t);
      });

      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, W + 2, 20), gold);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(0, cloth.top + 0.08, 0.05);
      rod.castShadow = true;
      scene.add(rod);
      disposables.push(rod.geometry);
    }

    function clear() {
      for (const g of curtains) scene.remove(g);
      curtains.length = 0;
      for (const t of tassels) {
        scene.remove(t);
        t.traverse((o) => o instanceof THREE.Mesh && o.geometry.dispose());
      }
      scene.children.filter((o) => o instanceof THREE.InstancedMesh || (o instanceof THREE.Mesh && o.geometry.type === "CylinderGeometry")).forEach((o) => scene.remove(o));
      disposables.splice(0).forEach((d) => d.dispose());
    }

    /** Place pearls, rings and tassels on the cloth, for both curtains. */
    function decorate(tie: number) {
      const { pos, C, R } = cloth;
      const P = (i: number) => v.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      let n = 0;
      // Down the inner edge: a pearl at each row and between.
      for (const mirror of [1, -1]) {
        const zOff = mirror === -1 ? 0.07 : 0;
        for (let r = 0; r < R - 1; r++) {
          for (const h of [0, 0.5]) {
            const a = r * C + (C - 1);
            const b = (r + 1) * C + (C - 1);
            P(a);
            const ax = v.x, ay = v.y, az = v.z;
            P(b);
            v.set((ax + (v.x - ax) * h) * mirror, ay + (v.y - ay) * h, az + (v.z - az) * h + 0.05 + zOff);
            m4.compose(v, q, sc.setScalar(0.085));
            edgePearls.setMatrixAt(n++, m4);
          }
        }
      }
      edgePearls.instanceMatrix.needsUpdate = true;
      n = 0;
      for (const mirror of [1, -1]) {
        const zOff = mirror === -1 ? 0.07 : 0;
        for (let c = 0; c < C; c++) {
          P((R - 1) * C + c);
          v.set(v.x * mirror, v.y - 0.04, v.z + 0.04 + zOff);
          m4.compose(v, q, sc.setScalar(0.065));
          hemPearls.setMatrixAt(n++, m4);
        }
      }
      hemPearls.instanceMatrix.needsUpdate = true;
      n = 0;
      for (const mirror of [1, -1]) {
        const zOff = mirror === -1 ? 0.07 : 0;
        for (let c = 0; c < C; c += 3) {
          const [x, y, z] = cloth.pin(c, Math.min(1, Math.max(0, openE)));
          v.set(x * mirror, y + 0.02, z + 0.06 + zOff);
          m4.compose(v, q.setFromAxisAngle(sc.set(0, 1, 0), Math.PI / 2), sc.setScalar(1));
          rings.setMatrixAt(n++, m4);
          q.identity();
        }
      }
      rings.instanceMatrix.needsUpdate = true;
      // The tie-back: a rope of pearls round the gathered fabric, a tassel.
      n = 0;
      tassels.forEach((t, k) => {
        const mirror = k === 0 ? 1 : -1;
        const zOff = mirror === -1 ? 0.07 : 0;
        const row = cloth.tieRow * C;
        let cx = 0, cy = 0, cz = 0;
        for (let c = 0; c < C; c++) {
          cx += pos[(row + c) * 3];
          cy += pos[(row + c) * 3 + 1];
          cz = Math.max(cz, pos[(row + c) * 3 + 2]);
        }
        cx /= C;
        cy /= C;
        for (let p = 0; p < 9; p++) {
          const a = (p / 8 - 0.5) * 0.5;
          v.set((cx + a) * mirror, cy - Math.abs(a) * 0.2, cz + 0.12 + zOff);
          m4.compose(v, q, sc.setScalar(0.07 * tie));
          tiePearls.setMatrixAt(n++, m4);
        }
        t.position.set(cx * mirror, cy - 0.05, cz + 0.2 + zOff);
        t.scale.setScalar(tie);
      });
      tiePearls.instanceMatrix.needsUpdate = true;
    }

    let W = 0;
    let openE = 0;
    let tieE = 0;
    let settleUntil = 0;
    let raf = 0;
    let running = false;
    const start = performance.now();

    function resize() {
      const w = el!.clientWidth || 1;
      const h = el!.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const nextW = H * camera.aspect;
      if (Math.abs(nextW - W) > 0.05) {
        clear();
        W = nextW;
        build(W);
        const lim = W / 2 + 1.5;
        Object.assign(key.shadow.camera, { left: -lim, right: lim, top: H / 2 + 1.5, bottom: -H / 2 - 1.5 });
        key.shadow.camera.updateProjectionMatrix();
        // Let the fabric fall into its folds (or its tied-back drape) first.
        const e = openAt.current !== null && (instant || performance.now() > openAt.current + duration * 1000) ? 1 : 0;
        openE = e;
        tieE = e;
        for (let s = 0; s < (e ? 220 : 120); s++) cloth.step(e, e, s / 60, 8);
        cloth.prev.set(cloth.pos);
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
      decorate(tieE);
      renderer.render(scene, camera);
    }

    function frame(now: number) {
      raf = 0;
      const t0 = openAt.current;
      if (t0 !== null) {
        const p = Math.min(1, Math.max(0, (now - t0) / (duration * 1000)));
        openE = ease(p);
        tieE = smooth(0.3, 0.95, p);
        if (p >= 1 && settleUntil === 0) settleUntil = now + 2500;
      }
      const subs = 2;
      for (let s = 0; s < subs; s++) cloth.step(openE, tieE, (now - start) / 1000, lowEnd ? 10 : 14);
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
      decorate(tieE);
      renderer.render(scene, camera);
      if (settleUntil && now > settleUntil) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function run() {
      if (running) return;
      running = true;
      settleUntil = 0;
      raf = requestAnimationFrame(frame);
    }
    kick.current = () => {
      if (!instant) run();
    };

    if (instant && openAt.current === null) openAt.current = -Infinity;
    resize();
    if (openAt.current !== null && !instant) run();
    const ro = new ResizeObserver(() => resize());
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clear();
      fabric.map?.dispose();
      fabric.bumpMap?.dispose();
      fabric.dispose();
      pearlMat.dispose();
      gold.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [instant, duration, failed]);

  if (failed) return <>{fallback}</>;
  return <div ref={host} className={className} aria-hidden />;
}

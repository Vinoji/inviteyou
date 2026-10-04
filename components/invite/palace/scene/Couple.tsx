"use client";

import { forwardRef, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDisposeMaterials } from "./kit";

/**
 * The couple walking through Blossom Park 3D: a bride and groom built from
 * smooth lathe-turned bodies (the gown's flare, the tailored jacket) and
 * capsule limbs with elbows, holding hands. `stride` (a phase that
 * advances as they walk, set by the world) drives the gait: legs and the
 * free arms swing, the gown sways, heads bob a little. `still` freezes it.
 */

const v = (x: number, y: number) => new THREE.Vector2(x, y);

function lathe(points: THREE.Vector2[], segments = 32, phiStart = 0, phiLength = Math.PI * 2) {
  return new THREE.LatheGeometry(points, segments, phiStart, phiLength);
}

function useCoupleMaterials() {
  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: "#C98E68", roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: "#1B120E", roughness: 0.45, metalness: 0.1 }),
      gown: new THREE.MeshStandardMaterial({ color: "#FFF4F1", roughness: 0.42, side: THREE.DoubleSide }),
      lace: new THREE.MeshStandardMaterial({ color: "#F6E3E6", roughness: 0.6 }),
      veil: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.3, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false }),
      suit: new THREE.MeshStandardMaterial({ color: "#1C2540", roughness: 0.5 }),
      shirt: new THREE.MeshStandardMaterial({ color: "#F7F4EE", roughness: 0.5 }),
      tie: new THREE.MeshStandardMaterial({ color: "#B0507A", roughness: 0.4 }),
      shoe: new THREE.MeshStandardMaterial({ color: "#0E0E12", roughness: 0.25, metalness: 0.3 }),
      bloomPink: new THREE.MeshStandardMaterial({ color: "#F2A7C3", roughness: 0.7 }),
      bloomWhite: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.7 }),
      leaf: new THREE.MeshStandardMaterial({ color: "#4E7A3A", roughness: 0.8 }),
    }),
    []
  );
  useDisposeMaterials(mats);
  return mats;
}

function useGeometries() {
  return useMemo(
    () => ({
      // Bride: a flared A-line skirt with a gentle train at the back, then the bodice.
      skirt: lathe([v(0, 0), v(0.52, 0.01), v(0.5, 0.08), v(0.44, 0.3), v(0.34, 0.58), v(0.22, 0.86), v(0.15, 1.0), v(0, 1.0)], 40),
      bodice: lathe([v(0, 0.98), v(0.15, 0.98), v(0.16, 1.1), v(0.155, 1.22), v(0.135, 1.32), v(0.1, 1.38), v(0, 1.39)], 28),
      sash: new THREE.TorusGeometry(0.152, 0.018, 8, 32),
      // Veil: a sheer half-shell falling from the crown down the back.
      // (Lathe angle 0 points to +z, the back.)
      veil: lathe([v(0.06, 1.66), v(0.13, 1.6), v(0.2, 1.35), v(0.27, 1.05), v(0.31, 0.85)], 24, -Math.PI * 0.35, Math.PI * 0.7),
      // Groom: tailored jacket (wider at the shoulders, flared hem), trousers, shoes.
      jacket: lathe([v(0, 0.8), v(0.18, 0.8), v(0.19, 0.92), v(0.185, 1.05), v(0.2, 1.22), v(0.215, 1.34), v(0.17, 1.42), v(0.07, 1.46), v(0, 1.46)], 32),
      shirtFront: new THREE.ShapeGeometry(
        (() => {
          const s = new THREE.Shape();
          s.moveTo(-0.06, 1.44);
          s.lineTo(0.06, 1.44);
          s.lineTo(0, 1.2);
          s.closePath();
          return s;
        })()
      ),
      // Shared parts
      head: new THREE.SphereGeometry(0.1, 28, 20),
      neck: new THREE.CapsuleGeometry(0.038, 0.06, 6, 12),
      upperArm: new THREE.CapsuleGeometry(0.042, 0.22, 6, 12),
      forearm: new THREE.CapsuleGeometry(0.036, 0.2, 6, 12),
      hand: new THREE.SphereGeometry(0.038, 12, 10),
      thigh: new THREE.CapsuleGeometry(0.07, 0.34, 6, 12),
      shin: new THREE.CapsuleGeometry(0.058, 0.32, 6, 12),
      shoe: new THREE.CapsuleGeometry(0.045, 0.12, 6, 10),
      hairCap: new THREE.SphereGeometry(0.108, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
      // Long hair falling down the bride's back, under the veil.
      hairFall: lathe([v(0.1, 1.6), v(0.112, 1.52), v(0.1, 1.42), v(0.085, 1.3), v(0.05, 1.22)], 20, -Math.PI * 0.4, Math.PI * 0.8),
      bun: new THREE.SphereGeometry(0.06, 16, 12),
      bloom: new THREE.IcosahedronGeometry(0.028, 1),
    }),
    []
  );
}

type Geo = ReturnType<typeof useGeometries>;

/** An arm hanging from the shoulder: upper arm, elbow, forearm, hand.
 * The returned refs let the gait swing the shoulder and bend the elbow. */
function Arm({
  g,
  sleeve,
  skin,
  shoulder,
  elbow,
  side,
}: {
  g: Geo;
  sleeve: THREE.Material;
  skin: THREE.Material;
  shoulder: MutableRefObject<THREE.Group | null>;
  elbow: MutableRefObject<THREE.Group | null>;
  side: 1 | -1;
}) {
  return (
    <group ref={shoulder} rotation={[0, 0, side * 0.12]}>
      <mesh geometry={g.upperArm} material={sleeve} position={[0, -0.15, 0]} />
      <group ref={elbow} position={[0, -0.3, 0]}>
        <mesh geometry={g.forearm} material={sleeve} position={[0, -0.13, 0]} />
        <mesh geometry={g.hand} material={skin} position={[0, -0.27, 0]} scale={[0.9, 1.2, 0.8]} />
      </group>
    </group>
  );
}

const Couple = forwardRef<THREE.Group, { stride: MutableRefObject<number>; still: boolean }>(function Couple(
  { stride, still },
  ref
) {
  const m = useCoupleMaterials();
  const g = useGeometries();

  const groomLegL = useRef<THREE.Group>(null);
  const groomLegR = useRef<THREE.Group>(null);
  const groomKneeL = useRef<THREE.Group>(null);
  const groomKneeR = useRef<THREE.Group>(null);
  const groomOuter = useRef<THREE.Group>(null);
  const groomOuterElbow = useRef<THREE.Group>(null);
  const groomInner = useRef<THREE.Group>(null);
  const groomInnerElbow = useRef<THREE.Group>(null);
  const brideOuter = useRef<THREE.Group>(null);
  const brideOuterElbow = useRef<THREE.Group>(null);
  const brideInner = useRef<THREE.Group>(null);
  const brideInnerElbow = useRef<THREE.Group>(null);
  const skirt = useRef<THREE.Group>(null);
  const groomBody = useRef<THREE.Group>(null);
  const brideBody = useRef<THREE.Group>(null);

  useFrame((frame) => {
    const p = still ? 0 : stride.current;
    const s = Math.sin(p);
    const c = Math.cos(p);
    const breathe = still ? 0 : Math.sin(frame.clock.elapsedTime * 1.6) * 0.004;
    // Legs swing from the hip; the trailing knee bends.
    if (groomLegL.current) groomLegL.current.rotation.x = s * 0.4;
    if (groomLegR.current) groomLegR.current.rotation.x = -s * 0.4;
    if (groomKneeL.current) groomKneeL.current.rotation.x = -Math.max(0, -s) * 0.6;
    if (groomKneeR.current) groomKneeR.current.rotation.x = -Math.max(0, s) * 0.6;
    // Free arms swing opposite to the legs.
    if (groomOuter.current) groomOuter.current.rotation.x = -s * 0.35;
    if (groomOuterElbow.current) groomOuterElbow.current.rotation.x = 0.15 + Math.max(0, -s) * 0.25;
    // The bride carries her bouquet in her outer hand: elbow bent, gentle swing.
    if (brideOuter.current) brideOuter.current.rotation.set(0.1 + s * 0.06, 0, -0.18);
    if (brideOuterElbow.current) brideOuterElbow.current.rotation.x = 1.15;
    // Joined hands: inner arms reach towards each other and sway together.
    if (groomInner.current) groomInner.current.rotation.set(-0.08 + s * 0.05, 0, -0.3);
    if (groomInnerElbow.current) groomInnerElbow.current.rotation.set(0.25, 0, -0.12);
    if (brideInner.current) brideInner.current.rotation.set(-0.08 + s * 0.05, 0, 0.3);
    if (brideInnerElbow.current) brideInnerElbow.current.rotation.set(0.25, 0, 0.12);
    // The gown sways with each step; both bob slightly.
    if (skirt.current) skirt.current.rotation.set(c * 0.025, 0, s * 0.03);
    if (groomBody.current) groomBody.current.position.y = Math.abs(s) * 0.025 + breathe;
    if (brideBody.current) brideBody.current.position.y = Math.abs(c) * 0.018 + breathe;
  });

  return (
    <group ref={ref}>
      {/* ---------------- Groom (right) ---------------- */}
      <group position={[0.3, 0, 0]}>
        {[
          { leg: groomLegL, knee: groomKneeL, x: -0.09 },
          { leg: groomLegR, knee: groomKneeR, x: 0.09 },
        ].map(({ leg, knee, x }) => (
          <group key={x} ref={leg} position={[x, 0.86, 0]}>
            <mesh geometry={g.thigh} material={m.suit} position={[0, -0.2, 0]} />
            <group ref={knee} position={[0, -0.43, 0]}>
              <mesh geometry={g.shin} material={m.suit} position={[0, -0.19, 0]} />
              <mesh geometry={g.shoe} material={m.shoe} position={[0, -0.39, -0.04]} rotation={[Math.PI / 2, 0, 0]} />
            </group>
          </group>
        ))}
        <group ref={groomBody}>
          <mesh geometry={g.jacket} material={m.suit} />
          {/* Shirt, tie and lapels, on the front (−z faces forward) */}
          <mesh geometry={g.shirtFront} material={m.shirt} position={[0, 0, -0.205]} rotation={[0, Math.PI, 0]} />
          <mesh material={m.tie} position={[0, 1.32, -0.21]}>
            <boxGeometry args={[0.035, 0.2, 0.01]} />
          </mesh>
          <mesh geometry={g.neck} material={m.skin} position={[0, 1.5, 0]} />
          <mesh geometry={g.head} material={m.skin} position={[0, 1.63, 0]} scale={[0.95, 1.1, 1]} />
          {/* Hair tilted back so it covers the back of the head (seen from behind) */}
          <mesh geometry={g.hairCap} material={m.hair} position={[0, 1.64, 0.012]} rotation={[0.5, 0, 0]} scale={[1.02, 1.05, 1.06]} />
          {/* Ears */}
          {[-0.095, 0.095].map((x) => (
            <mesh key={x} geometry={g.hand} material={m.skin} position={[x, 1.62, 0.005]} scale={[0.35, 0.6, 0.45]} />
          ))}
          <group position={[0.205, 1.38, 0]}>
            <Arm g={g} sleeve={m.suit} skin={m.skin} shoulder={groomOuter} elbow={groomOuterElbow} side={1} />
          </group>
          <group position={[-0.205, 1.38, 0]}>
            <Arm g={g} sleeve={m.suit} skin={m.skin} shoulder={groomInner} elbow={groomInnerElbow} side={-1} />
          </group>
        </group>
      </group>

      {/* ---------------- Bride (left) ---------------- */}
      <group position={[-0.3, 0, 0]}>
        <group ref={skirt}>
          <mesh geometry={g.skirt} material={m.gown} />
        </group>
        <group ref={brideBody}>
          <mesh geometry={g.bodice} material={m.gown} />
          <mesh geometry={g.sash} material={m.lace} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={g.neck} material={m.skin} position={[0, 1.44, 0]} />
          <mesh geometry={g.head} material={m.skin} position={[0, 1.57, 0]} scale={[0.92, 1.08, 0.97]} />
          <mesh geometry={g.hairCap} material={m.hair} position={[0, 1.58, 0.012]} rotation={[0.55, 0, 0]} scale={[1.04, 1.1, 1.1]} />
          <mesh geometry={g.hairFall} material={m.hair} position={[0, -0.02, 0.012]} />
          <mesh geometry={g.bun} material={m.hair} position={[0, 1.6, 0.115]} />
          {/* Flower crown */}
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI * 0.15 + (i / 8) * Math.PI * 0.7;
            return (
              <mesh
                key={i}
                geometry={g.bloom}
                material={i % 2 ? m.bloomPink : m.bloomWhite}
                position={[Math.cos(a) * 0.1, 1.655, Math.sin(a) * 0.1]}
              />
            );
          })}
          <mesh geometry={g.veil} material={m.veil} position={[0, -0.04, 0.02]} />
          <group position={[-0.17, 1.33, 0]}>
            <Arm g={g} sleeve={m.skin} skin={m.skin} shoulder={brideOuter} elbow={brideOuterElbow} side={-1} />
          </group>
          {/* Bouquet, held in front at the waist */}
          <group position={[-0.12, 1.06, -0.2]}>
            {Array.from({ length: 11 }, (_, i) => {
              const a = (i / 11) * Math.PI * 2;
              const r = i === 0 ? 0 : 0.045;
              return (
                <mesh
                  key={i}
                  geometry={g.bloom}
                  material={i % 3 ? m.bloomPink : m.bloomWhite}
                  position={[Math.cos(a) * r, 0.02 + (i ? 0 : 0.015), Math.sin(a) * r]}
                  scale={1.5}
                />
              );
            })}
            <mesh material={m.leaf} position={[0, -0.07, 0]}>
              <coneGeometry args={[0.03, 0.12, 8]} />
            </mesh>
          </group>
          <group position={[0.17, 1.33, 0]}>
            <Arm g={g} sleeve={m.skin} skin={m.skin} shoulder={brideInner} elbow={brideInnerElbow} side={1} />
          </group>
        </group>
      </group>
    </group>
  );
});

export default Couple;

"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeTempleTextures } from "../templeTextures";
import {
  BrassLamp,
  GateDoors,
  PILLAR_Z,
  doorLeaf,
  flameRef,
  garland,
  gatewayWall,
  useDisposeMaterials,
  useInstances,
  type CommonMats,
  type Item,
  type V3,
  type WorldDef,
  type WorldProps,
} from "./kit";

/**
 * Temple 3D: a South Indian temple at dusk. A painted gopuram over a
 * granite gateway, a mandapam of carved pillars with a painted lotus
 * ceiling, marigold and jasmine garlands, brass bells and hanging lamps,
 * a kolam down the aisle lined with agal lamps; then the courtyard with
 * the gold flagstaff and two lamp towers, and the sanctum glowing within.
 */

const PILLAR_X = 3.4;
const LAMP_Z = [-5, -13, -21, -29, -37];
const AGAL_Z = Array.from({ length: 19 }, (_, i) => -2 - i * 2);
const TOWER_X = [-4.6, 4.6];
const TOWER_Z = -50;
const TOWER_TIERS = 6;
const FLAG_Z = -41;

function useTempleMaterials(size: number) {
  const mats = useMemo(() => {
    const tx = makeTempleTextures(size);
    const front = tx.wall.map.clone();
    front.repeat.set(0.25, 1 / 7);
    const frontBump = tx.wall.bump.clone();
    frontBump.repeat.set(0.25, 1 / 7);
    return {
      granite: new THREE.MeshStandardMaterial({ map: tx.granite.map, bumpMap: tx.granite.bump, bumpScale: 1, roughness: 0.4, metalness: 0.1 }),
      wall: new THREE.MeshStandardMaterial({ map: tx.wall.map, bumpMap: tx.wall.bump, bumpScale: 3, roughness: 0.85 }),
      front: new THREE.MeshStandardMaterial({ map: front, bumpMap: frontBump, bumpScale: 3, roughness: 0.85 }),
      tier: new THREE.MeshStandardMaterial({ map: tx.tier.map, roughness: 0.7 }),
      pillar: new THREE.MeshStandardMaterial({ map: tx.pillar.map, bumpMap: tx.pillar.bump, bumpScale: 4, roughness: 0.6 }),
      stone: new THREE.MeshStandardMaterial({ color: "#6E655A", roughness: 0.8 }),
      ceiling: new THREE.MeshStandardMaterial({ map: tx.ceiling.map, roughness: 0.8, side: THREE.DoubleSide }),
      kolam: new THREE.MeshBasicMaterial({ map: tx.kolam.map, transparent: true, depthWrite: false, opacity: 0.85 }),
      cornice: new THREE.MeshStandardMaterial({ color: "#A8442A", roughness: 0.7 }),
      vault: new THREE.MeshStandardMaterial({ color: "#C0392B", roughness: 0.6 }),
      flower: new THREE.MeshStandardMaterial({ roughness: 0.75 }),
    };
  }, [size]);
  useDisposeMaterials(mats);
  return mats;
}
type TempleMats = ReturnType<typeof useTempleMaterials>;

/** A gopuram: granite gateway with tiers of painted niches above it,
 * capped by a red barrel vault with a row of gold kalasams. */
function Gopuram({
  z,
  mats,
  tm,
  tiers,
  width,
  height,
  half,
  children,
}: {
  z: number;
  mats: CommonMats;
  tm: TempleMats;
  tiers: number;
  width: number;
  height: number;
  half: number;
  children?: ReactNode;
}) {
  const wall = useMemo(() => gatewayWall(width, height, half, height * 0.74, 2, "flat"), [width, height, half]);
  const step = (width - 4) / (tiers + 1);
  const tierH = 1.3;
  const topW = width - (tiers + 1) * step;
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={wall} material={tm.front} position={[0, 0, -1]} />
      {/* Gold door frame */}
      <mesh material={mats.gold} position={[0, height * 0.74 + 0.1, 1.02]}>
        <boxGeometry args={[half * 2 + 0.4, 0.2, 0.1]} />
      </mesh>
      {[-half - 0.1, half + 0.1].map((x) => (
        <mesh key={x} material={mats.gold} position={[x, (height * 0.74) / 2, 1.02]}>
          <boxGeometry args={[0.2, height * 0.74, 0.1]} />
        </mesh>
      ))}
      <mesh material={tm.cornice} position={[0, height + 0.15, 0]}>
        <boxGeometry args={[width + 0.6, 0.3, 2.6]} />
      </mesh>
      {Array.from({ length: tiers }, (_, i) => {
        const w = width - (i + 1) * step;
        const d = 2 - i * (1.2 / tiers);
        const y = height + 0.3 + i * (tierH + 0.25) + tierH / 2;
        return (
          <group key={i}>
            <mesh material={tm.tier} position={[0, y, 0]}>
              <boxGeometry args={[w, tierH, d]} />
            </mesh>
            <mesh material={tm.cornice} position={[0, y + tierH / 2 + 0.12, 0]}>
              <boxGeometry args={[w + 0.35, 0.24, d + 0.35]} />
            </mesh>
          </group>
        );
      })}
      {/* Barrel vault and kalasams */}
      {(() => {
        const y = height + 0.3 + tiers * (tierH + 0.25) + 0.7;
        const n = Math.max(3, Math.round(topW / 0.9));
        return (
          <group position={[0, y, 0]}>
            <mesh material={tm.vault} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.75, 0.75, topW, 20, 1, false, 0, Math.PI]} />
            </mesh>
            {Array.from({ length: n }, (_, i) => {
              const x = -topW / 2 + 0.35 + (i * (topW - 0.7)) / (n - 1);
              return (
                <group key={i} position={[x, 0.75, 0]}>
                  <mesh material={mats.gold} position={[0, 0.18, 0]}>
                    <sphereGeometry args={[0.18, 12, 8]} />
                  </mesh>
                  <mesh material={mats.gold} position={[0, 0.45, 0]}>
                    <coneGeometry args={[0.07, 0.35, 8]} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })()}
      {children}
    </group>
  );
}

function TempleArchitecture({ mats, budget, still, flames, doorL, doorR, addLight }: WorldProps) {
  const tm = useTempleMaterials(budget.tex);
  const leaf = useMemo(() => doorLeaf(2, 5.2, "flat"), []);
  const bells = useRef<THREE.InstancedMesh>(null);

  const pillarItems = useMemo<Item[]>(() => PILLAR_Z.flatMap((z) => [-PILLAR_X, PILLAR_X].map((x) => ({ p: [x, 2.3, z] }))), []);
  const capItems = useMemo<Item[]>(() => pillarItems.map((it) => ({ p: [it.p[0], 4.72, it.p[2]] })), [pillarItems]);
  const beamItems = useMemo<Item[]>(() => PILLAR_Z.map((z) => ({ p: [0, 5.05, z] })), []);
  const bellItems = useMemo<Item[]>(() => PILLAR_Z.map((z) => ({ p: [0, 4.3, z] })), []);
  const chainItems = useMemo<Item[]>(() => PILLAR_Z.map((z) => ({ p: [0, 4.65, z] })), []);
  const agalItems = useMemo<Item[]>(() => AGAL_Z.flatMap((z) => [-1.55, 1.55].map((x) => ({ p: [x, 0.06, z] }))), []);
  const ringItems = useMemo<Item[]>(() => Array.from({ length: 8 }, (_, i) => ({ p: [0, 1.6 + i, FLAG_Z], r: [Math.PI / 2, 0, 0] })), []);

  // Garlands: across every beam and along both sides between pillars.
  const dense = budget.lights > 0;
  const flowers = useMemo(() => {
    const pts: V3[] = [];
    PILLAR_Z.forEach((z) => pts.push(...garland([-PILLAR_X, 4.85, z], [PILLAR_X, 4.85, z], dense ? 28 : 16, 0.7)));
    [-PILLAR_X, PILLAR_X].forEach((x) =>
      PILLAR_Z.slice(0, -1).forEach((z, i) => pts.push(...garland([x, 4.55, z], [x, 4.55, PILLAR_Z[i + 1]], dense ? 16 : 9, 0.6)))
    );
    pts.push(...garland([-2.3, 5.55, 1.15], [2.3, 5.55, 1.15], dense ? 26 : 14, 0.35));
    return pts.map<Item>((p) => ({ p }));
  }, [dense]);
  const flowerColors = useMemo(() => ["#F28C1B", "#F7C531", "#F28C1B", "#FFF7E6", "#E2541B"], []);

  // Lamp towers: rings of flames.
  const towerFlames = useMemo<Item[]>(
    () =>
      TOWER_X.flatMap((x) =>
        Array.from({ length: TOWER_TIERS }, (_, t) =>
          Array.from({ length: 8 }, (_, i): Item => {
            const a = (i / 8) * Math.PI * 2 + t * 0.4;
            const r = 0.95 - t * 0.12;
            return { p: [x + Math.cos(a) * r, 1.2 + t * 0.9 + 0.12, TOWER_Z + Math.sin(a) * r] };
          })
        ).flat()
      ),
    []
  );

  const pillarRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  const beamRef = useRef<THREE.InstancedMesh>(null);
  const chainRef = useRef<THREE.InstancedMesh>(null);
  const agalRef = useRef<THREE.InstancedMesh>(null);
  const flowerRef = useRef<THREE.InstancedMesh>(null);
  const towerRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.InstancedMesh>(null);
  useInstances(pillarRef, pillarItems);
  useInstances(capRef, capItems);
  useInstances(beamRef, beamItems);
  useInstances(bells, bellItems);
  useInstances(chainRef, chainItems);
  useInstances(agalRef, agalItems);
  useInstances(flowerRef, flowers, flowerColors);
  useInstances(towerRef, towerFlames);
  useInstances(ringRef, ringItems);

  // Bells sway gently.
  useFrame((frame) => {
    if (still || !bells.current) return;
    const t = frame.clock.elapsedTime;
    const m = new THREE.Matrix4();
    bellItems.forEach((b, i) => {
      const e = new THREE.Euler(Math.sin(t * 1.1 + i) * 0.08, 0, Math.cos(t * 0.9 + i) * 0.06);
      m.makeRotationFromEuler(e).setPosition(b.p[0], b.p[1], b.p[2]);
      bells.current!.setMatrixAt(i, m);
    });
    bells.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Granite floor and the kolam down the aisle */}
      <mesh material={tm.granite} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]}>
        <planeGeometry args={[40, 120]} />
      </mesh>
      <mesh material={tm.kolam} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -20]}>
        <planeGeometry args={[2.8, 40]} />
      </mesh>
      <instancedMesh ref={agalRef} args={[undefined, undefined, agalItems.length]} material={mats.lantern}>
        <sphereGeometry args={[0.07, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </instancedMesh>

      {/* Gopuram over the gateway */}
      <Gopuram z={0} mats={mats} tm={tm} tiers={6} width={18} height={7} half={2}>
        <GateDoors doorL={doorL} doorR={doorR} geometry={leaf} mats={mats} half={2} z={0.6} />
      </Gopuram>
      <BrassLamp position={[-3.4, 0, 2]} mats={mats} flames={flames} scale={1.4} />
      <BrassLamp position={[3.4, 0, 2]} mats={mats} flames={flames} scale={1.4} />
      {budget.lights >= 2 && (
        <>
          <pointLight ref={addLight} position={[-3.4, 2.6, 2.4]} color="#FFA94D" distance={13} decay={2} />
          <pointLight ref={addLight} position={[3.4, 2.6, 2.4]} color="#FFA94D" distance={13} decay={2} />
        </>
      )}

      {/* Mandapam: carved pillars, beams, painted ceiling, carved walls */}
      <instancedMesh ref={pillarRef} args={[undefined, undefined, pillarItems.length]} material={tm.pillar}>
        <boxGeometry args={[0.75, 4.6, 0.75]} />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, undefined, capItems.length]} material={tm.stone}>
        <boxGeometry args={[1.5, 0.3, 1.1]} />
      </instancedMesh>
      <instancedMesh ref={beamRef} args={[undefined, undefined, beamItems.length]} material={tm.stone}>
        <boxGeometry args={[7.8, 0.36, 0.55]} />
      </instancedMesh>
      <mesh material={tm.ceiling} rotation={[Math.PI / 2, 0, 0]} position={[0, 5.24, -20]}>
        <planeGeometry args={[8, 40]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} material={tm.wall} position={[side * 5.8, 3, -20]} rotation={[0, (-side * Math.PI) / 2, 0]}>
          <planeGeometry args={[40, 6]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`roof${side}`} material={tm.stone} position={[side * 4.9, 5.4, -20]}>
          <boxGeometry args={[1.9, 0.3, 40]} />
        </mesh>
      ))}

      {/* Garlands, bells and hanging lamps */}
      <instancedMesh ref={flowerRef} args={[undefined, undefined, flowers.length]} material={tm.flower}>
        <sphereGeometry args={[0.075, 6, 4]} />
      </instancedMesh>
      <instancedMesh ref={chainRef} args={[undefined, undefined, chainItems.length]} material={mats.gold}>
        <cylinderGeometry args={[0.012, 0.012, 0.75, 4]} />
      </instancedMesh>
      <instancedMesh ref={bells} args={[undefined, undefined, bellItems.length]} material={mats.gold}>
        <cylinderGeometry args={[0.07, 0.2, 0.32, 14, 1, true]} />
      </instancedMesh>
      {LAMP_Z.map((z) => (
        <group key={z} position={[0, 3.6, z]}>
          <mesh material={mats.gold} position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1.6, 4]} />
          </mesh>
          <mesh material={mats.gold}>
            <sphereGeometry args={[0.22, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          </mesh>
          <mesh material={mats.flame} position={[0, 0.12, 0]} ref={flameRef(flames)}>
            <coneGeometry args={[0.05, 0.2, 8]} />
          </mesh>
        </group>
      ))}
      {budget.lights >= 4 &&
        [-9, -25].map((z) => <pointLight key={z} ref={addLight} position={[0, 3.4, z]} color="#FFB060" distance={13} decay={2} />)}

      {/* Courtyard: flagstaff, bali peetham, lamp towers, enclosure walls */}
      <group position={[0, 0, FLAG_Z]}>
        <mesh material={tm.stone} position={[0, 0.5, 0]}>
          <boxGeometry args={[1.3, 1, 1.3]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 5.5, 0]}>
          <cylinderGeometry args={[0.13, 0.17, 9, 12]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 10.2, 0]}>
          <boxGeometry args={[0.7, 0.15, 0.25]} />
        </mesh>
      </group>
      <instancedMesh ref={ringRef} args={[undefined, undefined, ringItems.length]} material={mats.gold}>
        <torusGeometry args={[0.2, 0.04, 6, 16]} />
      </instancedMesh>
      <group position={[0, 0, -47.5]}>
        <mesh material={tm.stone} position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.7, 0.9, 0.7, 16]} />
        </mesh>
        <mesh material={tm.stone} position={[0, 0.8, 0]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[0.6, 16, 8]} />
        </mesh>
      </group>
      {TOWER_X.map((x) => (
        <group key={x} position={[x, 0, TOWER_Z]}>
          <mesh material={tm.stone} position={[0, 0.4, 0]}>
            <boxGeometry args={[1.4, 0.8, 1.4]} />
          </mesh>
          <mesh material={mats.gold} position={[0, 3.6, 0]}>
            <cylinderGeometry args={[0.16, 0.24, 6, 10]} />
          </mesh>
          {Array.from({ length: TOWER_TIERS }, (_, t) => (
            <mesh key={t} material={mats.gold} position={[0, 1.2 + t * 0.9, 0]}>
              <cylinderGeometry args={[1 - t * 0.12, 0.85 - t * 0.12, 0.06, 20]} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={towerRef} args={[undefined, undefined, towerFlames.length]} material={mats.flame}>
        <coneGeometry args={[0.045, 0.16, 6]} />
      </instancedMesh>
      {budget.lights >= 2 && <pointLight ref={addLight} position={[0, 3.5, -50]} color="#FFA94D" distance={16} decay={2} />}
      {[-1, 1].map((side) => (
        <mesh key={side} material={tm.wall} position={[side * 9, 3, -50]} rotation={[0, (-side * Math.PI) / 2, 0]}>
          <planeGeometry args={[20, 6]} />
        </mesh>
      ))}

      {/* The sanctum (vimana), lamplight in its doorway */}
      <Gopuram z={-60} mats={mats} tm={tm} tiers={3} width={12} height={5.2} half={1.4}>
        <mesh material={mats.window} position={[0, 1.9, -0.2]}>
          <planeGeometry args={[2.8, 3.85]} />
        </mesh>
      </Gopuram>
      {budget.lights >= 4 && <pointLight ref={addLight} position={[0, 2.5, -57.5]} color="#FFC877" distance={12} decay={2} />}
    </>
  );
}

const halos: number[] = [];
[-3.4, 3.4].forEach((x) => halos.push(x, 2.3, 2));
LAMP_Z.forEach((z) => halos.push(0, 3.75, z));
halos.push(0, 2, -60.2);

const smallHalos: number[] = [];
AGAL_Z.forEach((z) => [-1.55, 1.55].forEach((x) => smallHalos.push(x, 0.14, z)));
TOWER_X.forEach((x) =>
  Array.from({ length: TOWER_TIERS }, (_, t) =>
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + t * 0.4;
      const r = 0.95 - t * 0.12;
      smallHalos.push(x + Math.cos(a) * r, 1.32 + t * 0.9 + 0.08, TOWER_Z + Math.sin(a) * r);
    })
  )
);

export const templeWorld: WorldDef = {
  Architecture: TempleArchitecture,
  halos,
  smallHalos,
  light: {
    ambient: "#C0A890",
    ambientIntensity: 0.5,
    sky: "#4A3A70",
    ground: "#6A3A18",
    moon: "#C8B8FF",
    warm: "#FFB060",
    fog: [14, 60],
  },
  petals: ["#F28C1B", "#F7C531", "#FFF7E6", "#C0392B"],
};

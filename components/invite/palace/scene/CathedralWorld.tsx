"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeCathedralTextures } from "../cathedralTextures";
import {
  GateDoors,
  PILLAR_Z,
  archRib,
  doorLeaf,
  flameRef,
  gatewayWall,
  useDisposeMaterials,
  useInstances,
  type CommonMats,
  type Item,
  type WorldDef,
  type WorldProps,
} from "./kit";

/**
 * Cathedral 3D: a Gothic cathedral by candlelight. A limestone west front
 * with twin spires and a rose window over pointed doors; a nave of tall
 * columns under pointed ribs, stained-glass lancets down both walls, oak
 * pews, candle stands along an ivory aisle strewn with petals; then the
 * chancel steps, the altar with its candles and flowers, and the great
 * rose window glowing in the apse.
 */

const COL_X = 3.7;
const WIN_Z = PILLAR_Z.slice(0, -1).map((z) => z - 2);
const PEW_Z = Array.from({ length: 20 }, (_, i) => -3.2 - i * 1.75);
const CANDLE_Z = Array.from({ length: 11 }, (_, i) => -2.5 - i * 3.5);
const CHANDELIER_Z = [-9, -25];
const ALTAR_Z = -53;

function useCathedralMaterials(size: number, gold: string) {
  const mats = useMemo(() => {
    const tx = makeCathedralTextures(size, gold);
    const wallTex = tx.limestone.map.clone();
    wallTex.repeat.set(13, 3);
    const wallBump = tx.limestone.bump.clone();
    wallBump.repeat.set(13, 3);
    return {
      stone: new THREE.MeshStandardMaterial({ color: "#F2EADB", map: tx.limestone.map, bumpMap: tx.limestone.bump, bumpScale: 2, roughness: 0.85 }),
      wall: new THREE.MeshStandardMaterial({ color: "#E8DFCF", map: wallTex, bumpMap: wallBump, bumpScale: 2, roughness: 0.9 }),
      column: new THREE.MeshStandardMaterial({ color: "#EFE7D8", roughness: 0.6 }),
      floor: new THREE.MeshStandardMaterial({ map: tx.floor.map, bumpMap: tx.floor.bump, bumpScale: 1, roughness: 0.45, metalness: 0.08 }),
      runner: new THREE.MeshStandardMaterial({ map: tx.runner.map, roughness: 0.9 }),
      oak: new THREE.MeshStandardMaterial({ map: tx.oak.map, roughness: 0.6 }),
      glass: tx.lancets.map((l) => new THREE.MeshBasicMaterial({ map: l.map, side: THREE.DoubleSide })),
      rose: new THREE.MeshBasicMaterial({ map: tx.rose.map }),
      wax: new THREE.MeshStandardMaterial({ color: "#FFF8EA", roughness: 0.5, emissive: "#FFE8C0", emissiveIntensity: 0.25 }),
      cloth: new THREE.MeshStandardMaterial({ color: "#FBF7EE", roughness: 0.9 }),
      bloom: new THREE.MeshStandardMaterial({ roughness: 0.8 }),
      slate: new THREE.MeshStandardMaterial({ color: "#3A4058", roughness: 0.7, metalness: 0.2 }),
    };
  }, [size, gold]);
  useDisposeMaterials(mats);
  return mats;
}
type CathedralMats = ReturnType<typeof useCathedralMaterials>;

/** The west front (or the apse wall): pointed portal, rose window, twin
 * towers with slate spires and pinnacles. */
function WestFront({
  z,
  mats,
  cm,
  roseRadius,
  towers,
  children,
}: {
  z: number;
  mats: CommonMats;
  cm: CathedralMats;
  roseRadius: number;
  towers: boolean;
  children?: ReactNode;
}) {
  const wall = useMemo(() => gatewayWall(14, 14, 2, 3.8, 1.2, "pointed"), []);
  const rib = useMemo(() => archRib(2.05, 3.4, 0.22, 0.3, true), []);
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={wall} material={cm.stone} position={[0, 0, -0.6]} />
      <mesh geometry={rib} material={mats.gold} position={[0, 3.8, 0.6]} />
      {/* Gable */}
      <mesh material={cm.stone} position={[0, 14, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 1]}>
        <coneGeometry args={[7.4, 4, 4]} />
      </mesh>
      {/* Rose window with a stone ring */}
      <mesh material={cm.rose} position={[0, 9.6, 0.62]}>
        <circleGeometry args={[roseRadius, 48]} />
      </mesh>
      <mesh material={cm.stone} position={[0, 9.6, 0.66]}>
        <torusGeometry args={[roseRadius + 0.1, 0.18, 8, 48]} />
      </mesh>
      {towers &&
        [-8.6, 8.6].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh material={cm.stone} position={[0, 9, 0]}>
              <boxGeometry args={[3.4, 18, 3.4]} />
            </mesh>
            {[6, 12].map((y) => (
              <group key={y} position={[0, y, 1.72]}>
                <mesh material={mats.window}>
                  <planeGeometry args={[0.9, 2.6]} />
                </mesh>
              </group>
            ))}
            <mesh material={cm.slate} position={[0, 21.5, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[2.3, 7, 4]} />
            </mesh>
            <mesh material={mats.gold} position={[0, 25.6, 0]}>
              <boxGeometry args={[0.08, 1.2, 0.08]} />
            </mesh>
            <mesh material={mats.gold} position={[0, 25.8, 0]}>
              <boxGeometry args={[0.6, 0.08, 0.08]} />
            </mesh>
            {[-1.5, 1.5].map((px) => (
              <mesh key={px} material={cm.stone} position={[px, 19, 1.5]}>
                <coneGeometry args={[0.25, 1.6, 4]} />
              </mesh>
            ))}
          </group>
        ))}
      {children}
    </group>
  );
}

/** A tall candle stand with three candles. */
function Candelabrum({ position, mats, cm, flames }: { position: [number, number, number]; mats: CommonMats; cm: CathedralMats; flames: WorldProps["flames"] }) {
  return (
    <group position={position}>
      <mesh material={mats.gold} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.12, 1.2, 8]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 1.22, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.06]} />
      </mesh>
      {[-0.3, 0, 0.3].map((x) => (
        <group key={x} position={[x, 1.42 + (x === 0 ? 0.08 : 0), 0]}>
          <mesh material={cm.wax}>
            <cylinderGeometry args={[0.04, 0.04, 0.36 + (x === 0 ? 0.16 : 0), 8]} />
          </mesh>
          <mesh material={mats.flame} position={[0, 0.24 + (x === 0 ? 0.08 : 0), 0]} ref={flameRef(flames)}>
            <coneGeometry args={[0.03, 0.11, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CathedralArchitecture({ mats, budget, gold, still, flames, doorL, doorR, addLight, addGlow }: WorldProps) {
  const cm = useCathedralMaterials(budget.tex, gold);
  const leaf = useMemo(() => doorLeaf(2, 3.8, "pointed"), []);
  const nave = useMemo(() => archRib(COL_X, 4.6, 0.25, 0.4, true), []);
  const arcade = useMemo(() => archRib(1.6, 2.2, 0.18, 0.5, true), []);
  const chandeliers = useRef<THREE.Group>(null);

  // Stained glass and the rose window brighten with the glow.
  useLayoutEffect(() => {
    cm.glass.forEach(addGlow);
    addGlow(cm.rose);
  }, [cm, addGlow]);

  const colItems = useMemo<Item[]>(() => PILLAR_Z.flatMap((z) => [-COL_X, COL_X].map((x) => ({ p: [x, 3.5, z] }))), []);
  const shaftItems = useMemo<Item[]>(
    () => colItems.flatMap((c) => [-0.32, 0.32].map((dz) => ({ p: [c.p[0], 3.5, c.p[2] + dz] }))),
    [colItems]
  );
  const ribItems = useMemo<Item[]>(() => PILLAR_Z.map((z) => ({ p: [0, 7, z] })), []);
  const arcadeItems = useMemo<Item[]>(
    () =>
      [-COL_X, COL_X].flatMap((x) =>
        PILLAR_Z.slice(0, -1).map((z, i) => ({ p: [x, 4.6, (z + PILLAR_Z[i + 1]) / 2], r: [0, Math.PI / 2, 0] }))
      ),
    []
  );
  const seatItems = useMemo<Item[]>(() => PEW_Z.flatMap((z) => [-2.35, 2.35].map((x) => ({ p: [x, 0.45, z] }))), []);
  const backItems = useMemo<Item[]>(() => PEW_Z.flatMap((z) => [-2.35, 2.35].map((x) => ({ p: [x, 0.85, z + 0.3] }))), []);
  const candleItems = useMemo<Item[]>(() => CANDLE_Z.flatMap((z) => [-1.35, 1.35].map((x) => ({ p: [x, 0.55, z] }))), []);
  const candleFlames = useMemo<Item[]>(() => candleItems.map((c) => ({ p: [c.p[0], 1.19, c.p[2]] })), [candleItems]);
  const bloomItems = useMemo<Item[]>(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        const a = (i / 36) * Math.PI * 2;
        return { p: [side * (1.9 + Math.cos(a) * 0.35), 1.25 + Math.abs(Math.sin(a * 3)) * 0.3, ALTAR_Z + 0.2 + Math.sin(a) * 0.35] };
      }),
    []
  );

  const colRef = useRef<THREE.InstancedMesh>(null);
  const shaftRef = useRef<THREE.InstancedMesh>(null);
  const ribRef = useRef<THREE.InstancedMesh>(null);
  const arcadeRef = useRef<THREE.InstancedMesh>(null);
  const seatRef = useRef<THREE.InstancedMesh>(null);
  const backRef = useRef<THREE.InstancedMesh>(null);
  const candleRef = useRef<THREE.InstancedMesh>(null);
  const candleFlameRef = useRef<THREE.InstancedMesh>(null);
  const bloomRef = useRef<THREE.InstancedMesh>(null);
  useInstances(colRef, colItems);
  useInstances(shaftRef, shaftItems);
  useInstances(ribRef, ribItems);
  useInstances(arcadeRef, arcadeItems);
  useInstances(seatRef, seatItems);
  useInstances(backRef, backItems);
  useInstances(candleRef, candleItems);
  useInstances(candleFlameRef, candleFlames);
  useInstances(bloomRef, bloomItems, ["#FFFFFF", "#F6D5DC", "#FFFFFF", "#E9C46A"]);

  useFrame((frame) => {
    if (still) return;
    const t = frame.clock.elapsedTime;
    chandeliers.current?.children.forEach((c, i) => (c.rotation.y = t * 0.06 * (i % 2 ? -1 : 1)));
  });

  return (
    <>
      {/* Flagstone floor and the ivory aisle */}
      <mesh material={cm.floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]}>
        <planeGeometry args={[40, 120]} />
      </mesh>
      <mesh material={cm.runner} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -22]}>
        <planeGeometry args={[1.9, 44]} />
      </mesh>

      {/* West front with the doors */}
      <WestFront z={0} mats={mats} cm={cm} roseRadius={2.2} towers>
        <GateDoors doorL={doorL} doorR={doorR} geometry={leaf} mats={mats} half={2} />
      </WestFront>
      <Candelabrum position={[-3.2, 0, 1.6]} mats={mats} cm={cm} flames={flames} />
      <Candelabrum position={[3.2, 0, 1.6]} mats={mats} cm={cm} flames={flames} />
      {budget.lights >= 2 && (
        <>
          <pointLight ref={addLight} position={[-3.2, 2, 2]} color="#FFC27A" distance={11} decay={2} />
          <pointLight ref={addLight} position={[3.2, 2, 2]} color="#FFC27A" distance={11} decay={2} />
        </>
      )}

      {/* Nave: clustered columns, pointed ribs and arcades */}
      <instancedMesh ref={colRef} args={[undefined, undefined, colItems.length]} material={cm.column}>
        <cylinderGeometry args={[0.36, 0.42, 7, 16]} />
      </instancedMesh>
      <instancedMesh ref={shaftRef} args={[undefined, undefined, shaftItems.length]} material={cm.column}>
        <cylinderGeometry args={[0.1, 0.1, 7, 8]} />
      </instancedMesh>
      <instancedMesh ref={ribRef} args={[nave, cm.stone, ribItems.length]} />
      <instancedMesh ref={arcadeRef} args={[arcade, cm.stone, arcadeItems.length]} />
      {/* Clerestory walls with stained-glass lancets */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={cm.wall} position={[side * 6.2, 6, -20]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <planeGeometry args={[40, 12]} />
          </mesh>
          {WIN_Z.map((z, i) => (
            <mesh key={z} material={cm.glass[(i + (side > 0 ? 1 : 0)) % cm.glass.length]} position={[side * 6.15, 4.6, z]} rotation={[0, (-side * Math.PI) / 2, 0]}>
              <planeGeometry args={[1.25, 4.6]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Pews and the candles along the aisle */}
      <instancedMesh ref={seatRef} args={[undefined, undefined, seatItems.length]} material={cm.oak}>
        <boxGeometry args={[2.3, 0.1, 0.5]} />
      </instancedMesh>
      <instancedMesh ref={backRef} args={[undefined, undefined, backItems.length]} material={cm.oak}>
        <boxGeometry args={[2.3, 0.9, 0.08]} />
      </instancedMesh>
      <instancedMesh ref={candleRef} args={[undefined, undefined, candleItems.length]} material={cm.wax}>
        <cylinderGeometry args={[0.06, 0.06, 1.1, 8]} />
      </instancedMesh>
      <instancedMesh ref={candleFlameRef} args={[undefined, undefined, candleFlames.length]} material={mats.flame}>
        <coneGeometry args={[0.035, 0.13, 6]} />
      </instancedMesh>
      <group ref={chandeliers}>
        {CHANDELIER_Z.map((z) => (
          <group key={z} position={[0, 7.4, z]}>
            <mesh material={mats.gold}>
              <torusGeometry args={[1.2, 0.04, 6, 40]} />
            </mesh>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <mesh key={i} material={cm.wax} position={[Math.cos(a) * 1.2, 0.12, Math.sin(a) * 1.2]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
      {budget.lights >= 4 &&
        CHANDELIER_Z.map((z) => <pointLight key={z} ref={addLight} position={[0, 6.8, z]} color="#FFD08A" distance={15} decay={2} />)}

      {/* Chancel: steps, altar, cross, candles, flowers */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={cm.stone} position={[0, 0.12 + i * 0.24, -45 - i * 0.6]}>
          <boxGeometry args={[11 - i, 0.24, 1.2]} />
        </mesh>
      ))}
      <mesh material={cm.stone} position={[0, 0.36, -52]}>
        <boxGeometry args={[11, 0.72, 12]} />
      </mesh>
      <group position={[0, 0.72, ALTAR_Z]}>
        <mesh material={cm.cloth} position={[0, 0.5, 0]}>
          <boxGeometry args={[3.2, 1, 1.2]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 0.98, 0.61]}>
          <boxGeometry args={[3.2, 0.1, 0.02]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 1.75, -0.2]}>
          <boxGeometry args={[0.1, 1.3, 0.1]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 2.05, -0.2]}>
          <boxGeometry args={[0.7, 0.1, 0.1]} />
        </mesh>
      </group>
      <instancedMesh ref={bloomRef} args={[undefined, undefined, bloomItems.length]} material={cm.bloom}>
        <sphereGeometry args={[0.14, 8, 6]} />
      </instancedMesh>
      <Candelabrum position={[-1.1, 1.7, ALTAR_Z]} mats={mats} cm={cm} flames={flames} />
      <Candelabrum position={[1.1, 1.7, ALTAR_Z]} mats={mats} cm={cm} flames={flames} />
      {budget.lights >= 2 && <pointLight ref={addLight} position={[0, 3.5, -51]} color="#FFC27A" distance={15} decay={2} />}

      {/* The apse: the great rose window glowing over the altar */}
      <WestFront z={-60} mats={mats} cm={cm} roseRadius={3} towers={false}>
        <mesh material={mats.window} position={[0, 2.5, -0.3]}>
          <planeGeometry args={[4, 6]} />
        </mesh>
      </WestFront>
      {budget.lights >= 4 && <pointLight ref={addLight} position={[0, 8, -57]} color="#B9C8FF" distance={16} decay={2} />}
    </>
  );
}

const halos: number[] = [];
[-3.2, 3.2].forEach((x) => [-0.3, 0, 0.3].forEach((dx) => halos.push(x + dx, 1.7, 1.6)));
[-1.1, 1.1].forEach((x) => halos.push(x, 3.4, ALTAR_Z));
CHANDELIER_Z.forEach((z) => halos.push(0, 7.55, z));

const smallHalos: number[] = [];
CANDLE_Z.forEach((z) => [-1.35, 1.35].forEach((x) => smallHalos.push(x, 1.22, z)));
CHANDELIER_Z.forEach((z) =>
  Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    smallHalos.push(Math.cos(a) * 1.2, 7.66, z + Math.sin(a) * 1.2);
  })
);

export const cathedralWorld: WorldDef = {
  Architecture: CathedralArchitecture,
  halos,
  smallHalos,
  light: {
    ambient: "#A9B0CC",
    ambientIntensity: 0.55,
    sky: "#3A4A8A",
    ground: "#4A3A28",
    moon: "#C8D4FF",
    warm: "#FFD08A",
    fog: [16, 64],
  },
  petals: ["#FFFFFF", "#F6D5DC", "#FFF6E8", "#E9C46A"],
};

"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makePalaceTextures } from "../textures";
import {
  BrassLamp,
  GateDoors,
  PILLAR_Z,
  doorLeaf,
  gatewayWall,
  tmp,
  useDisposeMaterials,
  useInstances,
  type CommonMats,
  type Item,
  type WorldDef,
  type WorldProps,
} from "./kit";

/**
 * Royal Palace 3D: a gate in a domed sandstone facade, a pillared hall of
 * fluted marble with jali screens and chandeliers, a courtyard fountain
 * with floating diyas, and the inner palace lit from within.
 */

const PILLAR_X = 3.4;
const LANTERN_Z = [-5, -13, -21, -29, -37];
const CHANDELIER_Z = [-9, -25];

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
  tex.repeat.set(16, 2);
  return tex;
}

function usePalaceMaterials(gold: string, size: number) {
  const mats = useMemo(() => {
    const tx = makePalaceTextures(size, gold);
    return {
      stone: new THREE.MeshStandardMaterial({ color: "#FFDDB0", map: tx.sandstone.map, bumpMap: tx.sandstone.bump, bumpScale: 3, roughness: 0.85, metalness: 0.02 }),
      marble: new THREE.MeshStandardMaterial({ map: tx.marble.map, roughness: 0.3, metalness: 0.05 }),
      pillar: new THREE.MeshStandardMaterial({ color: "#FFF1DC", map: tx.pillar.map, bumpMap: tx.pillar.bump, bumpScale: 4, roughness: 0.32, metalness: 0.05 }),
      dome: new THREE.MeshStandardMaterial({ map: tx.dome.map, bumpMap: tx.dome.bump, bumpScale: 2, roughness: 0.35, metalness: 0.15 }),
      floor: new THREE.MeshStandardMaterial({ map: tx.floor.map, bumpMap: tx.floor.bump, bumpScale: 1.5, roughness: 0.3, metalness: 0.15 }),
      carpet: new THREE.MeshStandardMaterial({ map: tx.carpet.map, roughness: 0.95 }),
      wall: new THREE.MeshStandardMaterial({ map: tx.wall.map, roughness: 0.8, emissive: "#0B1230", emissiveIntensity: 0.4 }),
      hedge: new THREE.MeshStandardMaterial({ map: tx.hedge.map, roughness: 0.95 }),
      water: new THREE.MeshStandardMaterial({ color: "#163A55", roughness: 0.1, metalness: 0.6, emissive: "#0E2A44", emissiveIntensity: 0.6 }),
      jali: new THREE.MeshBasicMaterial({ map: jaliTexture(gold), transparent: true, opacity: 0.55, color: gold, depthWrite: false, side: THREE.DoubleSide }),
    };
  }, [gold, size]);
  useDisposeMaterials(mats);
  return mats;
}
type PalaceMats = ReturnType<typeof usePalaceMaterials>;

/** A palace front: arched wall, gold trim, domes and lit jharokha windows. */
function Facade({ z, mats, pm, children }: { z: number; mats: CommonMats; pm: PalaceMats; children?: ReactNode }) {
  const wall = useMemo(() => gatewayWall(22, 8, 2, 3.6, 1, "round"), []);
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={wall} material={pm.stone} position={[0, 0, -0.5]} />
      <mesh material={mats.gold} position={[0, 3.6, 0.55]}>
        <torusGeometry args={[2.12, 0.1, 8, 32, Math.PI]} />
      </mesh>
      {[-2.12, 2.12].map((x) => (
        <mesh key={x} material={mats.gold} position={[x, 1.8, 0.55]}>
          <boxGeometry args={[0.2, 3.6, 0.2]} />
        </mesh>
      ))}
      <mesh material={mats.gold} position={[0, 8.1, 0]}>
        <boxGeometry args={[22.4, 0.25, 1.3]} />
      </mesh>
      <mesh material={pm.dome} position={[0, 8.2, -1.2]}>
        <sphereGeometry args={[2.6, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 11.3, -1.2]}>
        <coneGeometry args={[0.18, 1.1, 8]} />
      </mesh>
      {[-8, 8].map((x) => (
        <group key={x} position={[x, 8.2, -0.2]}>
          <mesh material={pm.stone} position={[0, 0.6, 0]}>
            <boxGeometry args={[1.8, 1.2, 1.8]} />
          </mesh>
          <mesh material={pm.dome} position={[0, 1.2, 0]}>
            <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={mats.gold} position={[0, 2.5, 0]}>
            <coneGeometry args={[0.1, 0.6, 6]} />
          </mesh>
        </group>
      ))}
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

function PalaceArchitecture({ mats, budget, gold, still, flames, doorL, doorR, addLight }: WorldProps) {
  const pm = usePalaceMaterials(gold, budget.tex);
  const leaf = useMemo(() => doorLeaf(2, 3.6, "round"), []);
  const chandeliers = useRef<THREE.Group>(null);
  const diyas = useRef<THREE.InstancedMesh>(null);

  const pillarItems = useMemo<Item[]>(() => PILLAR_Z.flatMap((z) => [-PILLAR_X, PILLAR_X].map((x) => ({ p: [x, 2.1, z] }))), []);
  const capitalItems = useMemo<Item[]>(() => pillarItems.map((it) => ({ p: [it.p[0], 4.35, it.p[2]] })), [pillarItems]);
  const baseItems = useMemo<Item[]>(() => pillarItems.map((it) => ({ p: [it.p[0], 0.17, it.p[2]] })), [pillarItems]);
  const archItems = useMemo<Item[]>(() => PILLAR_Z.map((z) => ({ p: [0, 4.5, z] })), []);
  const lanternItems = useMemo<Item[]>(() => LANTERN_Z.map((z) => ({ p: [0, 5.4, z], s: [0.22, 0.34, 0.22] })), []);
  const diyaItems = useMemo<Item[]>(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { p: [Math.cos(a) * 1.5, 0.56, -51 + Math.sin(a) * 1.5] };
      }),
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
  useInstances(diyas, diyaItems);

  useFrame((frame) => {
    if (still) return;
    const t = frame.clock.elapsedTime;
    chandeliers.current?.children.forEach((c, i) => (c.rotation.y = t * 0.08 * (i % 2 ? -1 : 1)));
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

  return (
    <>
      {/* Floor, carpet and gold borders */}
      <mesh material={pm.floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]}>
        <planeGeometry args={[40, 120]} />
      </mesh>
      <mesh material={pm.carpet} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -20]}>
        <planeGeometry args={[2.2, 40]} />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} material={mats.gold} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, -20]}>
          <planeGeometry args={[0.08, 40]} />
        </mesh>
      ))}

      <Facade z={0} mats={mats} pm={pm}>
        <GateDoors doorL={doorL} doorR={doorR} geometry={leaf} mats={mats} half={2} />
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
      <instancedMesh ref={pillarRef} args={[undefined, undefined, pillarItems.length]} material={pm.pillar}>
        <cylinderGeometry args={[0.3, 0.34, 4.2, 14]} />
      </instancedMesh>
      <instancedMesh ref={capitalRef} args={[undefined, undefined, capitalItems.length]} material={mats.gold}>
        <boxGeometry args={[0.85, 0.3, 0.85]} />
      </instancedMesh>
      <instancedMesh ref={baseRef} args={[undefined, undefined, baseItems.length]} material={pm.stone}>
        <boxGeometry args={[0.9, 0.34, 0.9]} />
      </instancedMesh>
      <instancedMesh ref={archRef} args={[undefined, undefined, archItems.length]} material={mats.gold}>
        <torusGeometry args={[PILLAR_X, 0.1, 6, 28, Math.PI]} />
      </instancedMesh>
      <instancedMesh ref={lanternRef} args={[undefined, undefined, lanternItems.length]} material={mats.lantern}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={pm.jali} position={[side * 5.2, 2.4, -20]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <planeGeometry args={[40, 4.8]} />
          </mesh>
          <mesh material={pm.wall} position={[side * 5.6, 3, -20]} rotation={[0, (-side * Math.PI) / 2, 0]}>
            <planeGeometry args={[40, 6]} />
          </mesh>
        </group>
      ))}
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
        <mesh key={side} material={pm.hedge} position={[side * 8, 0.6, -50]}>
          <boxGeometry args={[1.2, 1.2, 16]} />
        </mesh>
      ))}
      <group position={[0, 0, -51]}>
        <mesh material={pm.marble} position={[0, 0.27, 0]}>
          <cylinderGeometry args={[2.4, 2.5, 0.55, 40]} />
        </mesh>
        <mesh material={pm.water} position={[0, 0.55, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.02, 40]} />
        </mesh>
        <mesh material={pm.marble} position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 1.2, 12]} />
        </mesh>
        <mesh material={pm.marble} position={[0, 1.7, 0]} rotation={[Math.PI, 0, 0]}>
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
      <Facade z={-60} mats={mats} pm={pm}>
        <mesh material={mats.window} position={[0, 2.6, -0.3]}>
          <planeGeometry args={[4, 5.6]} />
        </mesh>
      </Facade>
      {budget.lights >= 4 && <pointLight ref={addLight} position={[0, 3, -57]} color="#FFC877" distance={14} decay={2} />}
    </>
  );
}

const halos: number[] = [];
[-3.3, 3.3].forEach((x) => halos.push(x, 1.66, 1.8));
LANTERN_Z.forEach((z) => halos.push(0, 5.4, z));
CHANDELIER_Z.forEach((z) => halos.push(0, 6.1, z));
[-6, 6].forEach((x) => [-44, -56].forEach((z) => halos.push(x, 1.66, z)));
halos.push(0, 2.2, -60.3);

export const palaceWorld: WorldDef = {
  Architecture: PalaceArchitecture,
  halos,
  light: {
    ambient: "#A8A2B8",
    ambientIntensity: 0.45,
    sky: "#3A4A80",
    ground: "#5A3A18",
    moon: "#BFCBFF",
    warm: "#FFC877",
    fog: [12, 52],
  },
  petals: ["#F3D27A", "#FFF6E8", "#B5374E", "#E98A3B"],
};

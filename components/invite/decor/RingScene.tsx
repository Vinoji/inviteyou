"use client";

import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function Ring({ color }: { color: string }) {
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.7}>
      <group rotation={[Math.PI / 2.6, 0.3, 0]}>
        <mesh>
          <torusGeometry args={[1, 0.11, 24, 80]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.55, 0.4]} rotation={[0.4, 0.6, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * A small, lazy-loaded 3D scene — a gently rotating ring with a faceted
 * "gem" — used only on the proposal template's hero, where it's a
 * meaningful addition rather than novelty. Deliberately minimal geometry
 * and a capped device-pixel-ratio to stay light on mobile, since most
 * guests view this on a phone. Purely decorative: if WebGL fails, the
 * SilentErrorBoundary wrapping this just drops it and the flat ring
 * ornaments already in the hero remain.
 */
export default function RingScene({ accentColor }: { accentColor: string }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 3.4], fov: 35 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 3]} intensity={1.3} />
      <directionalLight position={[-3, -2, -2]} intensity={0.35} />
      <Ring color={accentColor} />
    </Canvas>
  );
}

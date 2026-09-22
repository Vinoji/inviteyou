"use client";

import dynamic from "next/dynamic";
import type { ParticleVariant } from "./Particles";

// Particles uses Math.random() per mount, so it must never be part of the
// server-rendered HTML (server and client would compute different random
// positions and React would flag a hydration mismatch). `ssr: false` is
// only legal from within a Client Component module, which is the entire
// reason this thin wrapper file exists — Hero.tsx itself stays a plain
// (server-renderable) component.
const Particles = dynamic(() => import("./Particles"), { ssr: false });

export default function ParticlesLoader(props: {
  variant: ParticleVariant;
  accentColor: string;
  count?: number;
}) {
  return <Particles {...props} />;
}

"use client";

import dynamic from "next/dynamic";
import SilentErrorBoundary from "./SilentErrorBoundary";

// WebGL/Canvas setup must never happen during SSR, and this is pure
// decoration — same ssr:false pattern as ParticlesLoader.
const RingScene = dynamic(() => import("./RingScene"), { ssr: false });

export default function RingSceneLoader({ accentColor }: { accentColor: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[6%] mx-auto h-56 w-56 opacity-80 sm:h-72 sm:w-72"
    >
      <SilentErrorBoundary>
        <RingScene accentColor={accentColor} />
      </SilentErrorBoundary>
    </div>
  );
}

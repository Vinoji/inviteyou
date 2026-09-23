import ParallaxLayer from "../ParallaxLayer";

/**
 * Two layered hill silhouettes along the bottom of a hero, each drifting at
 * a different scroll speed — the "background moves at a different speed"
 * parallax effect. Used on proposal-starlit, evoking a hillside skyline
 * under the night sky.
 */
export default function HillSilhouette({ tint = "#ffffff" }: { tint?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden sm:h-56">
      <ParallaxLayer speed={0.18} className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" width="100%" height="140" focusable="false">
          <path d="M0 90 Q60 30 120 70 T240 55 T400 80 L400 120 L0 120 Z" fill={tint} opacity="0.12" />
        </svg>
      </ParallaxLayer>
      <ParallaxLayer speed={0.35} className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" width="100%" height="110" focusable="false">
          <path d="M0 70 Q80 20 160 55 T320 40 T400 60 L400 100 L0 100 Z" fill={tint} opacity="0.22" />
        </svg>
      </ParallaxLayer>
    </div>
  );
}

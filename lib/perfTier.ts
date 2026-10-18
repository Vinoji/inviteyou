/**
 * How much motion this phone can take, judged once from what the browser
 * says about it:
 *   low  — ≤4 cores, ≤2 GB memory, data saver on, or reduced motion asked:
 *          old and budget phones (most of India's Android phones until
 *          recently). Decoration off, no WebGL in previews, no blur.
 *   mid  — ≤6 cores or ≤4 GB: fewer particles, previews wait for a tap
 *          when they're heavy.
 *   high — everything on.
 * Set on <html data-perf="…"> by PerfTierSync, so CSS can scale down too.
 */
export type PerfTier = "low" | "mid" | "high";

export function detectPerfTier(): PerfTier {
  if (typeof navigator === "undefined") return "high";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 4;
  const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (nav.connection?.saveData || reduce || cores <= 4 || memory <= 2) return "low";
  if (cores <= 6 || memory <= 4) return "mid";
  return "high";
}

/** The tier already set on <html> (or detected, before it is). */
export function perfTier(): PerfTier {
  if (typeof document === "undefined") return "high";
  const set = document.documentElement.dataset.perf as PerfTier | undefined;
  return set ?? detectPerfTier();
}

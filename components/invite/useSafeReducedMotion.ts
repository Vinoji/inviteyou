"use client";

import { useReducedMotionPref } from "@/lib/motionPref";

/**
 * Whether this component should skip or simplify its animation. Follows
 * the guest's own "Reduce motion" choice on the invitation (lib/motionPref)
 * rather than the device setting — battery savers switch that on silently
 * and left many guests with no animations at all. Always `false` on the
 * server and during hydration, so the first client render matches.
 */
export default function useSafeReducedMotion(): boolean {
  return useReducedMotionPref();
}

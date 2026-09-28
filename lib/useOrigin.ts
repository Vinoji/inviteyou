"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** The page origin ("https://…"): "" while server-rendering, the real one
 * once hydrated — so links built from it re-render with the full URL
 * instead of keeping a server-side guess. */
export function useOrigin(): string {
  return useSyncExternalStore(noSubscribe, () => window.location.origin, () => "");
}

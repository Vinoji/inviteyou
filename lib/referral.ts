"use client";

import { findCoupon, normalizeCode } from "./coupons";

/** A partner link's code (?ref=CODE), remembered on this device for 30
 * days so it still applies when the couple publishes later. */
const KEY = "namma:ref";
const KEEP_MS = 30 * 24 * 60 * 60 * 1000;

export function captureRef(): void {
  try {
    const code = normalizeCode(new URLSearchParams(window.location.search).get("ref"));
    if (code && findCoupon(code)) localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    // Private mode — the link's code just isn't remembered.
  }
}

export function savedRef(): string {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as { code?: string; at?: number } | null;
    if (!v?.code || !v.at || Date.now() - v.at > KEEP_MS) return "";
    return findCoupon(v.code) ? v.code : "";
  } catch {
    return "";
  }
}

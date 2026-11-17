"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { POSTHOG_HOST, POSTHOG_KEY } from "@/lib/analytics";

/** Pages never tracked (the admin and dev tools). */
const UNTRACKED = /^\/(ta\/)?(admin|dev)(\/|$)/;
/** Guests' invitations: counted and tapped, never recorded. */
const NO_RECORDING = /^\/(ta\/)?invite\//;

/**
 * Starts PostHog once per visit: page views (including in-app navigation),
 * taps on buttons and links (autocapture), and session recordings with
 * every typed field masked — so phone numbers and names never leave the
 * browser. Visitors who ask browsers not to track aren't.
 */
export default function Analytics() {
  useEffect(() => {
    const path = window.location.pathname;
    if (!POSTHOG_KEY || UNTRACKED.test(path) || posthog.__loaded) return;
    // Our own testing stays out of the numbers: on localhost only with ?posthog=on
    if (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
      try {
        if (new URLSearchParams(window.location.search).get("posthog") === "on") sessionStorage.setItem("posthog-dev", "1");
        if (!sessionStorage.getItem("posthog-dev")) return;
      } catch {
        return;
      }
    }
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: "history_change",
      capture_pageleave: true,
      autocapture: true,
      person_profiles: "identified_only",
      respect_dnt: true,
      disable_session_recording: NO_RECORDING.test(path),
      session_recording: { maskAllInputs: true, maskTextSelector: "[data-private]" },
    });
  }, []);
  return null;
}

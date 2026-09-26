"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { IntroId } from "@/lib/templates";
import type { IntroProps } from "./types";

/**
 * Intro id → component. Each intro is its own client chunk, so a template
 * only downloads the intro it uses. SSR stays on (unlike `ssr: false`) so
 * the closed intro is in the server HTML and covers the invitation from the
 * first paint, instead of the page flashing before the intro loads.
 *
 * To add an intro: create components/invite/intros/<Name>.tsx taking
 * IntroProps, add its id to IntroId in lib/templates.ts, register it here,
 * and point the template's `intro` at it.
 */
export const INTROS: Record<IntroId, ComponentType<IntroProps>> = {
  door: dynamic(() => import("./DoorIntro")),
  envelope: dynamic(() => import("./EnvelopeIntro")),
  kolam: dynamic(() => import("./KolamIntro")),
  split: dynamic(() => import("./SwissSplitIntro")),
  bloom: dynamic(() => import("./BloomIntro")),
  giftbox: dynamic(() => import("./GiftBoxIntro")),
  bottle: dynamic(() => import("./BottleIntro")),
};

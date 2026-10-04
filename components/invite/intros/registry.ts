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
  curtain: dynamic(() => import("./CurtainIntro")),
  scratch: dynamic(() => import("./ScratchIntro")),
  lanterns: dynamic(() => import("./LanternIntro")),
  thoranam: dynamic(() => import("./ThoranamIntro")),
  kasavu: dynamic(() => import("./KasavuIntro")),
  pookalam: dynamic(() => import("./PookalamIntro")),
  spotlight: dynamic(() => import("./SpotlightIntro")),
  ringbox: dynamic(() => import("./RingBoxIntro")),
  cradle: dynamic(() => import("./CradleIntro")),
  ticket: dynamic(() => import("./TicketIntro")),
  glasshouse: dynamic(() => import("./GlasshouseIntro")),
  chapel: dynamic(() => import("./ChapelIntro")),
  palaceGate: dynamic(() => import("../palace/PalaceIntro")),
  templeGate: dynamic(() => import("../palace/PalaceIntro")),
  cathedralDoors: dynamic(() => import("../palace/PalaceIntro")),
  parkGate: dynamic(() => import("../palace/PalaceIntro")),
  // Layout-style openings share one chunk (LayoutIntros.tsx).
  gopuram: dynamic(() => import("./LayoutIntros").then((m) => m.GopuramIntro)),
  marigoldCurtain: dynamic(() => import("./LayoutIntros").then((m) => m.MarigoldCurtainIntro)),
  jharokha: dynamic(() => import("./LayoutIntros").then((m) => m.JharokhaIntro)),
  lotusBloom: dynamic(() => import("./LayoutIntros").then((m) => m.LotusBloomIntro)),
  mughalDoors: dynamic(() => import("./LayoutIntros").then((m) => m.MughalDoorsIntro)),
  moonLanterns: dynamic(() => import("./LayoutIntros").then((m) => m.MoonLanternsIntro)),
  stainedGlass: dynamic(() => import("./LayoutIntros").then((m) => m.StainedGlassIntro)),
  foilCard: dynamic(() => import("./LayoutIntros").then((m) => m.FoilCardIntro)),
  sunrise: dynamic(() => import("./LayoutIntros").then((m) => m.SunriseIntro)),
  candlelight: dynamic(() => import("./LayoutIntros").then((m) => m.CandlelightIntro)),
  balloonPop: dynamic(() => import("./LayoutIntros").then((m) => m.BalloonPopIntro)),
  cakeCandles: dynamic(() => import("./LayoutIntros").then((m) => m.CakeCandlesIntro)),
  pathirikaiEnvelope: dynamic(() => import("../premium/pathirikai/EnvelopeOpening")),
  photoParty: dynamic(() => import("../premium/cinema/PhotoIntros").then((m) => m.PartyIntro)),
  photoCandle: dynamic(() => import("../premium/cinema/PhotoIntros").then((m) => m.CandleIntro)),
  photoFresh: dynamic(() => import("../premium/cinema/PhotoIntros").then((m) => m.FreshIntro)),
};

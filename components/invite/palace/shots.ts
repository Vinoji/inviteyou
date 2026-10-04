/**
 * The camera journey through the palace. Every section of the page carries
 * a `data-palace-shot` naming one of these poses; as the guest scrolls, the
 * camera eases from one section's pose to the next (see PalaceStage). A
 * section that isn't rendered simply drops out of the path.
 *
 * World layout (metres, camera looks down -z):
 *   z = 0          the palace gate in its facade
 *   z = 0 … -40    the pillared hall, chandeliers and jali screens
 *   z = -40 … -58  the courtyard with a fountain
 *   z = -60        the inner palace, lit from within
 */

export type ShotId =
  | "entrance"
  | "hero"
  | "story"
  | "family"
  | "events"
  | "countdown"
  | "gallery"
  | "travel"
  | "places"
  | "faq"
  | "rsvp"
  | "blessings"
  | "guests"
  | "share"
  | "finale";

export interface Pose {
  pos: [number, number, number];
  look: [number, number, number];
  /** Sky / fog colour. */
  bg: string;
  /** 0 = gate closed, 1 = fully open. */
  gate: number;
  /** 0 = lamps low, 1 = the whole palace illuminated. */
  glow: number;
}

export const SHOTS: Record<ShotId, Pose> = {
  entrance: { pos: [0, 1.7, 13], look: [0, 2.6, 0], bg: "#04060E", gate: 0.08, glow: 0.35 },
  hero: { pos: [0, 1.8, 4], look: [0, 2.2, -12], bg: "#0A1330", gate: 1, glow: 0.55 },
  story: { pos: [1.3, 1.9, -5], look: [-1.6, 2.3, -16], bg: "#0B1A2E", gate: 1, glow: 0.55 },
  family: { pos: [-1.3, 2.1, -13], look: [1.6, 2.5, -24], bg: "#0A2A22", gate: 1, glow: 0.6 },
  events: { pos: [0, 2.8, -23], look: [0, 1.4, -46], bg: "#0C2620", gate: 1, glow: 0.6 },
  countdown: { pos: [0.9, 1.6, -29], look: [0, 3.2, -40], bg: "#0A1330", gate: 1, glow: 0.65 },
  gallery: { pos: [-1.1, 2.2, -33], look: [2, 2, -44], bg: "#1A0F1C", gate: 1, glow: 0.65 },
  travel: { pos: [0, 3.6, -37], look: [0, 1, -52], bg: "#16120F", gate: 1, glow: 0.65 },
  places: { pos: [2, 3, -40], look: [-1, 1.5, -54], bg: "#0A2A22", gate: 1, glow: 0.7 },
  faq: { pos: [-2, 2.5, -42], look: [1, 1.5, -54], bg: "#0A1330", gate: 1, glow: 0.7 },
  rsvp: { pos: [0, 1.6, -43], look: [0, 2.4, -60], bg: "#03050C", gate: 1, glow: 0.8 },
  blessings: { pos: [1.5, 2.2, -45], look: [-1, 2.8, -60], bg: "#0A1330", gate: 1, glow: 0.85 },
  guests: { pos: [-1.5, 2, -46], look: [1, 2.6, -60], bg: "#0B1A2E", gate: 1, glow: 0.9 },
  share: { pos: [0, 2.4, -44], look: [0, 2.8, -60], bg: "#0A1330", gate: 1, glow: 0.95 },
  finale: { pos: [0, 2.4, 24], look: [0, 3.4, 0], bg: "#060A18", gate: 1, glow: 1 },
};

/** Live camera input, written by the scroll listener and read every frame. */
export interface ShotTrack {
  /** Poses of the rendered sections, in page order. */
  poses: Pose[];
  /** Position along `poses`: 2.25 = a quarter of the way from pose 2 to 3. */
  at: number;
}

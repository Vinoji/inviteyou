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

/** Which 3D world a premium template walks through. */
export type WorldId = "palace" | "temple" | "cathedral" | "park";

type Overrides = Partial<Record<ShotId, Partial<Pose>>>;

/** Per-world adjustments to the shared path: taller fronts need the camera
 * further back and looking higher, and each world has its own sky. */
const WORLD_SHOTS: Record<WorldId, Overrides> = {
  palace: {},
  // Twilight in a blossom park: the camera walks the path behind the couple.
  park: {
    entrance: { pos: [0, 2.4, 19], look: [0, 2.6, 0], bg: "#2A2240", gate: 0.05 },
    hero: { pos: [1.12, 1.9, 7], look: [-0.84, 1.6, -5], bg: "#2A2240" },
    story: { pos: [0.8, 1.8, 0], look: [-1.56, 1.8, -12], bg: "#2A2240" },
    family: { pos: [-1.92, 1.9, -7], look: [-1.37, 1.9, -19], bg: "#2A2240" },
    events: { pos: [-1.59, 2.4, -13], look: [-0.4, 1.2, -26], bg: "#2A2240" },
    countdown: { pos: [-0.77, 2.6, -19], look: [0.13, 1.4, -29], bg: "#2A2240" },
    gallery: { pos: [-0.57, 3.4, -25], look: [1.09, 1.6, -35], bg: "#2A2240" },
    travel: { pos: [0.48, 3.2, -31], look: [1.4, 2.4, -47], bg: "#2A2240" },
    places: { pos: [2.29, 2.6, -35], look: [1.19, 2.6, -49], bg: "#2A2240" },
    faq: { pos: [0.21, 2.6, -38], look: [0.77, 2.8, -52], bg: "#2A2240" },
    rsvp: { pos: [1.54, 2.2, -40], look: [-0.26, 3.8, -58], bg: "#2A2240" },
    blessings: { pos: [2.58, 2.4, -41], look: [-0.43, 4.2, -59], bg: "#2A2240" },
    guests: { pos: [0.6, 2.4, -42], look: [-0.6, 4.2, -60], bg: "#2A2240" },
    share: { pos: [1.58, 2.6, -41], look: [-0.43, 4.4, -59], bg: "#2A2240" },
    finale: { pos: [0, 13, -19], look: [0, 6, -60], bg: "#2A2240" },
  },
  // Dusk over a South Indian temple: indigo sky warming to saffron.
  temple: {
    entrance: { pos: [0, 2.4, 23], look: [0, 6.8, 0], bg: "#120A1E" },
    hero: { bg: "#1A1024" },
    story: { bg: "#1E1226" },
    family: { bg: "#22101C" },
    events: { bg: "#24131A" },
    countdown: { bg: "#2A1418" },
    gallery: { bg: "#1E1226" },
    travel: { pos: [0, 4, -36], bg: "#2C1A28" },
    places: { bg: "#2A1C30" },
    faq: { bg: "#1E1430" },
    rsvp: { bg: "#140C22" },
    blessings: { bg: "#1A1028" },
    guests: { bg: "#1E1226" },
    share: { bg: "#1A1028" },
    finale: { pos: [0, 3.2, 32], look: [0, 7.5, 0], bg: "#120A1E" },
  },
  // A cathedral by night: deep blue, violet where the glass glows.
  cathedral: {
    entrance: { pos: [0, 2.6, 25], look: [0, 7.6, 0], bg: "#060A1C" },
    hero: { pos: [0, 2, 4], look: [0, 3.2, -12], bg: "#0A1028" },
    story: { pos: [1.3, 2.2, -5], look: [-1.6, 3.4, -16], bg: "#0E0F2C" },
    family: { pos: [-1.3, 2.3, -13], look: [1.6, 3.6, -24], bg: "#120E2C" },
    events: { pos: [0, 3.2, -23], look: [0, 2.4, -46], bg: "#0A1028" },
    countdown: { pos: [0.9, 2, -31], look: [0, 4, -52], bg: "#0E0F2C" },
    gallery: { bg: "#140C26" },
    travel: { pos: [0, 4, -37], look: [0, 2, -54], bg: "#0A1028" },
    rsvp: { pos: [0, 2.2, -42], look: [0, 4.5, -60], bg: "#050816" },
    finale: { pos: [0, 3.5, 34], look: [0, 9.5, 0], bg: "#060A1C" },
  },
};

/** The poses for one world. */
export function shotsFor(world: WorldId): Record<ShotId, Pose> {
  const o = WORLD_SHOTS[world];
  return Object.fromEntries(
    (Object.keys(SHOTS) as ShotId[]).map((id) => [id, { ...SHOTS[id], ...o[id] }])
  ) as Record<ShotId, Pose>;
}

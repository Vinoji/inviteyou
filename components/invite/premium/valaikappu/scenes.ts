/**
 * The Tamil scene cards — one page (ValaikappuInvitation.tsx) dressed per
 * design: four screens under the thoranam and bells, each with its own
 * illustrations rising in at the foot. A design names its wording (a
 * `premium.<ns>` messages group), its art folder and what stands on each
 * screen. Art is made for InviteForYou, in public/art/<folder>.
 */

/** How a figure stands on its screen's ground. */
export type Place =
  /** Centred, sized by the ground's height. */
  | "center"
  /** Centred, sized by width (wide scenes: a house, a lamp between trees). */
  | "wide"
  /** At the left / right of the ground, sized by its height. */
  | "left"
  | "right"
  /** Reaching in from the left edge (a hand). */
  | "edge"
  /** Edge to edge (hands from both sides holding a plate). */
  | "bleed";

export interface Figure {
  src: string;
  place: Place;
  /** A share of the ground's height (left/right/center/edge). */
  scale?: number;
}

export interface Screen {
  /** The ground's height: a share of the screen, capped in pixels. */
  ground: [svh: number, px: number];
  figures: Figure[];
}

export interface SceneDesign {
  /** messages group: premium.<ns> (and invite.intros.<ns> for the opening). */
  ns: string;
  art: string;
  screens: [Screen, Screen, Screen, Screen];
  /** Under the family's welcome on the last screen. */
  ornament: string;
  /** The opening: the figure at the top and the piece over the hint. */
  intro: { top: string; tap: string };
  /** Across the top: a mango-leaf thoranam with temple bells (the default),
   * or a jasmine garland without bells (a church wedding, a nikah). */
  canopy?: "thoranam" | "jasmine";
  /** The kolam under the first screen's title (default true). */
  kolam?: boolean;
}

const VELUM: SceneDesign = {
  ns: "valaikappu",
  art: "valaikappu",
  screens: [
    { ground: [26, 230], figures: [{ src: "murugan", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "couple", place: "center" }] },
    {
      ground: [36, 300],
      figures: [
        { src: "elephant", place: "left", scale: 0.56 },
        { src: "mother", place: "right" },
      ],
    },
    { ground: [30, 240], figures: [{ src: "lotus-hand", place: "edge" }] },
  ],
  ornament: "bangles",
  intro: { top: "murugan", tap: "bangles" },
};

const MANGALA: SceneDesign = {
  ns: "mangala",
  art: "mangala-thirumanam",
  screens: [
    { ground: [30, 260], figures: [{ src: "kuthuvilakku", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "garland", place: "center" }] },
    { ground: [30, 250], figures: [{ src: "musicians", place: "wide" }] },
    { ground: [24, 210], figures: [{ src: "thali", place: "bleed" }] },
  ],
  ornament: "manavarai",
  intro: { top: "ganesha", tap: "thali" },
};

const PUDHUMANAI: SceneDesign = {
  ns: "pudhumanai",
  art: "pudhumanai-puguvizha",
  screens: [
    { ground: [30, 260], figures: [{ src: "house", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "milk-pot", place: "center" }] },
    { ground: [32, 270], figures: [{ src: "cow", place: "center" }] },
    { ground: [28, 230], figures: [{ src: "key", place: "edge" }] },
  ],
  ornament: "kalasam",
  intro: { top: "ganesha", tap: "kalasam" },
};

const KANNAN: SceneDesign = {
  ns: "kannan",
  art: "kannan-valaikaappu",
  screens: [
    { ground: [30, 250], figures: [{ src: "krishna", place: "center" }] },
    { ground: [36, 300], figures: [{ src: "bangle-ceremony", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "couple", place: "center" }] },
    { ground: [22, 190], figures: [{ src: "bangle-tray", place: "bleed" }] },
  ],
  ornament: "seer",
  intro: { top: "krishna", tap: "bangle-tray" },
};

// ── Kerala ──

const KERALA_KALYANAM: SceneDesign = {
  ns: "keralaKalyanam",
  art: "kerala-kalyanam",
  screens: [
    { ground: [30, 260], figures: [{ src: "nilavilakku", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "couple", place: "center" }] },
    { ground: [30, 250], figures: [{ src: "chenda", place: "wide" }] },
    { ground: [26, 220], figures: [{ src: "uruli", place: "bleed" }] },
  ],
  ornament: "ashtamangalyam",
  intro: { top: "guruvayurappan", tap: "ashtamangalyam" },
};

const MINNU_KETTU: SceneDesign = {
  ns: "minnuKettu",
  art: "minnu-kettu",
  screens: [
    { ground: [30, 260], figures: [{ src: "church", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "couple", place: "center" }] },
    { ground: [32, 270], figures: [{ src: "margamkali", place: "wide" }] },
    { ground: [34, 290], figures: [{ src: "minnu", place: "center" }] },
  ],
  ornament: "lilies",
  intro: { top: "doves", tap: "doves" },
  canopy: "jasmine",
  kolam: false,
};

const MYLANCHI_NIKAH: SceneDesign = {
  ns: "mylanchiNikah",
  art: "mylanchi-nikah",
  screens: [
    { ground: [32, 280], figures: [{ src: "mosque", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "couple", place: "center" }] },
    { ground: [30, 250], figures: [{ src: "oppana", place: "wide" }] },
    { ground: [26, 220], figures: [{ src: "mylanchi-hand", place: "edge" }] },
  ],
  ornament: "mylanchi",
  intro: { top: "lantern", tap: "mylanchi" },
  canopy: "jasmine",
  kolam: false,
};

const KERALA_GRUHAPRAVESHAM: SceneDesign = {
  ns: "keralaGruha",
  art: "kerala-gruhapravesham",
  screens: [
    { ground: [30, 260], figures: [{ src: "nalukettu", place: "wide" }] },
    { ground: [42, 360], figures: [{ src: "couple", place: "center" }] },
    { ground: [28, 240], figures: [{ src: "paal-kaachal", place: "wide" }] },
    { ground: [26, 220], figures: [{ src: "kindi", place: "edge" }] },
  ],
  ornament: "nirapara",
  intro: { top: "nirapara", tap: "kindi" },
};

const NOOLUKETTU: SceneDesign = {
  ns: "noolukettu",
  art: "noolukettu",
  screens: [
    { ground: [30, 260], figures: [{ src: "thottil", place: "wide" }] },
    { ground: [40, 340], figures: [{ src: "parents", place: "center" }] },
    { ground: [36, 300], figures: [{ src: "grandparents", place: "center" }] },
    { ground: [22, 190], figures: [{ src: "baby-hand", place: "edge" }] },
  ],
  ornament: "aranjanam",
  intro: { top: "krishna", tap: "aranjanam" },
};

const CHOROONU: SceneDesign = {
  ns: "choroonu",
  art: "choroonu",
  screens: [
    { ground: [32, 280], figures: [{ src: "elephants", place: "wide" }] },
    { ground: [40, 340], figures: [{ src: "feeding", place: "center" }] },
    { ground: [30, 250], figures: [{ src: "payasam", place: "center" }] },
    { ground: [24, 210], figures: [{ src: "sadya", place: "bleed" }] },
  ],
  ornament: "elephant",
  intro: { top: "elephant", tap: "payasam" },
};

export const SCENE_DESIGNS: Record<string, SceneDesign> = {
  "velum-mayilum-valaikappu": VELUM,
  "mangala-thirumanam": MANGALA,
  "pudhumanai-puguvizha": PUDHUMANAI,
  "kannan-valaikaappu": KANNAN,
  "kerala-kalyanam": KERALA_KALYANAM,
  "minnu-kettu": MINNU_KETTU,
  "mylanchi-nikah": MYLANCHI_NIKAH,
  "kerala-gruhapravesham": KERALA_GRUHAPRAVESHAM,
  "noolukettu": NOOLUKETTU,
  "choroonu": CHOROONU,
};

export function sceneDesign(templateId: string): SceneDesign {
  return SCENE_DESIGNS[templateId] ?? VELUM;
}

export const artSrc = (d: SceneDesign, name: string) => `/art/${d.art}/${name}.webp`;

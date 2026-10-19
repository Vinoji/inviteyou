/**
 * The printed-card designs: each is the look of a real Indian wedding card
 * of one tradition — the paper, the ink, the foil, the border and the
 * invocation at the top — modelled on what printers sell for that
 * community (turmeric Tamil pathirikai, maroon-and-gold cards, Kerala
 * kasavu, emerald Nikah cards with a Mughal arch and Bismillah, ivory
 * Holy Matrimony cards with a cross and verse, Anand Karaj cards with ੴ,
 * Jain cards with the Namokar line). The wording lives in messages under
 * `printed.<wording>`.
 */

/** Which tradition's wording and order the card uses (messages `printed.<id>`). */
export type Wording = "tamil" | "kerala" | "nikah" | "christian" | "sikh" | "jain";
/** The border printed around the card. */
export type Frame = "temple" | "mughal" | "kasavu" | "geometric" | "corners" | "phulkari";
/** What sits at the very top, in foil. */
export type Emblem = "suzhi" | "lamp" | "bismillah" | "cross" | "ikonkar" | "kalash";

/** Extra printed inserts after the card. */
export type Extra = "rituals" | "sadya";

export interface PrintedDesign {
  wording: Wording;
  frame: Frame;
  emblem: Emblem;
  /** Card stock, top → bottom. */
  paper: [string, string];
  /** The desk the card lies on. */
  desk: string;
  ink: string;
  soft: string;
  /** The names, ribbons and headings. */
  accent: string;
  /** Text on the ribbons. */
  ribbonInk: string;
  /** Foil: base and highlight. */
  foil: string;
  foilHi: string;
  /** The envelope and its liner. */
  envelope: string;
  /** The envelope's wax seal, when it isn't the foil (a red seal would
   * vanish on a red envelope). */
  seal?: [base: string, highlight: string];
  liner: string;
  /** Pattern colours for geometric / phulkari borders. */
  pattern?: string[];
  /** Dark card stock (light text). */
  dark?: boolean;
  /** The groom is named first (Tamil, Nikah, Christian cards). */
  groomFirst: boolean;
  /** The order-of-ceremonies programme, or the sadya menu. */
  extras?: Extra[];
}

export const PRINTED: Record<string, PrintedDesign> = {
  // ── Hindu ──
  "manjal-pathirikai": {
    wording: "tamil",
    frame: "temple",
    emblem: "suzhi",
    paper: ["#fbe38a", "#f5cf55"],
    desk: "#7a2a12",
    ink: "#4a1608",
    soft: "#6e3415",
    accent: "#b3121f",
    ribbonInk: "#fff4d6",
    // real manjal cards print the border and emblem in kumkum red
    foil: "#a3121c",
    foilHi: "#e2574f",
    envelope: "#c2161f",
    liner: "#f5cf55",
    seal: ["#c9962c", "#fbe7a6"],
    groomFirst: true,
  },
  "maroon-pathirikai": {
    wording: "tamil",
    frame: "temple",
    emblem: "suzhi",
    paper: ["#6d0f1c", "#4a0812"],
    desk: "#1e0a06",
    ink: "#f8e3b6",
    soft: "#e7c993",
    accent: "#f3cf73",
    ribbonInk: "#4a0812",
    foil: "#c9962c",
    foilHi: "#fbe7a6",
    envelope: "#5a0b16",
    liner: "#c9962c",
    dark: true,
    groomFirst: true,
  },
  "kerala-sumuhurtham": {
    wording: "kerala",
    frame: "kasavu",
    emblem: "lamp",
    paper: ["#fbf5e6", "#f3e8cc"],
    desk: "#2f5a2a",
    ink: "#3d1a0c",
    soft: "#6a4a30",
    accent: "#8a1620",
    ribbonInk: "#fff7e4",
    foil: "#b8892a",
    foilHi: "#f4d98c",
    envelope: "#f3e8cc",
    liner: "#c9962c",
    groomFirst: true,
  },
  // Batch 3: a Tamil kalyanam card with its order of ceremonies, and a
  // Kerala kasavu card with the sadya menu on a banana-leaf insert.
  "kalyanam-rituals": {
    wording: "tamil",
    frame: "temple",
    emblem: "suzhi",
    paper: ["#fffaf0", "#f6e7c8"],
    desk: "#5a0f1c",
    ink: "#3a1410",
    soft: "#6a3a26",
    accent: "#7a1424",
    ribbonInk: "#fff3d6",
    foil: "#a8740f",
    foilHi: "#f2cf7a",
    envelope: "#7a1424",
    liner: "#e0a526",
    groomFirst: true,
    extras: ["rituals"],
  },
  "kerala-sadya": {
    wording: "kerala",
    frame: "kasavu",
    emblem: "lamp",
    paper: ["#fdf8ea", "#f4ead0"],
    desk: "#1f4a2a",
    ink: "#2f1c0c",
    soft: "#5e4a30",
    accent: "#2f6b2a",
    ribbonInk: "#fdf8ea",
    foil: "#b8892a",
    foilHi: "#f4d98c",
    envelope: "#f4ead0",
    liner: "#2f6b2a",
    groomFirst: true,
    extras: ["sadya"],
  },
  // ── Muslim ──
  "emerald-nikah": {
    wording: "nikah",
    frame: "mughal",
    emblem: "bismillah",
    paper: ["#0d4a3a", "#073227"],
    desk: "#0e1714",
    ink: "#f6ecd2",
    soft: "#d9caa2",
    accent: "#f0cf7e",
    ribbonInk: "#073227",
    foil: "#c9a24a",
    foilHi: "#fbecb4",
    envelope: "#0a3d30",
    liner: "#c9a24a",
    dark: true,
    groomFirst: true,
  },
  "ivory-nikah": {
    wording: "nikah",
    frame: "geometric",
    emblem: "bismillah",
    paper: ["#fdfaf2", "#f4ecda"],
    desk: "#1b2a44",
    ink: "#1b2a44",
    soft: "#4f5b73",
    accent: "#1f3a6b",
    ribbonInk: "#fdfaf2",
    foil: "#b08a3e",
    foilHi: "#f1d998",
    envelope: "#1f3a6b",
    liner: "#b08a3e",
    pattern: ["#1f3a6b", "#b08a3e"],
    groomFirst: true,
  },
  // ── Christian ──
  "ivory-holy-matrimony": {
    wording: "christian",
    frame: "corners",
    emblem: "cross",
    paper: ["#fffdf8", "#f6f0e2"],
    desk: "#d9cfbd",
    ink: "#3a3226",
    soft: "#6b6152",
    accent: "#7a5a22",
    ribbonInk: "#fffdf8",
    foil: "#b8964f",
    foilHi: "#f2e2ae",
    envelope: "#efe7d6",
    liner: "#b8964f",
    groomFirst: true,
  },
  "royal-blue-matrimony": {
    wording: "christian",
    frame: "corners",
    emblem: "cross",
    paper: ["#1d3a7a", "#132858"],
    desk: "#0b1430",
    ink: "#f2f5fb",
    soft: "#c6d0e6",
    accent: "#ffffff",
    ribbonInk: "#132858",
    foil: "#b9c3d6",
    foilHi: "#ffffff",
    envelope: "#132858",
    liner: "#b9c3d6",
    dark: true,
    groomFirst: true,
  },
  // ── Sikh ──
  "anand-karaj-ivory": {
    wording: "sikh",
    frame: "corners",
    emblem: "ikonkar",
    paper: ["#fffaf0", "#f7ead2"],
    desk: "#e08a1e",
    ink: "#3b2410",
    soft: "#6e5034",
    accent: "#b8560a",
    ribbonInk: "#fffaf0",
    foil: "#b8862c",
    foilHi: "#f6dc92",
    envelope: "#e9861c",
    liner: "#b8862c",
    groomFirst: false,
  },
  "phulkari-anand-karaj": {
    wording: "sikh",
    frame: "phulkari",
    emblem: "ikonkar",
    paper: ["#fff6e6", "#fbe6c4"],
    desk: "#7a1030",
    ink: "#3b1a10",
    soft: "#6e4030",
    accent: "#c2185b",
    ribbonInk: "#fff6e6",
    foil: "#b8862c",
    foilHi: "#f6dc92",
    envelope: "#e86a12",
    liner: "#c2185b",
    pattern: ["#e86a12", "#c2185b", "#f6b40e", "#2e7d32"],
    groomFirst: false,
  },
  // ── Jain ──
  "jain-namokar-maroon": {
    wording: "jain",
    frame: "temple",
    emblem: "kalash",
    paper: ["#5e1426", "#3e0b19"],
    desk: "#1a070c",
    ink: "#f8e6c2",
    soft: "#e2c79a",
    accent: "#f3cf73",
    ribbonInk: "#3e0b19",
    foil: "#c9962c",
    foilHi: "#fbe7a6",
    envelope: "#4e1020",
    liner: "#c9962c",
    dark: true,
    groomFirst: false,
  },
  "jain-kesar-ivory": {
    wording: "jain",
    frame: "geometric",
    emblem: "kalash",
    paper: ["#fffaf0", "#f8ecd4"],
    desk: "#a8501a",
    ink: "#3b2210",
    soft: "#6e4e34",
    accent: "#c45a12",
    ribbonInk: "#fffaf0",
    foil: "#b8862c",
    foilHi: "#f6dc92",
    envelope: "#d8781c",
    liner: "#b8862c",
    pattern: ["#c45a12", "#b8862c"],
    groomFirst: false,
  },
};

export function printedDesign(templateId: string): PrintedDesign {
  return PRINTED[templateId] ?? PRINTED["manjal-pathirikai"];
}

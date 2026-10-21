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
export type Wording =
  | "tamil"
  | "kerala"
  | "nikah"
  | "christian"
  | "sikh"
  | "jain"
  // Other occasions, printed the same way
  | "nichayam"
  | "griha"
  | "namakaranam"
  | "valaikaappu"
  | "shashti"
  | "firstBirthday"
  | "corporate"
  | "houseBlessing"
  | "milestone"
  | "modern"
  | "shubhVivah"
  | "subhaLekha"
  | "bengali"
  | "marathi";
/** The border printed around the card. */
export type Frame =
  | "temple"
  | "mughal"
  | "kasavu"
  | "geometric"
  | "corners"
  | "phulkari"
  // printed pattern borders
  | "kolam"
  | "paisley"
  | "jaali"
  | "lace"
  | "deco"
  | "muggu"
  | "alpana"
  | "paithani"
  // no border: the names pressed into heavy cotton stock
  | "letterpress";
/** The printed pattern used for a border or an envelope liner. */
export type Pattern = "geometric" | "phulkari" | "kolam" | "paisley" | "jaali" | "lace" | "deco" | "muggu" | "alpana" | "paithani";
/** What sits at the very top, in foil. */
export type Emblem = "suzhi" | "lamp" | "bismillah" | "cross" | "ikonkar" | "kalash" | "none";

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
  /** The envelope's printed liner: a pattern in the given colours. */
  liner2?: { pattern: Pattern; colors: string[] };
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
    liner2: { pattern: "kolam", colors: ["#c2161f", "#c2161f"] },
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
    liner2: { pattern: "paisley", colors: ["#5a0b16", "#5a0b16"] },
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
    liner2: { pattern: "kolam", colors: ["#8a1620", "#8a1620"] },
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
    liner2: { pattern: "kolam", colors: ["#7a1424", "#7a1424"] },
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
    liner2: { pattern: "kolam", colors: ["#f4ead0", "#f4ead0"] },
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
    liner2: { pattern: "jaali", colors: ["#0a3d30", "#0a3d30"] },
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
    liner2: { pattern: "geometric", colors: ["#1f3a6b", "#1f3a6b"] },
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
    liner2: { pattern: "lace", colors: ["#efe7d6", "#efe7d6"] },
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
    liner2: { pattern: "lace", colors: ["#132858", "#132858"] },
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
    liner2: { pattern: "phulkari", colors: ["#e9861c", "#c2185b", "#fffaf0", "#2e7d32"] },
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
    liner2: { pattern: "phulkari", colors: ["#f6b40e", "#e86a12", "#fff6e6", "#2e7d32"] },
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
    liner2: { pattern: "paisley", colors: ["#4e1020", "#4e1020"] },
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
    liner2: { pattern: "geometric", colors: ["#d8781c", "#d8781c"] },
    pattern: ["#c45a12", "#b8862c"],
    groomFirst: false,
  },
  // ── Other occasions: the same printed cards, worded for the function ──
  "nichayathartham-pathirikai": {
    wording: "nichayam",
    frame: "temple",
    emblem: "suzhi",
    paper: ["#fff3e6", "#fbdcc0"],
    desk: "#6b1424",
    ink: "#4a1608",
    soft: "#6e3415",
    accent: "#b3203a",
    ribbonInk: "#fff4e6",
    foil: "#a8740f",
    foilHi: "#f8e08a",
    envelope: "#b3203a",
    liner: "#f2c45a",
    liner2: { pattern: "kolam", colors: ["#b3203a", "#b3203a"] },
    seal: ["#c9962c", "#fbe7a6"],
    groomFirst: true,
  },
  "griha-pravesam-pathirikai": {
    wording: "griha",
    frame: "temple",
    emblem: "kalash",
    paper: ["#fbe38a", "#f5cf55"],
    desk: "#7a2a12",
    ink: "#4a1608",
    soft: "#6e3415",
    accent: "#b3121f",
    ribbonInk: "#fff4d6",
    foil: "#a3121c",
    foilHi: "#e2574f",
    envelope: "#c2161f",
    liner: "#f5cf55",
    liner2: { pattern: "kolam", colors: ["#c2161f", "#c2161f"] },
    seal: ["#c9962c", "#fbe7a6"],
    groomFirst: true,
  },
  "namakaranam-card": {
    wording: "namakaranam",
    frame: "corners",
    emblem: "suzhi",
    paper: ["#f7fbff", "#e6f1fa"],
    desk: "#c9d9e8",
    ink: "#1f3448",
    soft: "#4f6478",
    accent: "#2f6d8a",
    ribbonInk: "#f7fbff",
    foil: "#b8964f",
    foilHi: "#f2e2ae",
    envelope: "#dceaf6",
    liner: "#b8964f",
    liner2: { pattern: "lace", colors: ["#dceaf6", "#dceaf6"] },
    groomFirst: true,
  },
  "valaikaappu-card": {
    wording: "valaikaappu",
    frame: "temple",
    emblem: "suzhi",
    paper: ["#0f5a3a", "#0a3f29"],
    desk: "#071c13",
    ink: "#f6ecd2",
    soft: "#d9caa2",
    accent: "#f0cf7e",
    ribbonInk: "#0a3f29",
    foil: "#c9a24a",
    foilHi: "#fbecb4",
    envelope: "#0d4a33",
    liner: "#c2185b",
    liner2: { pattern: "paisley", colors: ["#0d4a33", "#0d4a33"] },
    dark: true,
    groomFirst: true,
  },
  "shashtiabdapoorthi-card": {
    wording: "shashti",
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
    liner2: { pattern: "paisley", colors: ["#5a0b16", "#5a0b16"] },
    dark: true,
    groomFirst: true,
  },
  "first-birthday-card": {
    wording: "firstBirthday",
    frame: "corners",
    emblem: "kalash",
    paper: ["#fff8fb", "#fde6ef"],
    desk: "#f3c6d6",
    ink: "#4a2333",
    soft: "#7a5363",
    accent: "#c2185b",
    ribbonInk: "#fff8fb",
    foil: "#b8964f",
    foilHi: "#f2e2ae",
    envelope: "#f7d3e0",
    liner: "#b8964f",
    liner2: { pattern: "lace", colors: ["#f7d3e0", "#f7d3e0"] },
    groomFirst: true,
  },
  "corporate-formal-card": {
    wording: "corporate",
    frame: "corners",
    emblem: "none",
    paper: ["#14213d", "#0b1428"],
    desk: "#05080f",
    ink: "#eef2fa",
    soft: "#b9c3d6",
    accent: "#e2c37a",
    ribbonInk: "#0b1428",
    foil: "#c9a24a",
    foilHi: "#fbecb4",
    envelope: "#0f1a33",
    liner: "#c9a24a",
    liner2: { pattern: "deco", colors: ["#0f1a33", "#0f1a33"] },
    dark: true,
    groomFirst: true,
  },
  "house-blessing-card": {
    wording: "houseBlessing",
    frame: "corners",
    emblem: "cross",
    paper: ["#fffdf8", "#f3ecdc"],
    desk: "#b9c7a8",
    ink: "#2f3a26",
    soft: "#5e6a52",
    accent: "#4a6b3a",
    ribbonInk: "#fffdf8",
    foil: "#b8964f",
    foilHi: "#f2e2ae",
    envelope: "#e8efe0",
    liner: "#b8964f",
    liner2: { pattern: "lace", colors: ["#e8efe0", "#e8efe0"] },
    groomFirst: true,
  },
  "milestone-birthday-card": {
    wording: "milestone",
    frame: "corners",
    emblem: "none",
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
    liner2: { pattern: "deco", colors: ["#4e1020", "#4e1020"] },
    dark: true,
    groomFirst: true,
  },
  // ── More printed styles: letterpress, art deco, kolam, paisley, jaali,
  // Kerala Christian kasavu, lace ──
  "letterpress-ivory": {
    wording: "modern",
    frame: "letterpress",
    emblem: "none",
    paper: ["#fbf8f1", "#f3eee3"],
    desk: "#cfc6b6",
    ink: "#2e2a24",
    soft: "#6b645a",
    accent: "#3c4a3a",
    ribbonInk: "#fbf8f1",
    foil: "#9a8a6a",
    foilHi: "#d9cba8",
    envelope: "#efe9dc",
    liner: "#3c4a3a",
    liner2: { pattern: "lace", colors: ["#9fb39a", "#d9cba8"] },
    seal: ["#3c4a3a", "#7d8f78"],
    groomFirst: false,
  },
  "art-deco-noir": {
    wording: "modern",
    frame: "deco",
    emblem: "none",
    paper: ["#161616", "#0b0b0b"],
    desk: "#000000",
    ink: "#f2e6c8",
    soft: "#c9b98f",
    accent: "#e2c37a",
    ribbonInk: "#0b0b0b",
    foil: "#c9a24a",
    foilHi: "#fbecb4",
    envelope: "#141414",
    liner: "#c9a24a",
    liner2: { pattern: "deco", colors: ["#1a1a1a", "#1a1a1a"] },
    pattern: ["#c9a24a", "#fbecb4"],
    dark: true,
    groomFirst: false,
  },
  "kolam-pathirikai": {
    wording: "tamil",
    frame: "kolam",
    emblem: "suzhi",
    paper: ["#7a1424", "#5a0f1c"],
    desk: "#2a0608",
    ink: "#fff3e0",
    soft: "#f1d7b8",
    accent: "#f6d58a",
    ribbonInk: "#5a0f1c",
    foil: "#d6a84c",
    foilHi: "#fbe7a6",
    envelope: "#7a1424",
    liner: "#f6d58a",
    liner2: { pattern: "kolam", colors: ["#7a1424", "#7a1424"] },
    pattern: ["#fff8ee", "#f6d58a"],
    dark: true,
    groomFirst: true,
  },
  "paisley-silk-vivah": {
    wording: "shubhVivah",
    frame: "paisley",
    emblem: "kalash",
    paper: ["#b3121f", "#8e0e19"],
    desk: "#3a0508",
    ink: "#fff1d6",
    soft: "#f4d3a6",
    accent: "#f6d58a",
    ribbonInk: "#8e0e19",
    foil: "#d4a440",
    foilHi: "#fbe7a6",
    envelope: "#8e0e19",
    liner: "#f2b134",
    liner2: { pattern: "paisley", colors: ["#8e0e19", "#b3121f"] },
    pattern: ["#f6d58a", "#ffe9b8"],
    dark: true,
    groomFirst: true,
  },
  "jaali-velvet-nikah": {
    wording: "nikah",
    frame: "jaali",
    emblem: "bismillah",
    paper: ["#5a0f2a", "#3e0a1d"],
    desk: "#16040a",
    ink: "#f8e6c8",
    soft: "#e2c79a",
    accent: "#f0cf7e",
    ribbonInk: "#3e0a1d",
    foil: "#c9a24a",
    foilHi: "#fbecb4",
    envelope: "#4a0c22",
    liner: "#c9a24a",
    liner2: { pattern: "jaali", colors: ["#4a0c22", "#4a0c22"] },
    pattern: ["#c9a24a", "#fbecb4"],
    dark: true,
    groomFirst: true,
  },
  "kerala-christian-kasavu": {
    wording: "christian",
    frame: "kasavu",
    emblem: "cross",
    paper: ["#fbf5e6", "#f3e8cc"],
    desk: "#2f5a2a",
    ink: "#3d1a0c",
    soft: "#6a4a30",
    accent: "#7a5a22",
    ribbonInk: "#fff7e4",
    foil: "#b8892a",
    foilHi: "#f4d98c",
    envelope: "#f3e8cc",
    liner: "#c9962c",
    liner2: { pattern: "lace", colors: ["#fbf5e6", "#fbf5e6"] },
    groomFirst: true,
  },
  "blush-lace": {
    wording: "modern",
    frame: "lace",
    emblem: "none",
    paper: ["#fbe9ec", "#f6d9de"],
    desk: "#e9c3cb",
    ink: "#4a2a32",
    soft: "#7a5862",
    accent: "#a8485f",
    ribbonInk: "#ffffff",
    foil: "#b8964f",
    foilHi: "#f2e2ae",
    envelope: "#f6d9de",
    liner: "#ffffff",
    liner2: { pattern: "lace", colors: ["#e3b3bf", "#d8a0ae"] },
    pattern: ["#ffffff", "#ffffff"],
    seal: ["#c9a96a", "#f2e2ae"],
    groomFirst: false,
  },
  // ── Regional printed cards: Telugu, Bengali, Marathi, Kerala Muslim ──
  "telugu-subhalekha": {
    wording: "subhaLekha",
    frame: "muggu",
    emblem: "kalash",
    paper: ["#fff3c4", "#f7d97a"],
    desk: "#7a1a12",
    ink: "#4a1608",
    soft: "#6e3415",
    accent: "#c2161f",
    ribbonInk: "#fff3c4",
    foil: "#a3121c",
    foilHi: "#e2574f",
    envelope: "#b3121f",
    liner: "#f7d97a",
    liner2: { pattern: "muggu", colors: ["#c2161f", "#2e7d32"] },
    pattern: ["#c2161f", "#2e7d32"],
    seal: ["#c9962c", "#fbe7a6"],
    groomFirst: true,
  },
  "bengali-alpana": {
    wording: "bengali",
    frame: "alpana",
    emblem: "kalash",
    paper: ["#b01d23", "#8c141a"],
    desk: "#2a0507",
    ink: "#fff4e6",
    soft: "#f6d9c4",
    accent: "#fbe7a6",
    ribbonInk: "#8c141a",
    foil: "#d4a440",
    foilHi: "#fbe7a6",
    envelope: "#f7f1e6",
    liner: "#b01d23",
    liner2: { pattern: "alpana", colors: ["#ffffff", "#f6d58a"] },
    pattern: ["#ffffff", "#f6d58a"],
    seal: ["#b01d23", "#e2574f"],
    dark: true,
    groomFirst: true,
  },
  "marathi-paithani": {
    wording: "marathi",
    frame: "paithani",
    emblem: "kalash",
    paper: ["#6a1b5c", "#4a1240"],
    desk: "#1c0518",
    ink: "#fbefe0",
    soft: "#e9cfd9",
    accent: "#f2cf7a",
    ribbonInk: "#4a1240",
    foil: "#d4a440",
    foilHi: "#fbe7a6",
    envelope: "#2e6b4a",
    liner: "#e8c15a",
    liner2: { pattern: "paithani", colors: ["#4a1240", "#2e6b4a"] },
    pattern: ["#e8c15a", "#5fb07a"],
    seal: ["#c9962c", "#fbe7a6"],
    dark: true,
    groomFirst: true,
  },
  "kerala-muslim-nikah": {
    wording: "nikah",
    frame: "kasavu",
    emblem: "bismillah",
    paper: ["#fbf5e6", "#f0e6c8"],
    desk: "#0b3d28",
    ink: "#203a2c",
    soft: "#4f6458",
    accent: "#0f5a3a",
    ribbonInk: "#fbf5e6",
    foil: "#b8892a",
    foilHi: "#f4d98c",
    envelope: "#0f5a3a",
    liner: "#c9962c",
    liner2: { pattern: "jaali", colors: ["#0f5a3a", "#0f5a3a"] },
    seal: ["#c9962c", "#fbe7a6"],
    groomFirst: true,
  },
};

export function printedDesign(templateId: string): PrintedDesign {
  return PRINTED[templateId] ?? PRINTED["manjal-pathirikai"];
}

import type { CSSProperties } from "react";

/**
 * Colour roles for the royal-palace wedding layout. Every wedding template
 * shares the same layout (palace doors, toran, mandapam, arches) and only
 * swaps this palette, so each keeps its own identity — gold on granite,
 * ink on paper, peony on cream, silver on onyx, sand and sunset on sea.
 * The user's accentColor is layered on top for names and badges.
 */
export interface RoyalPalette {
  /** Darkest band colour (dark sections, door base). */
  deep: string;
  /** Slightly lighter dark (alternating dark sections, date blocks). */
  mid: string;
  /** Metallic trim. */
  gold: string;
  goldLight: string;
  goldDeep: string;
  /** Light page background and its darker tint. */
  ivory: string;
  ivory2: string;
  text: string;
  muted: string;
  /** Toran garland / petal shower colours, and its leaves. */
  flowers: [string, string, string];
  leaf: string;
  leafLight: string;
}

const PALETTES: Record<string, RoyalPalette> = {
  // ── Premium layout styles ──
  // Temple sanctum: deep maroon, temple gold, brass, jasmine, banana leaf.
  "temple-gopuram": {
    deep: "#3B0A14", mid: "#5A1020", gold: "#C9962C", goldLight: "#EBC46A", goldDeep: "#8A5E12",
    ivory: "#FFF6E6", ivory2: "#F3DDB8", text: "#3A1A10", muted: "#7A5A45",
    flowers: ["#F59E0B", "#FDE68A", "#FFFFFF"], leaf: "#2F6B2A", leafLight: "#4A8C3A",
  },
  // North Indian mandap: rani pink, saffron marigold, haldi yellow, gold.
  "mandap-marigold": {
    deep: "#5C0A2E", mid: "#7A1440", gold: "#E0A21B", goldLight: "#FFD166", goldDeep: "#A86A00",
    ivory: "#FFF5EC", ivory2: "#FBDCC8", text: "#4A1026", muted: "#8A5263",
    flowers: ["#FF7A00", "#FFC300", "#E91E63"], leaf: "#2E7D32", leafLight: "#43A047",
  },
  // Rajasthani palace: indigo royal blue, gold leaf, coral, peacock teal.
  "rajwada-palace": {
    deep: "#0E1B4D", mid: "#1A2B6B", gold: "#D4A437", goldLight: "#F2CF73", goldDeep: "#9A7419",
    ivory: "#FBF4E6", ivory2: "#EEDFC2", text: "#15204A", muted: "#5B6285",
    flowers: ["#E4572E", "#F2CF73", "#1B998B"], leaf: "#1B7A6E", leafLight: "#2A9D8F",
  },
  // Lotus pond & peacock: sage, lotus blush, peacock teal, soft gold.
  "lotus-peacock": {
    deep: "#0D3B3A", mid: "#145250", gold: "#C9A45C", goldLight: "#E8CF95", goldDeep: "#8E7133",
    ivory: "#FBF7F1", ivory2: "#EEE3DA", text: "#1F3A38", muted: "#6A7F7B",
    flowers: ["#F4A6B5", "#FCE1E6", "#0F766E"], leaf: "#5E8C61", leafLight: "#86B38A",
  },
  // Nikah: emerald, antique gold, ivory, a touch of rose.
  "nikah-emerald": {
    deep: "#062E1E", mid: "#0B4430", gold: "#C9A24A", goldLight: "#E9CF8A", goldDeep: "#8C6B22",
    ivory: "#FBF8EF", ivory2: "#E9E2CC", text: "#12281F", muted: "#5F6F66",
    flowers: ["#FFFFFF", "#E9CF8A", "#D98FA0"], leaf: "#1E6B4A", leafLight: "#2F8A62",
  },
  // Moonlit walima: midnight navy, moon silver, brass lantern gold.
  "walima-moonlit": {
    deep: "#070F24", mid: "#0E1A3A", gold: "#C9A227", goldLight: "#EBD27A", goldDeep: "#8F7016",
    ivory: "#F5F3EC", ivory2: "#E2DFD2", text: "#111A33", muted: "#5D6680",
    flowers: ["#EBD27A", "#FFFFFF", "#9FB3D9"], leaf: "#3E5C76", leafLight: "#5D7C97",
  },
  // Church: ivory stone, gold, stained-glass ruby and sapphire.
  "church-stained-glass": {
    deep: "#2A1830", mid: "#3B2342", gold: "#B8913A", goldLight: "#DDBF78", goldDeep: "#7E6120",
    ivory: "#FCFAF5", ivory2: "#EDE6D8", text: "#2A2233", muted: "#6D6475",
    flowers: ["#FFFFFF", "#F5E6C8", "#9B2335"], leaf: "#5A7D5A", leafLight: "#7FA27F",
  },
  // Christian garden: sage, olive, white roses, warm gold.
  "christian-garden": {
    deep: "#2F3E2E", mid: "#3F5240", gold: "#B9A36A", goldLight: "#DCCB97", goldDeep: "#7F6E3A",
    ivory: "#FAFAF5", ivory2: "#E8EBDD", text: "#2B3629", muted: "#6B7866",
    flowers: ["#FFFFFF", "#F3EFE2", "#C9D6B8"], leaf: "#5B7A5A", leafLight: "#8BA888",
  },
  // Luxe editorial: black, ivory paper, gold foil.
  "luxe-editorial": {
    deep: "#0A0A0A", mid: "#151515", gold: "#B08D57", goldLight: "#D8BE8C", goldDeep: "#7D6237",
    ivory: "#F7F4EE", ivory2: "#E7E1D6", text: "#111111", muted: "#6B665E",
    flowers: ["#B08D57", "#D8BE8C", "#F7F4EE"], leaf: "#6B665E", leafLight: "#8E887F",
  },
  // Watercolour botanical: peach, blush, sage, cream paper.
  "watercolor-botanical": {
    deep: "#3F4B3B", mid: "#56654F", gold: "#D08C6B", goldLight: "#F2C4AC", goldDeep: "#A0593C",
    ivory: "#FFFBF6", ivory2: "#F6E9DE", text: "#3A3A33", muted: "#7B7A70",
    flowers: ["#F2B8A0", "#F9D9C9", "#B9CFAF"], leaf: "#7E9B73", leafLight: "#A7C09C",
  },
  // Boho arch: terracotta, sand, rust, olive, dried pampas.
  "boho-arch": {
    deep: "#4A2618", mid: "#6B3620", gold: "#C98A4B", goldLight: "#EBC49A", goldDeep: "#8E5A2A",
    ivory: "#FBF4EC", ivory2: "#F0E0CE", text: "#3E2518", muted: "#8A6A57",
    flowers: ["#D98C5F", "#EBC49A", "#F6E7D5"], leaf: "#7A7A4A", leafLight: "#9C9C66",
  },
  // Velvet & gold: wine velvet, candle gold, champagne.
  "velvet-gold": {
    deep: "#2A0710", mid: "#420C1B", gold: "#D4AF37", goldLight: "#F0D98A", goldDeep: "#9A7B1C",
    ivory: "#FBF5EA", ivory2: "#EEDFC6", text: "#2A0A12", muted: "#7A5A5F",
    flowers: ["#F0D98A", "#B22A45", "#FBF5EA"], leaf: "#5A4A2A", leafLight: "#7A6A3A",
  },
  // ── Premium styles for the other occasions ──
  "engagement-sparkle": {
    deep: "#2B2118", mid: "#3A2D20", gold: "#C9A24A", goldLight: "#EAD49A", goldDeep: "#8C6B22",
    ivory: "#FFFBF2", ivory2: "#F3E6CC", text: "#2B2118", muted: "#7A6A55",
    flowers: ["#F2D7A0", "#FFFFFF", "#E8C07A"], leaf: "#8C8C5A", leafLight: "#B3B380",
  },
  "engagement-thamboolam": {
    deep: "#173A18", mid: "#22521F", gold: "#E0A526", goldLight: "#F6CD6B", goldDeep: "#A66F0A",
    ivory: "#FFF8E7", ivory2: "#F3E3BD", text: "#243018", muted: "#6B6A4F",
    flowers: ["#E8862A", "#F6CD6B", "#FFFFFF"], leaf: "#2E7D32", leafLight: "#4CAF50",
  },
  "engagement-rose-garden": {
    deep: "#4A3440", mid: "#6A4A58", gold: "#D98FA0", goldLight: "#F6D0D8", goldDeep: "#A8586C",
    ivory: "#FFF9F9", ivory2: "#F8E4E8", text: "#3D2A33", muted: "#7D6570",
    flowers: ["#F2A5B6", "#FBD3DB", "#B8CFB0"], leaf: "#7E9C76", leafLight: "#A8BFA0",
  },
  "engagement-save-the-date": {
    deep: "#0F0F0F", mid: "#1A1A1A", gold: "#C9A27C", goldLight: "#E7CFB4", goldDeep: "#8C6A4A",
    ivory: "#FBF7F3", ivory2: "#EFE6DD", text: "#111111", muted: "#6E655C",
    flowers: ["#E7CFB4", "#F4D9D9", "#FBF7F3"], leaf: "#6E655C", leafLight: "#8E857C",
  },
  "engagement-mangni": {
    deep: "#4A0A2A", mid: "#6B1240", gold: "#E0A93B", goldLight: "#F7D27A", goldDeep: "#A87512",
    ivory: "#FFF5F2", ivory2: "#F9DDD5", text: "#3E0C22", muted: "#8A5566",
    flowers: ["#FF6F91", "#F7D27A", "#2A9D8F"], leaf: "#2A7D6E", leafLight: "#3EA38F",
  },
  "anniversary-golden-jubilee": {
    deep: "#231A06", mid: "#3A2C0E", gold: "#D4AF37", goldLight: "#F2DC8A", goldDeep: "#9A7B1C",
    ivory: "#FFF9EA", ivory2: "#F2E4C0", text: "#2A2008", muted: "#7A6A45",
    flowers: ["#F2DC8A", "#FFFFFF", "#D4AF37"], leaf: "#6B5A2A", leafLight: "#8C7A45",
  },
  "anniversary-vintage-reel": {
    deep: "#3B2A1E", mid: "#5A4030", gold: "#B08650", goldLight: "#E3C9A0", goldDeep: "#7A5A30",
    ivory: "#FBF3E6", ivory2: "#EADBC2", text: "#3B2A1E", muted: "#7F6A55",
    flowers: ["#D9A58A", "#F3E2C8", "#9CB08A"], leaf: "#7C8A5A", leafLight: "#A0AE7A",
  },
  "anniversary-wine-roses": {
    deep: "#3A0712", mid: "#5A0E1E", gold: "#D6A15C", goldLight: "#F2CD96", goldDeep: "#9A6A2A",
    ivory: "#FFF6F4", ivory2: "#F6DCD8", text: "#3A0A14", muted: "#85555E",
    flowers: ["#C8243F", "#F28CA0", "#FFFFFF"], leaf: "#3F6B3A", leafLight: "#5E8C55",
  },
  "anniversary-silver-jubilee": {
    deep: "#1C2230", mid: "#2A3242", gold: "#9AA3B5", goldLight: "#D9DEE8", goldDeep: "#5E6678",
    ivory: "#F8F9FB", ivory2: "#E6E9F0", text: "#1C2230", muted: "#6A7284",
    flowers: ["#D9DEE8", "#FFFFFF", "#B8C0CF"], leaf: "#6A7284", leafLight: "#9AA3B5",
  },
  "anniversary-shashtiabdapoorthi": {
    deep: "#0E2A17", mid: "#16391F", gold: "#D4A437", goldLight: "#F2CF73", goldDeep: "#9A7419",
    ivory: "#FFF8E8", ivory2: "#F1E2BE", text: "#1C2A16", muted: "#66735A",
    flowers: ["#F59E0B", "#FDE68A", "#FFFFFF"], leaf: "#2F6B2A", leafLight: "#4A8C3A",
  },
  "valentine-love-letter": {
    deep: "#5A0F1C", mid: "#7A1628", gold: "#C8102E", goldLight: "#F4B6C0", goldDeep: "#8A0B20",
    ivory: "#FFFBF5", ivory2: "#F4E8D8", text: "#3A1A1E", muted: "#85656A",
    flowers: ["#C8102E", "#F4B6C0", "#1F4E8C"], leaf: "#6A7F5A", leafLight: "#8FA27A",
  },
  "valentine-neon-hearts": {
    deep: "#0D0718", mid: "#1C0F33", gold: "#FF3D8B", goldLight: "#FF9CC7", goldDeep: "#C2185B",
    ivory: "#FFF5FA", ivory2: "#F5DDEA", text: "#2A0F24", muted: "#7A5A70",
    flowers: ["#FF3D8B", "#FFD1E6", "#7C4DFF"], leaf: "#7C4DFF", leafLight: "#B39DFF",
  },
  "valentine-cupid-clouds": {
    deep: "#4A3050", mid: "#6A4A70", gold: "#E79AB8", goldLight: "#FFD6E6", goldDeep: "#B85A80",
    ivory: "#FFF8FC", ivory2: "#FCE1EE", text: "#4A2E48", muted: "#86688A",
    flowers: ["#FF8FB8", "#FFD6E6", "#9CD3F5"], leaf: "#9CD3F5", leafLight: "#C8E8FB",
  },
  "valentine-polaroid": {
    deep: "#3A2020", mid: "#5A3030", gold: "#E4572E", goldLight: "#F9C5B5", goldDeep: "#A8381A",
    ivory: "#FFF7F0", ivory2: "#F6E1D2", text: "#3A2020", muted: "#85655E",
    flowers: ["#FF6B6B", "#FFD1C2", "#FFB86B"], leaf: "#6A8F6A", leafLight: "#8FB08F",
  },
  "valentine-red-roses": {
    deep: "#4A0716", mid: "#6E0B22", gold: "#F2A0B0", goldLight: "#FFD1DA", goldDeep: "#B0304C",
    ivory: "#FFF7F8", ivory2: "#F9DDE2", text: "#3E0A16", muted: "#86555F",
    flowers: ["#D1123F", "#FF7A97", "#FFFFFF"], leaf: "#2F6B3A", leafLight: "#4E8C55",
  },
  "proposal-starry-night": {
    deep: "#0E0A24", mid: "#1C1540", gold: "#C9A6FF", goldLight: "#E8D8FF", goldDeep: "#8E6BD1",
    ivory: "#F7F4FF", ivory2: "#E4DCF7", text: "#1A1433", muted: "#6A6285",
    flowers: ["#E8D8FF", "#FFFFFF", "#FFD66B"], leaf: "#4E4A7A", leafLight: "#6E6AA0",
  },
  "proposal-candlelight": {
    deep: "#22060C", mid: "#3A0B17", gold: "#E8B04A", goldLight: "#F7D796", goldDeep: "#A8761A",
    ivory: "#FFF7EC", ivory2: "#F3E0C6", text: "#2A0A10", muted: "#7A5A58",
    flowers: ["#F7D796", "#C8243F", "#FFFFFF"], leaf: "#5A4A2A", leafLight: "#7A6A3A",
  },
  "proposal-will-you": {
    deep: "#13294B", mid: "#1F3A66", gold: "#1F4E8C", goldLight: "#BFD4F2", goldDeep: "#13325C",
    ivory: "#FBFCFF", ivory2: "#E6EDF8", text: "#13294B", muted: "#5E6E88",
    flowers: ["#E4577A", "#BFD4F2", "#1F4E8C"], leaf: "#6A8F7A", leafLight: "#8FB09A",
  },
  "proposal-beach-sunset": {
    deep: "#3E2233", mid: "#5A3048", gold: "#F4A261", goldLight: "#FFD6A5", goldDeep: "#C2703D",
    ivory: "#FFF7F0", ivory2: "#FBE3D2", text: "#3E2233", muted: "#86657A",
    flowers: ["#E76F51", "#FFD6A5", "#8ECAE6"], leaf: "#6A9C8A", leafLight: "#8FC0AE",
  },
  "proposal-rose-gold-ring": {
    deep: "#3A2226", mid: "#5A3439", gold: "#C98B8F", goldLight: "#F0CFD0", goldDeep: "#955558",
    ivory: "#FFF8F6", ivory2: "#F6E1DE", text: "#3A2226", muted: "#85686A",
    flowers: ["#F0CFD0", "#FFFFFF", "#E8B4B8"], leaf: "#9A8A7A", leafLight: "#BAAA9A",
  },
  "birthday-balloon-party": {
    deep: "#2A2140", mid: "#3A2F5A", gold: "#FFB703", goldLight: "#FFE08A", goldDeep: "#C98A00",
    ivory: "#FFFDF7", ivory2: "#FFF1D6", text: "#2A2140", muted: "#7A7090",
    flowers: ["#FF6B6B", "#4CC9F0", "#8AC926"], leaf: "#8AC926", leafLight: "#B5E36A",
  },
  "birthday-neon-night": {
    deep: "#07081A", mid: "#121536", gold: "#00E5FF", goldLight: "#8AF4FF", goldDeep: "#00A3B8",
    ivory: "#F4FDFF", ivory2: "#DDF5FA", text: "#0E1030", muted: "#5E6A85",
    flowers: ["#FF3DCA", "#8AF4FF", "#FFE14D"], leaf: "#7C4DFF", leafLight: "#B39DFF",
  },
  "birthday-kids-fiesta": {
    deep: "#1D2B53", mid: "#2A3B70", gold: "#FFBE0B", goldLight: "#FFE066", goldDeep: "#D49A00",
    ivory: "#FFFDF5", ivory2: "#FFF3C4", text: "#1D2B53", muted: "#5E6A8A",
    flowers: ["#FF006E", "#3A86FF", "#8338EC"], leaf: "#06D6A0", leafLight: "#7EF0CF",
  },
  "birthday-golden-milestone": {
    deep: "#0F0D0A", mid: "#1E1A14", gold: "#C9A24A", goldLight: "#EAD49A", goldDeep: "#8C6B22",
    ivory: "#FBF7EE", ivory2: "#EFE4CC", text: "#15120D", muted: "#6E6450",
    flowers: ["#EAD49A", "#FFFFFF", "#C9A24A"], leaf: "#6E6450", leafLight: "#8E8470",
  },
  "birthday-cake-candles": {
    deep: "#3A2344", mid: "#52305E", gold: "#F15BB5", goldLight: "#FFC6E8", goldDeep: "#B8307E",
    ivory: "#FFF9FC", ivory2: "#FDE2F1", text: "#3A2344", muted: "#85678E",
    flowers: ["#F15BB5", "#FEE440", "#00BBF9"], leaf: "#9B5DE5", leafLight: "#C4A0F2",
  },
  "housewarming-griha-pravesam": {
    deep: "#4A1A0C", mid: "#6A2812", gold: "#E0A526", goldLight: "#F6CD6B", goldDeep: "#A66F0A",
    ivory: "#FFF7EA", ivory2: "#F4E0C0", text: "#3A1A0C", muted: "#7A5A45",
    flowers: ["#E8862A", "#F6CD6B", "#C8102E"], leaf: "#2E7D32", leafLight: "#4CAF50",
  },
  "housewarming-new-keys": {
    deep: "#1E2D2B", mid: "#2A3E3B", gold: "#2A9D8F", goldLight: "#A8DCD4", goldDeep: "#1D6F65",
    ivory: "#FAFAF7", ivory2: "#EDEDE6", text: "#1E2D2B", muted: "#66706D",
    flowers: ["#E9C46A", "#F4A261", "#2A9D8F"], leaf: "#2A9D8F", leafLight: "#6CC3B6",
  },
  "housewarming-boho-nest": {
    deep: "#3E2A1E", mid: "#5A3C2A", gold: "#C98A4B", goldLight: "#EBC49A", goldDeep: "#8E5A2A",
    ivory: "#FBF6EE", ivory2: "#EEE3D0", text: "#3E2A1E", muted: "#86705E",
    flowers: ["#D98C5F", "#A7B98A", "#F6E7D5"], leaf: "#7A8A5A", leafLight: "#A7B98A",
  },
  "housewarming-green-home": {
    deep: "#1F3A24", mid: "#2B4F31", gold: "#7FB069", goldLight: "#CFE8C0", goldDeep: "#4A7A3A",
    ivory: "#FAFDF7", ivory2: "#E6F0DD", text: "#1F3A24", muted: "#667A60",
    flowers: ["#FFFFFF", "#E6F0DD", "#F4D35E"], leaf: "#3A7D44", leafLight: "#7FB069",
  },
  "housewarming-vastu-lamp": {
    deep: "#3A1A08", mid: "#5A2A0E", gold: "#E0A526", goldLight: "#F6CD6B", goldDeep: "#A66F0A",
    ivory: "#FFF7EA", ivory2: "#F4E0C0", text: "#3A1A08", muted: "#7A5A45",
    flowers: ["#F59E0B", "#FDE68A", "#FFFFFF"], leaf: "#2F6B2A", leafLight: "#4A8C3A",
  },
  "baby-twinkle-star": {
    deep: "#2E3A5F", mid: "#3E4C78", gold: "#F7D06B", goldLight: "#FFE9A8", goldDeep: "#C9A227",
    ivory: "#F7FAFF", ivory2: "#DDE7FA", text: "#2E3A5F", muted: "#6E7894",
    flowers: ["#F2B5D4", "#FFE9A8", "#A9D6F5"], leaf: "#A9D6F5", leafLight: "#CDE7FA",
  },
  "baby-valaikaappu": {
    deep: "#4A0A2A", mid: "#6B1240", gold: "#E0A21B", goldLight: "#FFD166", goldDeep: "#A86A00",
    ivory: "#FFF5F0", ivory2: "#FADCD0", text: "#3E0C22", muted: "#8A5566",
    flowers: ["#E91E63", "#FFC300", "#2E7D32"], leaf: "#2E7D32", leafLight: "#43A047",
  },
  "baby-teddy-hug": {
    deep: "#3B3A5A", mid: "#4E4C74", gold: "#E9B872", goldLight: "#F7DDB2", goldDeep: "#B8863A",
    ivory: "#FFFCF7", ivory2: "#F2EAF6", text: "#3B3A5A", muted: "#7A7890",
    flowers: ["#F4A9A8", "#A7C7E7", "#F7DDB2"], leaf: "#A7C7E7", leafLight: "#CFE0F2",
  },
  "baby-naming-lotus": {
    deep: "#2E4A48", mid: "#3E6260", gold: "#D9B26A", goldLight: "#F1DDB0", goldDeep: "#9E7A36",
    ivory: "#FFFAF6", ivory2: "#F4E6E0", text: "#2E4A48", muted: "#6E827E",
    flowers: ["#F4A6B5", "#FCE1E6", "#8FC9C0"], leaf: "#6A9C8A", leafLight: "#8FC0AE",
  },
  "baby-shower-balloons": {
    deep: "#2E3B55", mid: "#3E4E6E", gold: "#F6C177", goldLight: "#FFE3B3", goldDeep: "#C98F3A",
    ivory: "#FFFDFA", ivory2: "#F3F0FA", text: "#2E3B55", muted: "#72809A",
    flowers: ["#F7B2C4", "#A0D8EF", "#FFE3B3"], leaf: "#A0D8EF", leafLight: "#C8EAF6",
  },
  "corporate-gala-night": {
    deep: "#0A1224", mid: "#142038", gold: "#D4AF37", goldLight: "#F0D98A", goldDeep: "#9A7B1C",
    ivory: "#FAF7EE", ivory2: "#EDE5D0", text: "#0F1830", muted: "#5E6680",
    flowers: ["#F0D98A", "#FFFFFF", "#8FA3C8"], leaf: "#3E4E6E", leafLight: "#5E6E8E",
  },
  "corporate-tech-launch": {
    deep: "#070B1A", mid: "#10173A", gold: "#6C63FF", goldLight: "#B4AEFF", goldDeep: "#4038B8",
    ivory: "#F6F7FC", ivory2: "#E2E6F5", text: "#0F1633", muted: "#5E6685",
    flowers: ["#22D3EE", "#6C63FF", "#F472B6"], leaf: "#22D3EE", leafLight: "#7EE7F7",
  },
  "corporate-conference": {
    deep: "#0B1B3A", mid: "#13284F", gold: "#1D4ED8", goldLight: "#BFD1FA", goldDeep: "#153A9E",
    ivory: "#F8FAFF", ivory2: "#E4EAF7", text: "#0B1B3A", muted: "#5E6A85",
    flowers: ["#BFD1FA", "#1D4ED8", "#F8FAFF"], leaf: "#5E6A85", leafLight: "#8E9AB5",
  },
  "corporate-awards-night": {
    deep: "#0E0C08", mid: "#1C1810", gold: "#C9A24A", goldLight: "#EAD49A", goldDeep: "#8C6B22",
    ivory: "#FBF7EE", ivory2: "#EFE4CC", text: "#15120D", muted: "#6E6450",
    flowers: ["#EAD49A", "#FFFFFF", "#C9A24A"], leaf: "#6E6450", leafLight: "#8E8470",
  },
  "corporate-offsite": {
    deep: "#1F3A2E", mid: "#2B4F3E", gold: "#D69E2E", goldLight: "#F6D48A", goldDeep: "#9C6E1A",
    ivory: "#FAFCF7", ivory2: "#E6EFE3", text: "#1F3A2E", muted: "#667A6E",
    flowers: ["#68D391", "#F6D48A", "#90CDF4"], leaf: "#2F855A", leafLight: "#68D391",
  },
  // ── Classic royal-palace layout ──
  // Temple courtyard: granite, temple gold, brass, jasmine, banana leaf.
  "traditional-gold": {
    deep: "#1E1A17",
    mid: "#2B2420",
    gold: "#C8962E",
    goldLight: "#E3B45A",
    goldDeep: "#8C6420",
    ivory: "#FFF8EC",
    ivory2: "#F1E4C8",
    text: "#2B2418",
    muted: "#6E6250",
    flowers: ["#e8862a", "#f6c24a", "#FFF8EC"],
    leaf: "#3E6B2F",
    leafLight: "#4F8A3C",
  },
  // Swiss/architect: paper, ink, graphite; the couple's accent is the only colour.
  "minimal-modern": {
    deep: "#111111",
    mid: "#1F1F1F",
    gold: "#6B6B6B",
    goldLight: "#D9D9D4",
    goldDeep: "#111111",
    ivory: "#FAFAF7",
    ivory2: "#ECECE7",
    text: "#111111",
    muted: "#6B6B6B",
    flowers: ["#111111", "#6B6B6B", "#D9D9D4"],
    leaf: "#6B6B6B",
    leafLight: "#8A8A8A",
  },
  // Spring garden: blush, peony, sage, butter, lavender on cream.
  "floral-pastel": {
    deep: "#5E4550",
    mid: "#7A5A66",
    gold: "#E79AA8",
    goldLight: "#F6D6D6",
    goldDeep: "#B96A7C",
    ivory: "#FFFBF5",
    ivory2: "#F6E6E2",
    text: "#4A3B3F",
    muted: "#7D6A6E",
    flowers: ["#E79AA8", "#F6D6D6", "#F7E7B4"],
    leaf: "#7E9C76",
    leafLight: "#A8BFA0",
  },
  // Black tie: onyx, charcoal, silver foil, ivory — monochrome only.
  "elegant-bw": {
    deep: "#0B0B0C",
    mid: "#1C1C1F",
    gold: "#C9CCD1",
    goldLight: "#F2F3F5",
    goldDeep: "#8A8C91",
    ivory: "#F5F2EA",
    ivory2: "#E6E2D8",
    text: "#141414",
    muted: "#5E6064",
    flowers: ["#F2F3F5", "#C9CCD1", "#FFFFFF"],
    leaf: "#3D3D3D",
    leafLight: "#555555",
  },
  // Beach at golden hour: sand, driftwood, turquoise, coral, sunset gold.
  "beach-boho": {
    deep: "#1D6E7A",
    mid: "#25838F",
    gold: "#F2B45A",
    goldLight: "#FBDDA6",
    goldDeep: "#9C7C5B",
    ivory: "#FFF9F0",
    ivory2: "#EAD7B7",
    text: "#33271B",
    muted: "#75644F",
    flowers: ["#E9806E", "#F2B45A", "#FFF9F0"],
    leaf: "#2F6B5A",
    leafLight: "#3FB8AF",
  },
  // Stage curtains: maroon silk, antique gold fringe, warm footlights.
  "silk-curtain": {
    deep: "#3B0A12",
    mid: "#551422",
    gold: "#C9A54A",
    goldLight: "#EBD08A",
    goldDeep: "#8C6A22",
    ivory: "#FFF6EA",
    ivory2: "#F2DFC4",
    text: "#2E1A12",
    muted: "#6E5546",
    flowers: ["#B3122E", "#EBD08A", "#FFF6EA"],
    leaf: "#2F5D3A",
    leafLight: "#467E50",
  },
  // Grand reception: plum velvet stage, marquee gold, a hint of rose.
  "grand-reception": {
    deep: "#1C0B1E",
    mid: "#2E1230",
    gold: "#E8A33D",
    goldLight: "#FFD66B",
    goldDeep: "#9A6418",
    ivory: "#FFF6EC",
    ivory2: "#F3DFD0",
    text: "#2A1424",
    muted: "#6E5360",
    flowers: ["#FF6B8B", "#FFD66B", "#FFF6EC"],
    leaf: "#2F5D3A",
    leafLight: "#467E50",
  },
  // Keepsake card: lilac, rose-gold foil, soft lavender.
  "scratch-reveal": {
    deep: "#3E3358",
    mid: "#524574",
    gold: "#D8A7B1",
    goldLight: "#F3D9DE",
    goldDeep: "#A56C7C",
    ivory: "#FBF8FF",
    ivory2: "#ECE6F7",
    text: "#2F2940",
    muted: "#6E6784",
    flowers: ["#C9B6E4", "#F3D9DE", "#FBF8FF"],
    leaf: "#7C8F7A",
    leafLight: "#A2B39F",
  },
  // Karthigai Deepam night: midnight blue, saffron flame, lamp glow.
  "lantern-night": {
    deep: "#0E1733",
    mid: "#17234A",
    gold: "#F2A33A",
    goldLight: "#FFD48A",
    goldDeep: "#B86A12",
    ivory: "#FFF8EE",
    ivory2: "#F4E3C6",
    text: "#231A10",
    muted: "#6B5A44",
    flowers: ["#FF9933", "#FFD48A", "#FFF8EE"],
    leaf: "#2E5E3E",
    leafLight: "#3F7F52",
  },
  // Tamil doorway: mango-leaf thoranam, malli (jasmine), marigold, banana leaf.
  "thoranam-jasmine": {
    deep: "#1F3B24",
    mid: "#2A4D30",
    gold: "#E0A526",
    goldLight: "#F6CD6B",
    goldDeep: "#A8741A",
    ivory: "#FFFDF4",
    ivory2: "#F1EAD2",
    text: "#23301E",
    muted: "#5F6B52",
    flowers: ["#FFFFFF", "#F6CD6B", "#E8862A"],
    leaf: "#3E7A2F",
    leafLight: "#5FA043",
  },
  // Kerala: kasavu cream and gold zari, brass nilavilakku, sandalwood.
  "kerala-kasavu": {
    deep: "#3A2A12",
    mid: "#4E3918",
    gold: "#D4AF37",
    goldLight: "#EED98C",
    goldDeep: "#9C7A1E",
    ivory: "#FFFBEF",
    ivory2: "#F5ECD2",
    text: "#2E2415",
    muted: "#6D6049",
    flowers: ["#FFFFFF", "#EED98C", "#E8862A"],
    leaf: "#2F6B3A",
    leafLight: "#46924F",
  },
  // Onam pookalam: marigold, chethi red, thumba white, leaf green.
  pookalam: {
    deep: "#5A1414",
    mid: "#741C1C",
    gold: "#F2A900",
    goldLight: "#FFD35C",
    goldDeep: "#B87700",
    ivory: "#FFF9EC",
    ivory2: "#F7E6C4",
    text: "#2F1B10",
    muted: "#6F5543",
    flowers: ["#E8862A", "#FFD35C", "#C8102E"],
    leaf: "#2E7D32",
    leafLight: "#4CAF50",
  },
};

export function getRoyalPalette(templateId: string): RoyalPalette {
  return PALETTES[templateId] ?? PALETTES["traditional-gold"];
}

/** The palette + accent as CSS custom properties, consumed by royal.module.css. */
export function royalCssVars(p: RoyalPalette, accentColor: string): CSSProperties {
  return {
    "--rp-deep": p.deep,
    "--rp-mid": p.mid,
    "--rp-gold": p.gold,
    "--rp-gold-light": p.goldLight,
    "--rp-gold-deep": p.goldDeep,
    "--rp-ivory": p.ivory,
    "--rp-ivory-2": p.ivory2,
    "--rp-text": p.text,
    "--rp-muted": p.muted,
    "--rp-accent": accentColor,
  } as CSSProperties;
}

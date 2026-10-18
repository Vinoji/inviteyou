import type { FestivalTheme } from "@/lib/festivals";

export type OfferTheme = FestivalTheme | "launch";

/** Each offer's colours: the card's background, its text, the accent for
 * prices and the button, and the slim top bar's gradient and ink. */
export interface OfferLook {
  card: string;
  ink: string;
  soft: string;
  accent: string;
  button: string;
  buttonInk: string;
  bar: string;
  barInk: string;
  /** One symbol for the slim bar. */
  icon: string;
  /** A light card (dark text): countdown boxes and tiles go light too. */
  light?: boolean;
  /** The festival's photo (public/art/festivals) and the dark tint laid
   * over it so white text reads; none for the launch offer (drawn art). */
  photo?: string;
  tint: string;
  /** Price and highlight colour on the photo. */
  gold: string;
}

export const OFFER_LOOKS: Record<OfferTheme, OfferLook> = {
  launch: {
    card: "radial-gradient(120% 90% at 50% 0%, #6b2047 0%, #3d1236 45%, #22091f 100%)",
    ink: "#fff6e6", soft: "#ffe9b8", accent: "#ffd35c",
    button: "linear-gradient(135deg,#ffe08a,#f2c45a,#c98f3a)", buttonInk: "#2a0c27",
    bar: "linear-gradient(90deg,#c98f3a,#ffe08a,#c98f3a)", barInk: "#2a0c27", icon: "🔥", tint: "#22091f", gold: "#ffd35c",
  },
  diwali: {
    card: "radial-gradient(120% 90% at 50% 0%, #7a1d1d 0%, #4a0f24 50%, #1e0716 100%)",
    ink: "#fff3dc", soft: "#ffd9a0", accent: "#ffc94a",
    button: "linear-gradient(135deg,#ffd76a,#f5a623,#d9731a)", buttonInk: "#2a0a0a",
    bar: "linear-gradient(90deg,#f5a623,#7a1d1d 22%,#7a1d1d 78%,#f5a623)", barInk: "#fff8e6", icon: "🪔", photo: "/art/festivals/diwali.webp", tint: "#3a0a14", gold: "#ffc94a",
  },
  karthigai: {
    card: "radial-gradient(120% 90% at 50% 10%, #3a2a5e 0%, #1c1538 55%, #0c0a1c 100%)",
    ink: "#fff3dc", soft: "#f7d9a8", accent: "#ffb547",
    button: "linear-gradient(135deg,#ffd27a,#ff9f2e,#e0701a)", buttonInk: "#1c1538",
    bar: "linear-gradient(90deg,#ff9f2e,#2c2152 22%,#2c2152 78%,#ff9f2e)", barInk: "#fff3dc", icon: "🪔", photo: "/art/festivals/karthigai.webp", tint: "#1a0f05", gold: "#ffb547",
  },
  christmas: {
    card: "radial-gradient(120% 90% at 50% 0%, #1f5a3a 0%, #0f3524 55%, #08180f 100%)",
    ink: "#f6fff8", soft: "#d8f2df", accent: "#ffd35c",
    button: "linear-gradient(135deg,#ff6b6b,#d62839,#a4161a)", buttonInk: "#fff",
    bar: "linear-gradient(90deg,#1f5a3a,#a4161a 22%,#a4161a 78%,#1f5a3a)", barInk: "#fff", icon: "🎄", photo: "/art/festivals/christmas.webp", tint: "#08180f", gold: "#ffd35c",
  },
  pongal: {
    card: "radial-gradient(120% 90% at 50% 0%, #fff1b8 0%, #ffd166 45%, #e08a1e 100%)",
    ink: "#3a1d00", soft: "#5c3300", accent: "#1f7a3a",
    button: "linear-gradient(135deg,#2e9e4f,#1f7a3a,#145a2a)", buttonInk: "#fff",
    bar: "linear-gradient(90deg,#1f7a3a,#ffd166 22%,#ffd166 78%,#1f7a3a)", barInk: "#2a1400", icon: "🌾", light: true, photo: "/art/festivals/pongal.webp", tint: "#2a1500", gold: "#ffd166",
  },
  republic: {
    card: "linear-gradient(180deg, #ff9933 0%, #ffb366 28%, #ffffff 42%, #ffffff 58%, #4caf50 72%, #138808 100%)",
    ink: "#0b1d4d", soft: "#1a2f6b", accent: "#000080",
    button: "linear-gradient(135deg,#1a3a9e,#000080)", buttonInk: "#fff",
    bar: "linear-gradient(90deg,#ff9933,#ffffff,#138808)", barInk: "#000080", icon: "🇮🇳", light: true, photo: "/art/festivals/republic.webp", tint: "#0b1d4d", gold: "#ffb366",
  },
  valentine: {
    card: "radial-gradient(120% 90% at 50% 0%, #ff8fab 0%, #e63968 50%, #8a0f3b 100%)",
    ink: "#fff5f8", soft: "#ffe0ea", accent: "#fff0a8",
    button: "linear-gradient(135deg,#ffffff,#ffe0ea)", buttonInk: "#8a0f3b",
    bar: "linear-gradient(90deg,#ff8fab,#c2185b 22%,#c2185b 78%,#ff8fab)", barInk: "#fff", icon: "💖", photo: "/art/festivals/valentine.webp", tint: "#4a0620", gold: "#ffd1dc",
  },
  shivaratri: {
    card: "radial-gradient(120% 90% at 50% 0%, #2c3e77 0%, #141c3d 55%, #070a18 100%)",
    ink: "#eef3ff", soft: "#c9d6ff", accent: "#9fd3ff",
    button: "linear-gradient(135deg,#c9e6ff,#7fb8ff,#4a7fd6)", buttonInk: "#0a1430",
    bar: "linear-gradient(90deg,#7fb8ff,#141c3d 22%,#141c3d 78%,#7fb8ff)", barInk: "#eef3ff", icon: "🕉️", photo: "/art/festivals/shivaratri.webp", tint: "#0a0d1c", gold: "#ffb547",
  },
  eid: {
    card: "radial-gradient(120% 90% at 50% 0%, #1b6b55 0%, #0d3d31 55%, #06201a 100%)",
    ink: "#f4fff9", soft: "#d6f5e8", accent: "#f5d27a",
    button: "linear-gradient(135deg,#f9e29c,#e8b04a,#b8862b)", buttonInk: "#06201a",
    bar: "linear-gradient(90deg,#e8b04a,#0d3d31 22%,#0d3d31 78%,#e8b04a)", barInk: "#fffbea", icon: "🌙", photo: "/art/festivals/eid.webp", tint: "#06201a", gold: "#f5d27a",
  },
  holi: {
    card: "radial-gradient(90% 70% at 15% 20%, #ff4fa3 0%, transparent 60%), radial-gradient(90% 70% at 85% 25%, #ffd23f 0%, transparent 60%), radial-gradient(90% 80% at 30% 90%, #3bceac 0%, transparent 60%), radial-gradient(90% 80% at 85% 85%, #7b5cff 0%, transparent 60%), #ffffff",
    ink: "#2a0d3d", soft: "#3e1a57", accent: "#c2185b",
    button: "linear-gradient(135deg,#ff4fa3,#7b5cff)", buttonInk: "#fff",
    bar: "linear-gradient(90deg,#ff9ccc,#ffe680 30%,#9be8d4 70%,#c3b3ff)", barInk: "#1a0526", icon: "🎨", light: true, photo: "/art/festivals/holi.webp", tint: "#2a0d3d", gold: "#ffe066",
  },
  ugadi: {
    card: "radial-gradient(120% 90% at 50% 0%, #c8f08f 0%, #6fbf3b 50%, #2f6b1a 100%)",
    ink: "#13300a", soft: "#1f4a12", accent: "#8a1c1c",
    button: "linear-gradient(135deg,#ffd166,#f5a623)", buttonInk: "#2a1400",
    bar: "linear-gradient(90deg,#2f6b1a,#c8f08f 22%,#c8f08f 78%,#2f6b1a)", barInk: "#102808", icon: "🌿", light: true, photo: "/art/festivals/ugadi.webp", tint: "#0f2808", gold: "#ffd166",
  },
  puthandu: {
    card: "radial-gradient(120% 90% at 50% 0%, #a3123a 0%, #6b0a26 55%, #2e0412 100%)",
    ink: "#fff4e0", soft: "#ffdcb0", accent: "#ffcc4d",
    button: "linear-gradient(135deg,#ffe08a,#f2c45a,#c98f3a)", buttonInk: "#2e0412",
    bar: "linear-gradient(90deg,#c98f3a,#6b0a26 22%,#6b0a26 78%,#c98f3a)", barInk: "#fff8ea", icon: "🌼", photo: "/art/festivals/puthandu.webp", tint: "#2e0412", gold: "#ffcc4d",
  },
  akshaya: {
    card: "radial-gradient(120% 90% at 50% 0%, #fff4c2 0%, #f2c45a 45%, #9a6a14 100%)",
    ink: "#2e1c00", soft: "#4a2f00", accent: "#8a1c1c",
    button: "linear-gradient(135deg,#8a1c1c,#5c0f0f)", buttonInk: "#fff4c2",
    bar: "linear-gradient(90deg,#9a6a14,#ffe08a,#fff4c2,#ffe08a,#9a6a14)", barInk: "#2e1c00", icon: "🪙", light: true, photo: "/art/festivals/akshaya.webp", tint: "#2e1c00", gold: "#ffd700",
  },
};

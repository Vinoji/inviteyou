/**
 * Recolouring a design to the colour a couple picks. Each of the design's
 * colours keeps its lightness (and so its role — dark band, light paper,
 * metallic trim, muted text) and moves into the chosen hue, so the whole
 * invitation changes colour and still reads the way it was designed.
 */

type Hsl = { h: number; s: number; l: number };

function hexToHsl(hex: string): Hsl | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const v = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function hslToHex({ h, s, l }: Hsl): string {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const hex = (x: number) =>
    Math.round(Math.max(0, Math.min(1, x)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`;
}

const clamp = (x: number) => Math.max(0, Math.min(1, x));
/** Below this saturation a colour reads as neutral (black, white, ivory, grey). */
const NEUTRAL = 0.12;

/** Whether `picked` differs from the design's own colour enough to recolour it. */
export function isRecolor(designColor: string, picked: string | undefined): picked is string {
  return Boolean(picked) && picked!.toLowerCase() !== designColor.toLowerCase() && hexToHsl(picked!) !== null;
}

/**
 * One design colour moved from the design's accent `from` to the picked
 * accent `to`. Non-colours (anything not a hex) pass through unchanged.
 */
export function recolor(color: string, from: string, to: string): string {
  const c = hexToHsl(color);
  const a = hexToHsl(from);
  const b = hexToHsl(to);
  if (!c || !a || !b) return color;

  // Picked black, white or grey: a monochrome version of the design.
  if (b.s < NEUTRAL) return hslToHex({ h: c.h, s: c.s * 0.06, l: c.l });

  // A neutral design (black & ivory): tint its mid-tones with the new colour,
  // leaving near-black and near-white as they are.
  if (a.s < NEUTRAL) {
    const tint = b.s * 0.55 * clamp(1 - Math.abs(c.l - 0.5) * 1.7);
    return hslToHex({ h: b.h, s: Math.max(c.s, tint), l: c.l });
  }

  // A coloured design: rotate every colour by the hue shift between the two
  // accents; neutrals (paper, ink) only pick up a trace of it.
  const h = (c.h + (b.h - a.h) + 360) % 360;
  const s = c.s < NEUTRAL ? c.s : clamp(c.s + (b.s - a.s) * 0.5);
  return hslToHex({ h, s, l: c.l });
}

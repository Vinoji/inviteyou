/**
 * Procedural pulli/sikku kolam on a 7×7 dot grid, computed once at module
 * load (deterministic, so server and client render identical SVG).
 *
 * Two strands weave around the ring of 24 perimeter dots: each strand is
 * the square's outline offset by ±A·cos(π·s/G), so at every dot one strand
 * passes outside and the other inside, and they cross midway between dots —
 * the interlaced loop-around-each-dot look of a sikku kolam. The interior
 * is left open so the couple's names can sit in the centre. Petal loops at
 * the four corners finish it.
 */

const N = 7;
export const G = 40; // dot spacing
export const L = G * (N - 1); // side of the dot square
const A = G * 0.42; // weave amplitude
const STEP = G / 6; // sampling step along the perimeter

type Pt = { x: number; y: number };

const SIDE_NORMALS: Pt[] = [
  { x: 0, y: -1 }, // top, left → right
  { x: 1, y: 0 }, // right, top → bottom
  { x: 0, y: 1 }, // bottom, right → left
  { x: -1, y: 0 }, // left, bottom → top
];

function boundary(s: number): { p: Pt; n: Pt } {
  const per = 4 * L;
  const ss = ((s % per) + per) % per;
  const side = Math.floor(ss / L);
  const t = ss - side * L;
  const p =
    side === 0
      ? { x: t, y: 0 }
      : side === 1
        ? { x: L, y: t }
        : side === 2
          ? { x: L - t, y: L }
          : { x: 0, y: L - t };
  // Blend toward the neighbouring side's normal near corners, reaching the
  // diagonal exactly at the corner, so the weave turns smoothly.
  let n = SIDE_NORMALS[side];
  const d = Math.min(t, L - t);
  if (d < G / 2) {
    const adj = SIDE_NORMALS[(side + (t < L / 2 ? 3 : 1)) % 4];
    const w = 0.5 * (1 - d / (G / 2));
    const nx = (1 - w) * n.x + w * adj.x;
    const ny = (1 - w) * n.y + w * adj.y;
    const len = Math.hypot(nx, ny);
    n = { x: nx / len, y: ny / len };
  }
  return { p, n };
}

/** Closed Catmull-Rom spline through points, as cubic Béziers. */
function smoothClosed(pts: Pt[]): string {
  const f = (v: number) => v.toFixed(2);
  const n = pts.length;
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += `C${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)} ${f(p2.x - (p3.x - p1.x) / 6)} ${f(p2.y - (p3.y - p1.y) / 6)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d + "Z";
}

function strand(sign: 1 | -1): string {
  const pts: Pt[] = [];
  for (let s = 0; s < 4 * L; s += STEP) {
    const { p, n } = boundary(s);
    const off = sign * A * Math.cos((Math.PI * s) / G);
    pts.push({ x: p.x + n.x * off, y: p.y + n.y * off });
  }
  return smoothClosed(pts);
}

function cornerPetals(): string {
  const corners: [Pt, Pt][] = [
    [
      { x: 0, y: 0 },
      { x: -1, y: -1 },
    ],
    [
      { x: L, y: 0 },
      { x: 1, y: -1 },
    ],
    [
      { x: L, y: L },
      { x: 1, y: 1 },
    ],
    [
      { x: 0, y: L },
      { x: -1, y: 1 },
    ],
  ];
  const k = Math.SQRT1_2;
  return corners
    .map(([c, d]) => {
      const dx = d.x * k;
      const dy = d.y * k;
      // Teardrop: from just outside the corner loop, out along the
      // diagonal and back, bulging to either side.
      const b = { x: c.x + dx * A * 1.1, y: c.y + dy * A * 1.1 };
      const tip = { x: c.x + dx * G * 1.45, y: c.y + dy * G * 1.45 };
      const side = G * 0.42;
      const c1 = { x: b.x + dx * G * 0.2 - dy * side, y: b.y + dy * G * 0.2 + dx * side };
      const c2 = { x: tip.x - dy * side * 0.9, y: tip.y + dx * side * 0.9 };
      const c3 = { x: tip.x + dy * side * 0.9, y: tip.y - dx * side * 0.9 };
      const c4 = { x: b.x + dx * G * 0.2 + dy * side, y: b.y + dy * G * 0.2 - dx * side };
      const f = (v: number) => v.toFixed(2);
      return `M${f(b.x)} ${f(b.y)}C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(tip.x)} ${f(tip.y)}C${f(c3.x)} ${f(c3.y)} ${f(c4.x)} ${f(c4.y)} ${f(b.x)} ${f(b.y)}`;
    })
    .join("");
}

export const KOLAM_STRANDS = [strand(1), strand(-1)] as const;
export const KOLAM_PETALS = cornerPetals();

/** Every grid dot, flagged if it's on the perimeter ring the strands weave around. */
export const KOLAM_DOTS: { x: number; y: number; ring: boolean }[] = Array.from(
  { length: N * N },
  (_, i) => {
    const r = Math.floor(i / N);
    const c = i % N;
    return { x: c * G, y: r * G, ring: r === 0 || c === 0 || r === N - 1 || c === N - 1 };
  }
);

/** SVG viewBox framing the kolam with room for the corner petals. */
export const KOLAM_VIEWBOX = `${-G * 1.9} ${-G * 1.9} ${L + G * 3.8} ${L + G * 3.8}`;

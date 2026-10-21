import { useId } from "react";
import type { Emblem, Frame } from "./designs";
import s from "./printed.module.css";

/** A foil gradient for the SVG ornaments (the text foil is CSS). */
function Foil({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style={{ stopColor: "var(--foil)" }} />
        <stop offset="0.45" style={{ stopColor: "var(--foil-hi)" }} />
        <stop offset="0.6" style={{ stopColor: "var(--foil)" }} />
        <stop offset="1" style={{ stopColor: "var(--foil-hi)" }} />
      </linearGradient>
    </defs>
  );
}

/** The brass nilavilakku of a Kerala card. */
function Lamp({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 60 82" className={s.emblemSvg} aria-hidden>
      <g fill={fill}>
        {[12, 21, 30, 39, 48].map((x) => (
          <path key={x} d={`M${x} 11c2.6 4.2 3.2 7 0 9.6c-3.2-2.6-2.6-5.4 0-9.6z`} />
        ))}
        <path d="M6 23h48c-2 5.5-11 9-24 9S8 28.5 6 23z" />
        <path d="M30 0c2 3 2 5 0 7c-2-2-2-4 0-7z" />
        <rect x="27.5" y="31" width="5" height="33" />
        <ellipse cx="30" cy="40" rx="7" ry="2.6" />
        <ellipse cx="30" cy="52" rx="5.5" ry="2.2" />
        <path d="M30 62c-8 0-16 6-21 15h42c-5-9-13-15-21-15z" />
        <rect x="6" y="77" width="48" height="4" rx="2" />
      </g>
    </svg>
  );
}

/** A kalash with mango leaves and a coconut — Jain and Hindu cards. */
function Kalash({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 74" className={s.emblemSvg} aria-hidden>
      <g fill={fill}>
        <ellipse cx="32" cy="11" rx="7.5" ry="9" />
        <path d="M32 22C22 13 11 12 3 17c9 2 18 5 29 7z" />
        <path d="M32 22c10-9 21-10 29-5c-9 2-18 5-29 7z" />
        <path d="M32 23C25 15 17 9 10 9c5 5 12 11 22 15z" opacity="0.8" />
        <path d="M32 23c7-8 15-14 22-14c-5 5-12 11-22 15z" opacity="0.8" />
        <rect x="20" y="24" width="24" height="4.5" rx="2.2" />
        <path d="M24 28.5h16l-2.5 5h-11z" />
        <path d="M26 33.5C8 37 8 63 32 65C56 63 56 37 38 33.5z" />
        <rect x="23" y="65" width="18" height="5" rx="2.5" />
      </g>
      <path d="M14 46h36M15 51h34" stroke="var(--paper-b)" strokeWidth="1.2" opacity="0.7" />
      <circle cx="32" cy="48.5" r="3.4" fill="var(--paper-b)" opacity="0.75" />
    </svg>
  );
}

/** A cross in a glory of rays. */
function Cross({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 80 80" className={s.emblemSvg} aria-hidden>
      <g stroke={fill} strokeWidth="0.9" opacity="0.55">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r1 = 14;
          const r2 = i % 2 ? 24 : 30;
          return (
            <line
              key={i}
              x1={(40 + Math.cos(a) * r1).toFixed(2)}
              y1={(30 + Math.sin(a) * r1).toFixed(2)}
              x2={(40 + Math.cos(a) * r2).toFixed(2)}
              y2={(30 + Math.sin(a) * r2).toFixed(2)}
            />
          );
        })}
      </g>
      <path
        fill={fill}
        d="M37 4h6l-.6 4.2c.6 5 1.2 9 1.6 14.8h14.2l4.2-.6v6l-4.2-.6H44c-.6 14-1.2 28-1.6 42l.6 4.2h-6l.6-4.2c-.4-14-1-28-1.6-42H21.8l-4.2.6v-6l4.2.6H36c.4-5.8 1-9.8 1.6-14.8z"
      />
    </svg>
  );
}

export function EmblemMark({ emblem }: { emblem: Emblem }) {
  const id = useId().replace(/:/g, "");
  const fill = `url(#f${id})`;
  if (emblem === "none") return null;
  if (emblem === "suzhi") return <span className={`${s.glyph} ${s.foilText}`} aria-hidden>உ</span>;
  if (emblem === "ikonkar") return <span className={`${s.glyph} ${s.glyphGurmukhi} ${s.foilText}`} aria-hidden>ੴ</span>;
  if (emblem === "bismillah")
    return (
      <span className={`${s.bismillah} ${s.foilText}`} lang="ar" dir="rtl">
        بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </span>
    );
  return (
    <span className={s.emblemWrap}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <Foil id={`f${id}`} />
      </svg>
      {emblem === "lamp" ? <Lamp fill={fill} /> : emblem === "kalash" ? <Kalash fill={fill} /> : <Cross fill={fill} />}
    </span>
  );
}

/** The top of the printed frame: a temple arch with a kalasam, or a Mughal arch. */
export function FrameCap({ frame }: { frame: Frame }) {
  const id = useId().replace(/:/g, "");
  const stroke = `url(#c${id})`;
  if (frame === "temple") {
    const arch = "M1 74V54h116c30 0 46-18 58-30c10-10 18-12 25-20c7 8 15 10 25 20c12 12 28 30 58 30h116v20";
    return (
      <svg viewBox="0 0 400 74" className={s.cap} preserveAspectRatio="none" aria-hidden>
        <Foil id={`c${id}`} />
        <path d={arch} fill="none" stroke={stroke} strokeWidth="2.4" />
        <path d={arch} fill="none" stroke={stroke} strokeWidth="1" transform="translate(7 7) scale(0.965 0.95)" />
        <g fill={stroke}>
          <circle cx="200" cy="2.6" r="2.4" />
          <circle cx="117" cy="54" r="2.6" />
          <circle cx="283" cy="54" r="2.6" />
        </g>
      </svg>
    );
  }
  // mughal: a pointed ogee arch with a finial and cusps
  const arch = "M1 130V82C1 50 58 46 108 38C150 31 184 18 200 4C216 18 250 31 292 38C342 46 399 50 399 82V130";
  return (
    <svg viewBox="0 0 400 130" className={s.cap} preserveAspectRatio="none" aria-hidden>
      <Foil id={`c${id}`} />
      <path d={arch} fill="none" stroke={stroke} strokeWidth="2.4" />
      <path d={arch} fill="none" stroke={stroke} strokeWidth="1" transform="translate(8 9) scale(0.96 0.93)" />
      <g fill={stroke}>
        <path d="M200 0c3 4 3 7 0 10c-3-3-3-6 0-10z" transform="translate(0 -6)" />
        {[60, 108, 150, 250, 292, 340].map((x, i) => (
          <circle key={i} cx={x} cy={x < 200 ? 52 - (x - 60) * 0.18 : 52 - (340 - x) * 0.18} r="2" />
        ))}
      </g>
    </svg>
  );
}

/** A printed corner flourish (rotated for each corner). */
export function Corner({ className }: { className: string }) {
  const id = useId().replace(/:/g, "");
  const stroke = `url(#k${id})`;
  return (
    <svg viewBox="0 0 72 72" className={className} aria-hidden>
      <Foil id={`k${id}`} />
      <g fill="none" stroke={stroke} strokeLinecap="round">
        <path d="M4 70V22C4 11 11 4 22 4h48" strokeWidth="1.8" />
        <path d="M11 70V26c0-9 6-15 15-15h44" strokeWidth="0.9" />
        <path d="M24 24c9-1 14 5 10 10c-3 3.5-8 1-6.5-2.5" strokeWidth="1.2" />
        <path d="M32 9c6 4.5 12 4.5 18 0M9 32c4.5 6 4.5 12 0 18" strokeWidth="1" />
      </g>
      <g fill={stroke}>
        <circle cx="22" cy="22" r="1.8" />
        <circle cx="56" cy="9" r="1.4" />
        <circle cx="9" cy="56" r="1.4" />
      </g>
    </svg>
  );
}

/** The repeating tile for patterned borders and liners, as a CSS background. */
export function patternTile(pattern: string, colors: string[] = []): string | undefined {
  const [a = "#1f3a6b", b = "#b08a3e", c = a, d = b] = colors;
  const T: Record<string, string> = {
    // an eight-pointed star (two squares) with a dot — the Islamic and Jain border
    geometric: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><g fill='none' stroke='${a}' stroke-width='1.1'><rect x='6' y='6' width='12' height='12'/><rect x='6' y='6' width='12' height='12' transform='rotate(45 12 12)'/></g><circle cx='12' cy='12' r='2' fill='${b}'/><circle cx='0' cy='0' r='1.4' fill='${b}'/><circle cx='24' cy='0' r='1.4' fill='${b}'/><circle cx='0' cy='24' r='1.4' fill='${b}'/><circle cx='24' cy='24' r='1.4' fill='${b}'/></svg>`,
    // phulkari: stitched diamonds in silk colours
    phulkari: `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='M14 2l10 12-10 12L4 14z' fill='${a}'/><path d='M14 7l5.5 7L14 21l-5.5-7z' fill='${b}'/><path d='M14 11l2.5 3L14 17l-2.5-3z' fill='${c}'/><path d='M0 0l3 3.5L0 7zM28 0l-3 3.5L28 7zM0 28l3-3.5L0 21zM28 28l-3-3.5L28 21z' fill='${d}'/></svg>`,
    // pulli kolam: rice-flour dots with a looped line around them
    kolam: `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><g fill='${a}'><circle cx='7' cy='7' r='1.5'/><circle cx='21' cy='7' r='1.5'/><circle cx='7' cy='21' r='1.5'/><circle cx='21' cy='21' r='1.5'/><circle cx='14' cy='14' r='1.5'/></g><g fill='none' stroke='${a}' stroke-width='1.1' stroke-linecap='round'><path d='M14 3.5C17 7 17 10.5 14 14C11 10.5 11 7 14 3.5zM14 24.5C11 21 11 17.5 14 14C17 17.5 17 21 14 24.5zM3.5 14C7 11 10.5 11 14 14C10.5 17 7 17 3.5 14zM24.5 14C21 17 17.5 17 14 14C17.5 11 21 11 24.5 14z'/></g></svg>`,
    // a printed paisley (mango) with dots
    paisley: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M15 4c7 0 12 6 10 13c-1.6 5.6-7.6 9-12.4 7c-4-1.6-4.7-7-1.2-8.9c2.8-1.5 6 0.4 5.6 3.4' fill='none' stroke='${a}' stroke-width='1.3' stroke-linecap='round'/><path d='M15 4c-2 2-2.5 5-1 7' fill='none' stroke='${a}' stroke-width='1.1'/><circle cx='15.3' cy='17.6' r='1.4' fill='${b}'/><g fill='${b}'><circle cx='3' cy='29' r='1'/><circle cx='29' cy='3' r='1'/><circle cx='6' cy='6' r='0.8'/></g></svg>`,
    // Mughal jaali: overlapping circles, a carved lattice
    jaali: `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><g fill='none' stroke='${a}' stroke-width='1.1'><circle cx='0' cy='0' r='14'/><circle cx='28' cy='0' r='14'/><circle cx='0' cy='28' r='14'/><circle cx='28' cy='28' r='14'/><circle cx='14' cy='14' r='14'/></g><circle cx='14' cy='14' r='1.6' fill='${b}'/></svg>`,
    // lace: scallops and little flowers
    lace: `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><g fill='none' stroke='${a}' stroke-width='1.1'><circle cx='15' cy='15' r='7'/><circle cx='0' cy='0' r='7'/><circle cx='30' cy='0' r='7'/><circle cx='0' cy='30' r='7'/><circle cx='30' cy='30' r='7'/></g><g fill='${a}'><circle cx='15' cy='15' r='2'/><circle cx='15' cy='5.5' r='1'/><circle cx='15' cy='24.5' r='1'/><circle cx='5.5' cy='15' r='1'/><circle cx='24.5' cy='15' r='1'/></g><g fill='${b}'><circle cx='15' cy='0' r='1.2'/><circle cx='0' cy='15' r='1.2'/><circle cx='30' cy='15' r='1.2'/><circle cx='15' cy='30' r='1.2'/></g></svg>`,
    // art deco: stacked fans
    deco: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><g fill='none' stroke='${a}' stroke-width='1.1'><path d='M0 16A16 16 0 0 1 32 16'/><path d='M5 16A11 11 0 0 1 27 16'/><path d='M10 16A6 6 0 0 1 22 16'/><path d='M-16 32A16 16 0 0 1 16 32'/><path d='M16 32A16 16 0 0 1 48 32'/><path d='M-11 32A11 11 0 0 1 11 32'/><path d='M21 32A11 11 0 0 1 43 32'/><path d='M16 0v16'/></g><circle cx='16' cy='16' r='1.3' fill='${b}'/></svg>`,
  };
  const svg = T[pattern];
  return svg ? `url("data:image/svg+xml,${encodeURIComponent(svg)}")` : undefined;
}

/** The tile's size in CSS px. */
export function patternSize(pattern: string): number {
  return ({ geometric: 24, phulkari: 28, kolam: 28, paisley: 32, jaali: 28, lace: 30, deco: 32 } as Record<string, number>)[pattern] ?? 24;
}

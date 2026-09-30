/**
 * Drawn stand-ins for the Pathirikai art slots, shown until the painted art
 * is added to public/art/temple-gopuram/. Shaded with gradients (brass,
 * leaf veins, flame glow) rather than flat fills, so the page still reads
 * as real objects without the images.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

/** A kuthuvilakku (brass standing lamp) with lit wicks. */
export function BrassLamp({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 120 200" width={small ? 64 : 96} height={small ? 107 : 160} aria-hidden>
      <defs>
        <linearGradient id="brass" x1="0" x2="1">
          <stop offset="0" stopColor="#6b4a14" />
          <stop offset=".28" stopColor="#d9b25a" />
          <stop offset=".45" stopColor="#fff0bf" />
          <stop offset=".62" stopColor="#c19338" />
          <stop offset="1" stopColor="#5a3d0f" />
        </linearGradient>
        <radialGradient id="flameGlow">
          <stop offset="0" stopColor="#ffd88a" stopOpacity=".9" />
          <stop offset="1" stopColor="#ff9a2e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff7a1a" />
          <stop offset=".5" stopColor="#ffc24a" />
          <stop offset="1" stopColor="#fff6d6" />
        </linearGradient>
      </defs>
      {[30, 60, 90].map((x) => (
        <g key={x}>
          <circle cx={x} cy={x === 60 ? 44 : 50} r="16" fill="url(#flameGlow)" />
          <path
            d={`M${x} ${x === 60 ? 30 : 36} q6 10 0 18 q-6 -8 0 -18z`}
            fill="url(#flame)"
          />
        </g>
      ))}
      {/* peacock finial */}
      <path d="M60 8 q8 6 4 14 q-4 4 -4 10 q0 -6 -4 -10 q-4 -8 4 -14z" fill="url(#brass)" />
      {/* oil bowl with five-point lip */}
      <path d="M18 60 Q60 82 102 60 L96 70 Q60 90 24 70Z" fill="url(#brass)" />
      <ellipse cx="60" cy="60" rx="42" ry="7" fill="#3d2a0a" opacity=".55" />
      {/* stem with knops */}
      <rect x="55" y="80" width="10" height="80" fill="url(#brass)" />
      {[96, 120, 142].map((y) => (
        <ellipse key={y} cx="60" cy={y} rx="11" ry="5" fill="url(#brass)" />
      ))}
      {/* base */}
      <path d="M30 186 Q60 150 90 186Z" fill="url(#brass)" />
      <ellipse cx="60" cy="187" rx="34" ry="6" fill="url(#brass)" />
    </svg>
  );
}

/** A mango-leaf thoranam with marigolds, strung across the top. */
export function MangoLeaves() {
  const leaves = Array.from({ length: 15 }, (_, i) => i);
  return (
    <svg viewBox="0 0 600 120" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="leaf" x1="0" x2="1">
          <stop offset="0" stopColor="#1f4d17" />
          <stop offset=".5" stopColor="#3f8a2a" />
          <stop offset="1" stopColor="#24561b" />
        </linearGradient>
        <radialGradient id="marigold" cx=".4" cy=".35">
          <stop offset="0" stopColor="#ffd35a" />
          <stop offset=".6" stopColor="#f39a1b" />
          <stop offset="1" stopColor="#c8620c" />
        </radialGradient>
      </defs>
      <path d="M0 10 Q300 34 600 10" stroke="#7a5a2a" strokeWidth="3" fill="none" />
      {leaves.map((i) => {
        const x = 20 + i * 40;
        const y = r2(10 + 24 * Math.sin((Math.PI * x) / 600));
        const tilt = r2((i % 2 ? 1 : -1) * (3 + (i % 3)));
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${tilt})`}>
            <path d="M0 0 C14 18 12 62 0 92 C-12 62 -14 18 0 0Z" fill="url(#leaf)" />
            <path d="M0 4 V86" stroke="#9ccc6a" strokeWidth="1" opacity=".55" />
            {[20, 36, 52, 68].map((vy) => (
              <path key={vy} d={`M0 ${vy} l7 -6 M0 ${vy} l-7 -6`} stroke="#9ccc6a" strokeWidth=".6" opacity=".4" />
            ))}
          </g>
        );
      })}
      {leaves.slice(0, 14).map((i) => {
        const x = 40 + i * 40;
        const y = r2(14 + 24 * Math.sin((Math.PI * x) / 600));
        return <circle key={i} cx={x} cy={y} r="8" fill="url(#marigold)" />;
      })}
    </svg>
  );
}

/** A rice-flour kolam border: dots with a continuous looping line. */
export function KolamBorder({ flip }: { flip?: boolean }) {
  const dots = Array.from({ length: 9 }, (_, i) => 20 + i * 40);
  return (
    <svg
      viewBox="0 0 360 60"
      width="100%"
      height="60"
      aria-hidden
      style={{ maxWidth: 360, transform: flip ? "scaleY(-1)" : undefined }}
    >
      <path
        d={
          "M0 30 " +
          dots.map((x) => `C${x - 14} 2 ${x + 14} 2 ${x + 20} 30 C${x + 26} 58 ${x + 34} 58 ${x + 40} 30`).join(" ")
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity=".85"
      />
      {dots.map((x) => (
        <circle key={x} cx={x + 20} cy="30" r="2.6" fill="currentColor" />
      ))}
    </svg>
  );
}

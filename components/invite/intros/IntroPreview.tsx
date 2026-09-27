import type { IntroId } from "@/lib/templates";
import s from "./previews.module.css";

/**
 * A tiny muted loop of a template's intro for its landing-page card, pure
 * SVG + CSS (no JS, no video). It plays while the card is hovered or
 * focused; on touch screens (no hover) it loops continuously. Off with
 * reduced motion. The card must have the `group` class.
 */
export default function IntroPreview({ intro }: { intro: IntroId }) {
  return (
    <div className={s.preview} aria-hidden>
      <svg viewBox="0 0 100 100" className={s.svg}>
        {intro === "door" && (
          <>
            <rect width="100" height="100" fill="#e9cf94" />
            <rect x="20" y="16" width="60" height="84" rx="30" fill="#fff4d6" />
            <rect
              className={`${s.a} ${s.doorL}`}
              x="20"
              y="16"
              width="30"
              height="84"
              fill="#0e4a3a"
              stroke="#c9a24b"
            />
            <rect
              className={`${s.a} ${s.doorR}`}
              x="50"
              y="16"
              width="30"
              height="84"
              fill="#0e4a3a"
              stroke="#c9a24b"
            />
          </>
        )}
        {intro === "kolam" && (
          <>
            <rect width="100" height="100" fill="#1e1a17" />
            {[20, 35, 50, 65, 80].flatMap((x) =>
              [30, 45, 60, 75].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#f4eee2" />
              ))
            )}
            <path
              className={`${s.a} ${s.draw}`}
              pathLength={1}
              d="M12 52Q20 22 28 52T44 52T60 52T76 52T92 52Q84 82 76 52T60 52T44 52T28 52T12 52"
              fill="none"
              stroke="#e3b45a"
              strokeWidth="1.6"
            />
            <g className={`${s.a} ${s.swing}`}>
              <line x1="50" y1="0" x2="50" y2="10" stroke="#c8962e" />
              <path d="M44 20Q44 10 50 10Q56 10 56 20L58 22H42Z" fill="#e3b45a" />
            </g>
          </>
        )}
        {intro === "split" && (
          <>
            <rect width="100" height="100" fill="#fafaf7" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fontSize="18"
              fill="#111"
              fontFamily="sans-serif"
            >
              M &amp; R
            </text>
            <g className={`${s.a} ${s.halfTop}`}>
              <rect width="100" height="50" fill="#fafaf7" />
              <text
                x="50"
                y="44"
                textAnchor="middle"
                fontSize="6"
                letterSpacing="1.5"
                fill="#111"
                fontFamily="sans-serif"
              >
                SAVE THE DATE
              </text>
            </g>
            <g className={`${s.a} ${s.halfBottom}`}>
              <rect y="50" width="100" height="50" fill="#fafaf7" />
              <text
                x="50"
                y="66"
                textAnchor="middle"
                fontSize="11"
                fill="#111"
                fontFamily="sans-serif"
              >
                12.12
              </text>
            </g>
            <line
              className={`${s.a} ${s.hairline}`}
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="#111"
              strokeWidth="0.8"
            />
          </>
        )}
        {intro === "bloom" && (
          <>
            <rect width="100" height="100" fill="#fffbf5" />
            <g transform="translate(50 54)">
              {Array.from({ length: 7 }, (_, i) => (
                <g key={i} transform={`rotate(${i * (360 / 7)})`}>
                  <path
                    className={`${s.a} ${s.petal}`}
                    d="M0 0C-9 -6 -8 -24 0 -30C8 -24 9 -6 0 0Z"
                    fill="#e79aa8"
                  />
                </g>
              ))}
              <circle r="5" fill="#f7e7b4" />
              <path
                className={`${s.a} ${s.sepal}`}
                d="M-10 4C-6 16 6 16 10 4C5 9 -5 9 -10 4Z"
                fill="#7e9c76"
              />
            </g>
          </>
        )}
        {intro === "giftbox" && (
          <>
            <rect width="100" height="100" fill="#0b0b0c" />
            <rect x="22" y="40" width="56" height="44" fill="#1c1c1f" stroke="#34343a" />
            <rect
              className={`${s.a} ${s.card}`}
              x="30"
              y="44"
              width="40"
              height="30"
              fill="#f5f2ea"
            />
            <g className={`${s.a} ${s.lid}`}>
              <rect x="19" y="32" width="62" height="12" fill="#232327" stroke="#34343a" />
              <rect x="46" y="32" width="8" height="12" fill="#c9ccd1" />
            </g>
          </>
        )}
        {intro === "bottle" && (
          <>
            <rect width="100" height="100" fill="#bfe6f5" />
            <rect y="62" width="100" height="38" fill="#ead7b7" />
            <path d="M0 58Q25 52 50 58T100 58V66H0Z" fill="#3fb8af" />
            <g className={`${s.a} ${s.rock}`}>
              <path
                d="M30 52Q28 58 30 62H58Q64 62 68 59H72V55H68Q64 52 58 52Z"
                fill="#cdeee9"
                stroke="#fff"
              />
            </g>
            <path
              className={`${s.a} ${s.wave}`}
              d="M0 20Q25 8 50 20T100 20V110H0Z"
              fill="#1d6e7a"
            />
          </>
        )}
        {intro === "curtain" && (
          <>
            <rect width="100" height="100" fill="#2a0a0c" />
            <text x="50" y="56" textAnchor="middle" fontSize="16" fill="#ebd08a" fontFamily="serif">
              &amp;
            </text>
            <rect className={`${s.a} ${s.doorL}`} x="0" y="0" width="52" height="100" fill="#7a0f1f" />
            <rect className={`${s.a} ${s.doorR}`} x="48" y="0" width="52" height="100" fill="#6a0c1b" />
            <rect width="100" height="14" fill="#8c1426" />
            <rect y="13" width="100" height="2" fill="#c9a54a" />
          </>
        )}
        {intro === "scratch" && (
          <>
            <rect width="100" height="100" fill="#f4efff" />
            <rect x="16" y="22" width="68" height="56" rx="8" fill="#fbf8ff" stroke="#d8a7b1" />
            <text x="50" y="56" textAnchor="middle" fontSize="11" fill="#3e3358" fontFamily="serif">
              24·01
            </text>
            <rect className={`${s.a} ${s.foilOff}`} x="24" y="42" width="52" height="22" rx="4" fill="#d8a7b1" />
          </>
        )}
        {intro === "lanterns" && (
          <>
            <rect width="100" height="100" fill="#0e1733" />
            {[22, 50, 76].map((x, i) => (
              <ellipse
                key={x}
                className={`${s.a} ${s.floatUp}`}
                style={{ animationDelay: `${i * 0.4}s` }}
                cx={x}
                cy="92"
                rx="5"
                ry="7"
                fill="#ffb347"
              />
            ))}
            <path d="M36 80Q50 92 64 80Z" fill="#c8642a" />
            <path className={`${s.a} ${s.flameOn}`} d="M58 78C55 74 57 70 58 66C59 70 61 74 58 78Z" fill="#ff9933" />
          </>
        )}
        {intro === "thoranam" && (
          <>
            <rect width="100" height="100" fill="#f1ead2" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path
                key={i}
                d={`M${7 + i * 14} 4C${3 + i * 14} 12 ${4 + i * 14} 20 ${7 + i * 14} 24C${10 + i * 14} 20 ${11 + i * 14} 12 ${7 + i * 14} 4Z`}
                fill={i % 2 ? "#5fa043" : "#3e7a2f"}
              />
            ))}
            <g className={`${s.a} ${s.doorL}`}>
              {[10, 22, 34, 46].map((x) => (
                <line key={x} x1={x} x2={x} y1="20" y2="100" stroke="#fff" strokeWidth="4" strokeDasharray="4 3" />
              ))}
            </g>
            <g className={`${s.a} ${s.doorR}`}>
              {[54, 66, 78, 90].map((x) => (
                <line key={x} x1={x} x2={x} y1="20" y2="100" stroke="#fff" strokeWidth="4" strokeDasharray="4 3" />
              ))}
            </g>
          </>
        )}
        {intro === "kasavu" && (
          <>
            <rect width="100" height="100" fill="#fffbef" />
            <rect y="8" width="100" height="8" fill="#b8921f" />
            <rect y="84" width="100" height="8" fill="#b8921f" />
            <rect x="48" y="44" width="4" height="36" fill="#c9a042" />
            <path d="M34 44Q50 54 66 44Z" fill="#d4af37" />
            <ellipse cx="50" cy="80" rx="12" ry="3" fill="#d4af37" />
            {[38, 44, 50, 56, 62].map((x, i) => (
              <path
                key={x}
                className={`${s.a} ${s.flameOn}`}
                style={{ animationDelay: `${i * 0.15}s` }}
                d={`M${x} 44C${x - 3} 40 ${x - 1} 36 ${x} 32C${x + 1} 36 ${x + 3} 40 ${x} 44Z`}
                fill="#ff9933"
              />
            ))}
          </>
        )}
        {intro === "pookalam" && (
          <>
            <rect width="100" height="100" fill="#5a1414" />
            {[
              { r: 38, c: "#2e7d32" },
              { r: 31, c: "#ffd35c" },
              { r: 24, c: "#fffdf4" },
              { r: 17, c: "#c8102e" },
              { r: 10, c: "#e8862a" },
            ].map((ring, i) => (
              <circle
                key={ring.r}
                className={`${s.a} ${s.bloomIn}`}
                style={{ animationDelay: `${(4 - i) * 0.12}s` }}
                cx="50"
                cy="50"
                r={ring.r}
                fill={ring.c}
              />
            ))}
            <circle cx="50" cy="50" r="4" fill="#ffd35c" />
          </>
        )}
        {intro === "envelope" && (
          <>
            <rect width="100" height="100" fill="#fdfaf3" />
            <rect x="18" y="34" width="64" height="44" fill="#f3e9d6" stroke="#d9c7a8" />
            <path
              className={`${s.a} ${s.flap}`}
              d="M18 34L50 58L82 34Z"
              fill="#eadcc2"
              stroke="#d9c7a8"
            />
            <circle cx="50" cy="56" r="6" fill="#b8860b" />
          </>
        )}
      </svg>
    </div>
  );
}

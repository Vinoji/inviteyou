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

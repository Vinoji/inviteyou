/** A wax-seal stamp: irregular drips, an embossed rim, and an "&" mark. */
export default function WaxSeal({
  color,
  size = 84,
  fontFamily,
  className,
}: {
  color: string;
  size?: number;
  fontFamily?: string;
  className?: string;
}) {
  const gradientId = `wax-grad-${color.replace("#", "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.78" />
        </radialGradient>
      </defs>
      {/* drips */}
      <circle cx="50" cy="87" r="5.5" fill={color} opacity="0.85" />
      <circle cx="31" cy="89" r="3.5" fill={color} opacity="0.7" />
      <circle cx="69" cy="89" r="3.5" fill={color} opacity="0.7" />
      {/* main blob, slightly irregular */}
      <path
        d="M50 6 C74 6 92 24 92 46 C92 68 74 84 50 84 C26 84 8 68 8 46 C8 24 26 6 50 6 Z"
        fill={`url(#${gradientId})`}
      />
      <circle cx="50" cy="45" r="33" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="36"
        fill="#fff"
        fillOpacity="0.95"
        style={{ fontFamily: fontFamily ?? "serif" }}
      >
        &amp;
      </text>
    </svg>
  );
}

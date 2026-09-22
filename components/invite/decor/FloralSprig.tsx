/** A small stylized botanical sprig — stem, leaves and three simple blooms. */
export default function FloralSprig({
  color,
  size = 56,
  className,
  flip = false,
}: {
  color: string;
  size?: number;
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M28 52 C28 38 28 24 28 10" />
        <path d="M28 36 C20 32 13 25 11 16" />
        <path d="M28 28 C36 24 43 17 45 8" />
      </g>
      <g fill={color} opacity="0.85">
        <ellipse cx="28" cy="9" rx="6" ry="9" />
        <ellipse cx="12" cy="15" rx="5" ry="7" transform="rotate(-45 12 15)" />
        <ellipse cx="44" cy="9" rx="5" ry="7" transform="rotate(45 44 9)" />
      </g>
      <circle cx="28" cy="9" r="2" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

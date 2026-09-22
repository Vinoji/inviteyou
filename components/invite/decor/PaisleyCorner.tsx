/** A simple paisley/mango-motif flourish, the classic South Asian corner ornament. */
export default function PaisleyCorner({
  color,
  size = 64,
  className,
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M10 58 C6 40 10 20 26 12 C36 7 46 10 46 20 C46 28 38 32 32 26 C28 22 30 16 36 14"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="36" cy="14" r="2.5" fill={color} />
      <path
        d="M4 58 C4 42 8 26 20 16"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

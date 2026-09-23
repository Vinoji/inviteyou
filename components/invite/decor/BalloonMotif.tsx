/** A cluster of three party balloons on strings, for the birthday template. */
export default function BalloonMotif({
  color,
  size = 60,
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
      viewBox="0 0 60 60"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g stroke={color} strokeWidth="1" fill="none" opacity="0.7">
        <path d="M20 26 Q18 38 22 48" />
        <path d="M30 30 Q30 40 30 50" />
        <path d="M40 26 Q42 38 38 48" />
      </g>
      <ellipse cx="20" cy="16" rx="10" ry="13" fill={color} opacity="0.9" />
      <ellipse cx="40" cy="16" rx="10" ry="13" fill={color} opacity="0.9" />
      <ellipse cx="30" cy="20" rx="11" ry="14" fill={color} />
      <path d="M18 6 Q20 3 22 6" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

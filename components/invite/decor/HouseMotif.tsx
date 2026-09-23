/** A simple house outline — roof, walls, door — for the house-warming template. */
export default function HouseMotif({
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
      <path
        d="M8 30 L30 10 L52 30"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 26 V50 H46 V26"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="26" y="34" width="8" height="16" fill="none" stroke={color} strokeWidth="2" />
      <path d="M30 10 V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="2" r="2" fill={color} />
    </svg>
  );
}

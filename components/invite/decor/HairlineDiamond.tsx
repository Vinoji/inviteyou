/** A minimal rotated-square (diamond) ornament with a center dot — used for the elegant B&W template. */
export default function HairlineDiamond({
  color,
  size = 20,
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
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="5"
        y="5"
        width="10"
        height="10"
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        transform="rotate(45 10 10)"
      />
      <circle cx="10" cy="10" r="1.25" fill={color} />
    </svg>
  );
}

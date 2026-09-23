/** A simple engagement ring — a band with a faceted gem on top — for the proposal template. */
export default function RingMotif({
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
      <circle cx="30" cy="38" r="16" fill="none" stroke={color} strokeWidth="2.5" />
      <path
        d="M30 14 L22 24 L30 30 L38 24 Z"
        fill={color}
        opacity="0.9"
      />
      <path d="M22 24 L30 30 L26 22 Z" fill={color} opacity="0.6" />
      <path d="M38 24 L30 30 L34 22 Z" fill={color} opacity="0.6" />
      <circle cx="30" cy="14" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

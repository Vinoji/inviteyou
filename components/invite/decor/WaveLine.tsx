/** A gentle repeating wave, standing in for shoreline/water — beach template divider. */
export default function WaveLine({
  color,
  width = 80,
  className,
}: {
  color: string;
  width?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height="12"
      viewBox="0 0 80 12"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M0 6 Q10 0 20 6 T40 6 T60 6 T80 6"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

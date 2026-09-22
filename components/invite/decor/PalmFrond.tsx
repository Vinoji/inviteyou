/** A fanned palm frond — filled tapered blades radiating from a base point. */
export default function PalmFrond({
  color,
  size = 60,
  className,
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  const blade = "M0,0 C5,-22 5,-44 0,-56 C-5,-44 -5,-22 0,0 Z";
  const angles = [-50, -30, -12, 6, 24, 42];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M30 60 L30 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <g fill={color}>
        {angles.map((a) => (
          <path key={a} d={blade} transform={`translate(30 58) rotate(${a})`} opacity={0.9} />
        ))}
      </g>
    </svg>
  );
}

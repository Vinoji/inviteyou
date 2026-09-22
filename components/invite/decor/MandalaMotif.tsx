/**
 * A procedurally-generated radial mandala, built from repeated petal paths.
 * Self-authored (no external asset, no license/attribution concerns) so it
 * can be dropped into every published invitation for free.
 */
export default function MandalaMotif({
  color,
  size = 260,
  opacity = 0.16,
  className,
}: {
  color: string;
  size?: number;
  opacity?: number;
  className?: string;
}) {
  const outerPetals = 12;
  const innerPetals = 8;
  const outerPetal = "M0,-92 C9,-64 9,-30 0,-4 C-9,-30 -9,-64 0,-92 Z";
  const innerPetal = "M0,-52 C6,-36 6,-16 0,-2 C-6,-16 -6,-36 0,-52 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      <g fill={color}>
        {Array.from({ length: outerPetals }).map((_, i) => (
          <path key={`o-${i}`} d={outerPetal} transform={`rotate(${(360 / outerPetals) * i})`} />
        ))}
      </g>
      <g fill={color} opacity={0.7}>
        {Array.from({ length: innerPetals }).map((_, i) => (
          <path
            key={`i-${i}`}
            d={innerPetal}
            transform={`rotate(${(360 / innerPetals) * i + 360 / innerPetals / 2})`}
          />
        ))}
      </g>
      <circle r="18" fill="none" stroke={color} strokeWidth="1.5" />
      <circle r="6" fill={color} />
      <circle r="78" fill="none" stroke={color} strokeWidth="1" />
      <circle r="96" fill="none" stroke={color} strokeWidth="0.75" />
    </svg>
  );
}

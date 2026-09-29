import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon (and the logo in the home page's structured data):
 * the marigold on plum, as in app/icon.svg. */
export default function AppleIcon() {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex", background: "#3d1236" }}>
        <svg viewBox="0 0 40 40" width="180" height="180">
          {petals.map((deg, i) => (
            <ellipse
              key={deg}
              cx="20"
              cy="10.5"
              rx="4.2"
              ry="7.2"
              fill={i % 2 ? "#f0a23c" : "#ffc24d"}
              transform={`rotate(${deg} 20 20)`}
            />
          ))}
          <circle cx="20" cy="20" r="4.8" fill="#b3261e" />
          <circle cx="20" cy="20" r="1.8" fill="#ffe7a8" />
        </svg>
      </div>
    ),
    size
  );
}

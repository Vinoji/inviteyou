import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { SITE } from "@/lib/site";
import { loadFonts, tamilVisualOrder as v } from "@/lib/ogFonts";

export const alt = "InviteForYou";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The preview card for links to the site itself (home, demos, support…):
 * plum night, the marigold, the name, the promise and the domain. Shared
 * invitations have their own card (invite/[slug]/opengraph-image.tsx).
 */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, tSeo] = await Promise.all([
    getTranslations({ locale, namespace: "landing" }),
    getTranslations({ locale, namespace: "seo" }),
  ]);
  const heading = t("heading");
  const line = tSeo("ogLine");
  const text = `${SITE.name}${heading}${line}${SITE.domain}`;
  const fonts = await loadFonts(
    [
      { name: "Display", family: "Playfair Display", weight: 700 },
      { name: "Body", family: "Lato", weight: 400 },
      { name: "Tamil", family: "Catamaran", weight: 600 },
    ],
    v(text) + text
  );
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #1a0b1f 0%, #3d1236 60%, #6b2140 100%)",
          color: "#fff6e6",
          fontFamily: '"Body", "Tamil", sans-serif',
          position: "relative",
        }}
      >
        {/* marigold garland along the top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 26,
                height: 26 + (i % 3) * 14,
                marginTop: -6,
                borderRadius: 13,
                background: i % 2 ? "#e8862a" : "#ffc24d",
                display: "flex",
              }}
            />
          ))}
        </div>
        <svg viewBox="0 0 40 40" width="150" height="150">
          {petals.map((deg, i) => (
            <ellipse key={deg} cx="20" cy="10.5" rx="4.2" ry="7.2" fill={i % 2 ? "#f0a23c" : "#ffc24d"} transform={`rotate(${deg} 20 20)`} />
          ))}
          <circle cx="20" cy="20" r="4.8" fill="#b3261e" />
          <circle cx="20" cy="20" r="1.8" fill="#ffe7a8" />
        </svg>
        <div style={{ display: "flex", marginTop: 18, fontFamily: '"Display", serif', fontSize: 88, fontWeight: 700, color: "#ffe9b8" }}>
          {SITE.name}
        </div>
        <div style={{ display: "flex", marginTop: 8, fontFamily: '"Display", "Tamil", serif', fontSize: 40, maxWidth: 1000, textAlign: "center" }}>
          {v(heading)}
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 28, color: "#f3c979" }}>{v(line)}</div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 36,
            padding: "10px 28px",
            borderRadius: 999,
            border: "2px solid #e8b04a",
            fontSize: 26,
            color: "#ffe9b8",
          }}
        >
          {SITE.domain}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}

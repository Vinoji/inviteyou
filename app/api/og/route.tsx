import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { SITE } from "@/lib/site";
import { loadFonts, tamilVisualOrder as v } from "@/lib/ogFonts";

export const runtime = "nodejs";

/**
 * GET /api/og?t=<title>&s=<subtitle>&k=<kicker> — a page's own preview
 * card (1200×630) for links to the templates, occasion, keyword, blog,
 * demo and about pages: the marigold garland, the page's title and line,
 * and the domain. lib/seo.ts pageSocial() builds the URL.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const title = (q.get("t") ?? SITE.name).slice(0, 110);
  const sub = (q.get("s") ?? "").slice(0, 170);
  const kicker = (q.get("k") ?? "").slice(0, 60);
  const text = `${SITE.name}${title}${sub}${kicker}${SITE.domain}`;
  const fonts = await loadFonts(
    [
      { name: "Display", family: "Playfair Display", weight: 700 },
      { name: "Body", family: "Lato", weight: 400 },
      { name: "Tamil", family: "Catamaran", weight: 600 },
    ],
    v(text) + text
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(160deg, #1a0b1f 0%, #3d1236 58%, #6b2140 100%)",
          color: "#fff6e6",
          fontFamily: '"Body", "Tamil", sans-serif',
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              style={{ width: 24, height: 24 + (i % 3) * 14, marginTop: -6, borderRadius: 12, background: i % 2 ? "#e8862a" : "#ffc24d", display: "flex" }}
            />
          ))}
        </div>
        {kicker && (
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#f3c979" }}>{v(kicker)}</div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontFamily: '"Display", "Tamil", serif',
            fontSize: title.length > 60 ? 58 : 70,
            fontWeight: 700,
            lineHeight: 1.12,
            color: "#ffe9b8",
            maxWidth: 1020,
          }}
        >
          {v(title)}
        </div>
        {sub && <div style={{ display: "flex", marginTop: 24, fontSize: 30, lineHeight: 1.4, color: "#f6dfc2", maxWidth: 1000 }}>{v(sub)}</div>}
        <div style={{ position: "absolute", bottom: 40, left: 90, right: 90, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontFamily: '"Display", serif', fontSize: 36, fontWeight: 700, color: "#ffe9b8" }}>{SITE.name}</div>
          <div style={{ display: "flex", padding: "8px 24px", borderRadius: 999, border: "2px solid #e8b04a", fontSize: 24, color: "#ffe9b8" }}>
            {SITE.domain}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: fonts.length ? fonts : undefined, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } }
  );
}

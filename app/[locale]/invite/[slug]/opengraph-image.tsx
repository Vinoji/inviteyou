import { ImageResponse } from "next/og";
import { getTranslations, getFormatter } from "next-intl/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getTemplateConfig } from "@/lib/templates";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { getRoyalPalette } from "@/components/invite/royal/palettes";
import { parseIsoDate } from "@/lib/calendar";
import { resolveMonogram } from "@/lib/monogram";
import { ogFonts, tamilVisualOrder as v } from "@/lib/ogFonts";
import type { InvitationData } from "@/lib/types";

// Uses the Admin SDK (Node-only APIs), so this must run on the Node runtime
// rather than the default Edge runtime for metadata image routes.
export const runtime = "nodejs";
export const alt = "Invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The link-preview card WhatsApp, iMessage and others show under a shared
 * invitation link: an invitation card in the template's own colours —
 * double gold frame, the couple's photo when there is one, names, the
 * occasion, date and venue. Link previews are always a still image, so the
 * animation itself lives on the page this opens.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: routeLocale, slug } = await params;
  const snap = await getAdminDb().collection("invitations").doc(slug).get();
  const data = (snap.exists && snap.data()?.status === "published" ? snap.data() : null) as
    | InvitationData
    | null;
  const locale =
    data?.contentLocale === "en" || data?.contentLocale === "ta" ? data.contentLocale : routeLocale;

  const [t, tCommon, tCategories, format] = await Promise.all([
    getTranslations({ locale, namespace: "invite.opengraph" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "categories" }),
    getFormatter({ locale }),
  ]);
  const template = getTemplateConfig(data?.templateId ?? "traditional-gold");
  const category = getCategoryMeta(template.category, tCategories);
  const isWedding = template.category === "wedding";
  const p = getRoyalPalette(isWedding ? template.id : "");
  const accent = data?.accentColor || template.defaultAccent;
  const deep = isWedding ? p.deep : "#17120f";
  const gold = isWedding ? p.goldLight : accent;

  const bride = data?.brideName || tCommon(category.singlePerson ? "friendFallback" : "brideFallback");
  const groom = category.singlePerson ? "" : data?.groomName || tCommon("groomFallback");
  const monogram = resolveMonogram(bride, groom, data?.monogram, category.singlePerson);
  const day = data ? parseIsoDate(data.weddingDate) : null;
  const date = day
    ? format.dateTime(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  const venue = [data?.ceremonyVenue?.name, data?.travel?.city].filter(Boolean).join(" · ");
  // Only our own Storage: this URL is fetched by the server to draw the
  // image, and older invitations saved before lib/sanitize checked hosts.
  const photo = data?.photos?.find(
    (u) => typeof u === "string" && u.startsWith("https://firebasestorage.googleapis.com/")
  );

  // Every string drawn goes through v() — Tamil needs visual reordering.
  const eyebrow = v(t("youreInvited"));
  const cta = v(t("tapToOpen"));
  const text = [eyebrow, bride, groom, "&·", date, venue, cta, monogram.a, monogram.b ?? ""].join("");
  const fonts = await ogFonts(v(text) + text);
  const family = '"Display", "Tamil", serif';
  const longest = Math.max(bride.length, groom.length);
  const nameSize = photo ? (longest > 12 ? 52 : 66) : longest > 12 ? 60 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: deep,
          backgroundImage: `radial-gradient(circle at 50% -10%, ${accent}66, transparent 60%), radial-gradient(circle at 50% 120%, ${gold}33, transparent 55%)`,
          fontFamily: family,
          color: "#fff8ec",
          padding: 28,
        }}
      >
        {/* Double frame */}
        <div
          style={{
            flex: 1,
            display: "flex",
            border: `3px solid ${gold}`,
            padding: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              border: `1px solid ${gold}88`,
              padding: photo ? "0 48px 0 40px" : "0 60px",
              gap: 48,
            }}
          >
            {photo && (
              <img
                src={photo}
                alt=""
                width={340}
                height={470}
                style={{
                  objectFit: "cover",
                  borderRadius: "170px 170px 16px 16px",
                  border: `4px solid ${gold}`,
                }}
              />
            )}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  border: `2px solid ${gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  color: gold,
                  marginBottom: 10,
                }}
              >
                {v(monogram.b ? `${monogram.a}·${monogram.b}` : monogram.a)}
              </div>
              <div style={{ fontSize: 22, letterSpacing: locale === "ta" ? 0 : 7, color: gold }}>
                {locale === "ta" ? eyebrow : eyebrow.toUpperCase()}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontSize: nameSize,
                  fontWeight: 600,
                  lineHeight: 1.05,
                  marginTop: 8,
                }}
              >
                <div style={{ display: "flex" }}>{v(bride)}</div>
                {groom && (
                  <div style={{ display: "flex", fontSize: nameSize * 0.5, color: gold, fontWeight: 400 }}>
                    &
                  </div>
                )}
                {groom && <div style={{ display: "flex" }}>{v(groom)}</div>}
              </div>
              <div style={{ width: 220, height: 2, backgroundColor: gold, margin: "14px 0 10px" }} />
              {date && <div style={{ fontSize: 27 }}>{v(date)}</div>}
              {venue && <div style={{ fontSize: 21, opacity: 0.8, marginTop: 4 }}>{v(venue)}</div>}
              <div
                style={{
                  marginTop: 14,
                  padding: "8px 24px",
                  borderRadius: 999,
                  backgroundColor: gold,
                  color: deep,
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {cta}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}

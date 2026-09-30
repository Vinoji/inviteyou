import "server-only";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getFormatter, getTranslations } from "next-intl/server";
import type { InvitationData } from "./types";
import { getTemplateConfig } from "./templates";
import { getCategoryMeta } from "./i18n/categories";
import { getFamily } from "./family";
import { parseIsoDate } from "./calendar";
import { resolveMonogram } from "./monogram";
import { loadFonts, tamilVisualOrder as v } from "./ogFonts";
import { CARD_FONTS, cardOrnaments, getCardTheme, isDarkPaper } from "./cardTheme";

/** A5 portrait. */
export const CARD_RATIO = 1.4142;

/**
 * The invitation card as a PNG — one design used for the printable card
 * page, "Download card image", and the image shared on WhatsApp from the
 * guest list. Colours and ornament follow the template (lib/cardTheme.ts),
 * fonts follow the invitation's font pairing, and the wording follows the
 * occasion (its heading, event labels, family lines) in the invitation's
 * language.
 */
export async function renderCardImage({
  data,
  locale,
  inviteUrl,
  width,
}: {
  data: InvitationData;
  locale: "en" | "ta";
  inviteUrl: string;
  width: number;
}): Promise<ImageResponse> {
  const k = width / 1200;
  const height = Math.round(width * CARD_RATIO);
  const px = (n: number) => Math.round(n * k);

  const [t, tCategories, tCommon, tKin, tView, format] = await Promise.all([
    getTranslations({ locale, namespace: "invite.card" }),
    getTranslations({ locale, namespace: "categories" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "invite.kin" }),
    getTranslations({ locale, namespace: "invite.view" }),
    getFormatter({ locale }),
  ]);
  const template = getTemplateConfig(data.templateId);
  const category = getCategoryMeta(template.category, tCategories, template.id);
  const theme = getCardTheme(template.id);
  const dark = isDarkPaper(theme);
  // The couple's own accent colour when they changed it from the template's.
  const accent = data.accentColor && data.accentColor !== template.defaultAccent ? data.accentColor : theme.accent;
  const ornaments = cardOrnaments(theme);

  const bride = data.brideName || tCommon(category.singlePerson ? "friendFallback" : "brideFallback");
  const groom = category.singlePerson ? "" : data.groomName || tCommon("groomFallback");
  const monogram = resolveMonogram(bride, groom, data.monogram, category.singlePerson);
  const day = parseIsoDate(data.weddingDate);
  const date = day ? format.dateTime(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

  const events = [
    { label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue },
    {
      label: category.eventBLabel || (template.category === "wedding" ? tView("defaultReception") : ""),
      time: data.receptionTime,
      venue: data.receptionVenue,
    },
  ].filter((e) => e.label && (e.time || e.venue?.name));

  // One kin line per side ("Daughter of Mr. & Mrs. …") where the occasion has families.
  const kinLine = (side: "bride" | "groom") => {
    const m = getFamily(data, side)[0];
    if (!m?.name) return "";
    try {
      return tKin.markup(m.relation, { side, label: m.label || "", name: m.name, n: (chunks) => chunks });
    } catch {
      return "";
    }
  };
  const family =
    category.familyTitle && data.sections?.family !== false
      ? [kinLine("bride"), category.singlePerson ? "" : kinLine("groom")].filter(Boolean)
      : [];

  const qrSvg = await QRCode.toString(inviteUrl, {
    type: "svg",
    margin: 0,
    color: { dark: "#111111", light: "#ffffff" },
  });
  const qr = `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`;

  const pair = CARD_FONTS[data.fontPairing] ?? CARD_FONTS["classic-serif"];
  const script = pair.display[0] === "Great Vibes";
  const strings = [
    t("invited"), category.heroEyebrow, bride, groom, "&", category.label, t("request"), date, t("scan"),
    ...family, ...events.flatMap((e) => [e.label, e.time, e.venue?.name ?? "", e.venue?.address ?? ""]),
    monogram.a, monogram.b ?? "", inviteUrl, "·0123456789",
  ].join("");
  const fonts = await loadFonts(
    [
      { name: "Display", family: pair.display[0], weight: pair.display[1] },
      { name: "Body", family: pair.body[0], weight: pair.body[1] },
      { name: "Body", family: pair.body[0], weight: 700 },
      { name: "Tamil", family: "Catamaran", weight: 600 },
      { name: "Tamil", family: "Catamaran", weight: 400 },
    ],
    // Upper-cased too: labels are drawn in capitals, and a subset without
    // them would fall back to another font for those letters.
    v(strings) + strings + strings.toUpperCase()
  );
  const display = '"Display", "Tamil", serif';
  const body = '"Body", "Tamil", sans-serif';

  const longest = Math.max(bride.length, groom.length);
  const nameSize = px((script ? 124 : 96) * Math.min(1, Math.max(0.55, 12 / Math.max(longest, 1))));
  const caps = (s: string) => (locale === "ta" ? s : s.toUpperCase());
  const spacing = locale === "ta" ? 0 : px(5);

  return new ImageResponse(
    (
      <div style={{ width, height, display: "flex", background: theme.bg, padding: px(38), fontFamily: body }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            background: theme.paper,
            color: theme.ink,
            border: `${px(4)}px solid ${theme.trim}`,
            borderRadius: px(22),
            padding: `${px(190)}px ${px(90)}px ${px(60)}px`,
            textAlign: "center",
          }}
        >
          {/* inner hairline frame */}
          <div
            style={{
              position: "absolute",
              top: px(14),
              left: px(14),
              right: px(14),
              bottom: px(14),
              border: `${px(1.5)}px solid ${theme.trim}`,
              borderRadius: px(14),
              opacity: 0.6,
              display: "flex",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={ornaments.top} width={width - px(84)} height={px(180)} style={{ position: "absolute", top: px(4), left: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={ornaments.corner} width={px(140)} height={px(140)} style={{ position: "absolute", bottom: px(18), left: px(18) }} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img
            src={ornaments.corner}
            width={px(140)}
            height={px(140)}
            style={{ position: "absolute", bottom: px(18), right: px(18), transform: "scaleX(-1)" }}
          />

          {!category.singlePerson && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: px(92),
                height: px(92),
                borderRadius: px(46),
                border: `${px(2.5)}px solid ${theme.trim}`,
                color: accent,
                fontFamily: display,
                fontSize: px(34),
                marginBottom: px(18),
              }}
            >
              {v(monogram.b ? `${monogram.a}&${monogram.b}` : monogram.a)}
            </div>
          )}
          <div style={{ display: "flex", fontSize: px(26), letterSpacing: spacing, color: theme.trim, fontWeight: 700 }}>
            {v(caps(category.heroEyebrow))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: px(22),
              fontFamily: display,
              fontSize: nameSize,
              lineHeight: 1.08,
              color: accent,
            }}
          >
            <div style={{ display: "flex" }}>{v(bride)}</div>
            {groom && (
              <div style={{ display: "flex", fontSize: nameSize * 0.5, color: theme.trim, margin: `${px(4)}px 0` }}>&</div>
            )}
            {groom && <div style={{ display: "flex" }}>{v(groom)}</div>}
          </div>

          <div style={{ display: "flex", marginTop: px(18), fontSize: px(30), color: theme.muted, fontStyle: "italic" }}>
            {v(t("request"))}
          </div>

          {family.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: px(16), fontSize: px(24), color: theme.muted }}>
              {family.map((line) => (
                <div key={line} style={{ display: "flex" }}>
                  {v(line)}
                </div>
              ))}
            </div>
          )}

          {date && (
            <div
              style={{
                display: "flex",
                marginTop: px(30),
                padding: `${px(14)}px ${px(36)}px`,
                borderTop: `${px(2)}px solid ${theme.trim}`,
                borderBottom: `${px(2)}px solid ${theme.trim}`,
                fontSize: px(38),
                fontWeight: 700,
                color: theme.ink,
              }}
            >
              {v(date)}
            </div>
          )}

          {events.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: px(56), marginTop: px(34), width: "100%" }}>
              {events.map((e) => (
                <div key={e.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: px(440) }}>
                  <div style={{ display: "flex", fontSize: px(22), letterSpacing: spacing, color: theme.trim, fontWeight: 700 }}>
                    {v(caps(e.label))}
                  </div>
                  {e.time && <div style={{ display: "flex", marginTop: px(8), fontSize: px(32), fontWeight: 700 }}>{v(e.time)}</div>}
                  {e.venue?.name && (
                    <div style={{ display: "flex", marginTop: px(6), fontFamily: display, fontSize: px(script ? 40 : 30), color: accent }}>
                      {v(e.venue.name)}
                    </div>
                  )}
                  {e.venue?.address && (
                    <div style={{ display: "flex", marginTop: px(4), fontSize: px(22), color: theme.muted }}>{v(e.venue.address)}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: px(26), marginBottom: px(30) }}>
            <div
              style={{
                display: "flex",
                padding: px(12),
                background: "#ffffff",
                borderRadius: px(14),
                border: `${px(2)}px solid ${theme.trim}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img src={qr} width={px(176)} height={px(176)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: px(420), textAlign: "left" }}>
              <div style={{ display: "flex", fontSize: px(24), color: dark ? theme.ink : theme.muted }}>{v(t("scan"))}</div>
              <div style={{ display: "flex", marginTop: px(8), fontSize: px(20), color: theme.trim }}>
                {inviteUrl.replace(/^https?:\/\//, "")}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height, fonts: fonts.length ? fonts : undefined }
  );
}

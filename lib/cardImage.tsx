import "server-only";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getFormatter, getTranslations } from "next-intl/server";
import type { InvitationData } from "./types";
import { getTemplateConfig } from "./templates";
import { getCategoryMeta, withEventLabels } from "./i18n/categories";
import { getFamily } from "./family";
import { parseIsoDate } from "./calendar";
import { resolveMonogram } from "./monogram";
import { loadFonts, tamilVisualOrder as v } from "./ogFonts";
import { CARD_FONTS, cardOrnaments, getCardTheme, isDarkPaper } from "./cardTheme";
import { hasTamil, shapeTamil } from "./tamilText";

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
  watermark = false,
}: {
  data: InvitationData;
  locale: "en" | "ta";
  /** The invitation's link for the QR code. Leave out for a free card: a
   * small "Made with InviteForYou" line takes the QR code's place. */
  inviteUrl?: string;
  width: number;
  /** A faint diagonal brand mark, for cards shown before purchase. */
  watermark?: boolean;
}): Promise<ImageResponse> {
  const k = width / 1200;
  const height = Math.round(width * CARD_RATIO);
  const px = (n: number) => Math.round(n * k);

  const [t, tCategories, tCommon, tKin, tView, tValaikappu, format] = await Promise.all([
    getTranslations({ locale, namespace: "invite.card" }),
    getTranslations({ locale, namespace: "categories" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "invite.kin" }),
    getTranslations({ locale, namespace: "invite.view" }),
    getTranslations({ locale, namespace: "premium.valaikappu" }),
    getFormatter({ locale }),
  ]);
  const template = getTemplateConfig(data.templateId);
  const category = withEventLabels(getCategoryMeta(template.category, tCategories, template.id), data);
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
    // Velum Mayilum doesn't print the seed's sample family (as on its page).
    if (template.id === "velum-mayilum-valaikappu" && m.name.trim() === tValaikappu("sampleHosts")) return "";
    // "குடும்பத்தினர் அவர்களின் நல்லாசியுடன்" → "குடும்பத்தினரின் நல்லாசியுடன்":
    // a plural like குடும்பத்தினர் / பெற்றோர் takes -இன் directly.
    if (locale === "ta" && m.relation === "blessings" && /(?:த்தினர்|பெற்றோர்)$/.test(m.name.trim())) {
      return `${m.name.trim().slice(0, -1)}ின் நல்லாசியுடன்`;
    }
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

  const qr = inviteUrl
    ? `data:image/svg+xml;utf8,${encodeURIComponent(
        await QRCode.toString(inviteUrl, { type: "svg", margin: 0, color: { dark: "#111111", light: "#ffffff" } })
      )}`
    : null;
  const madeWith = "Made with InviteForYou · inviteforyou.in";

  const pair = CARD_FONTS[data.fontPairing] ?? CARD_FONTS["classic-serif"];
  const script = pair.display[0] === "Great Vibes";
  const strings = [
    t("invited"), category.heroEyebrow, bride, groom, "&", category.label, t("request"), date, t("scan"),
    ...family, ...events.flatMap((e) => [e.label, e.time, e.venue?.name ?? "", e.venue?.address ?? ""]),
    monogram.a, monogram.b ?? "", inviteUrl ?? madeWith, "·0123456789",
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

  // One line of text: Tamil is drawn shaped by sharp (lib/tamilText.ts) and
  // placed as an image; anything else, or if that fails, is Satori text.
  const textWidth = px(940);
  async function line(
    text: string,
    o: {
      size: number;
      color: string;
      weight?: 400 | 600 | 700;
      family?: string;
      italic?: boolean;
      spacing?: number;
      marginTop?: number;
      maxWidth?: number;
      align?: "left" | "centre";
    }
  ) {
    const box = { display: "flex", marginTop: o.marginTop ?? 0 } as const;
    if (text && hasTamil(text)) {
      try {
        const img = await shapeTamil(text, {
          size: o.size,
          color: o.color,
          weight: o.weight ?? 400,
          maxWidth: o.maxWidth ?? textWidth,
          align: o.align,
        });
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img src={img.src} width={img.width} height={img.height} style={box} />;
      } catch (err) {
        console.error("[card] tamil text", err);
      }
    }
    return (
      <div
        style={{
          ...box,
          fontSize: o.size,
          color: o.color,
          fontWeight: o.weight ?? 400,
          fontFamily: o.family ?? body,
          fontStyle: o.italic ? "italic" : "normal",
          letterSpacing: o.spacing ?? 0,
          maxWidth: o.maxWidth ?? textWidth,
          justifyContent: "center",
        }}
      >
        {v(text)}
      </div>
    );
  }

  const longest = Math.max(bride.length, groom.length);
  const nameSize = px((script ? 124 : 96) * Math.min(1, Math.max(0.55, 12 / Math.max(longest, 1))));
  const caps = (s: string) => (locale === "ta" ? s : s.toUpperCase());
  const spacing = locale === "ta" ? 0 : px(5);

  // Fewer lines, bigger type: a one-function card fills the page.
  const lines = family.length + events.length * 3 + (groom ? 2 : 0);
  const grow = lines <= 4 ? 1.3 : lines <= 7 ? 1.15 : 1;
  const g = (n: number) => px(n * grow);
  const nameFamily = display;
  const [eyebrowEl, brideEl, groomEl, requestEl, dateEl, scanEl, ...familyEls] = await Promise.all([
    line(caps(category.heroEyebrow), { size: g(26), color: theme.trim, weight: 700, spacing }),
    line(bride, { size: Math.round(nameSize * grow), color: accent, weight: 700, family: nameFamily }),
    groom ? line(groom, { size: Math.round(nameSize * grow), color: accent, weight: 700, family: nameFamily }) : Promise.resolve(null),
    line(t("request"), { size: g(30), color: theme.muted, italic: true, marginTop: g(20) }),
    date ? line(date, { size: g(38), color: theme.ink, weight: 700 }) : Promise.resolve(null),
    line(t("scan"), { size: px(24), color: dark ? theme.ink : theme.muted, maxWidth: px(420), align: "left" }),
    ...family.map((l) => line(l, { size: g(26), color: theme.muted })),
  ]);
  const eventEls = await Promise.all(
    events.map(async (e) => ({
      key: e.label,
      label: await line(caps(e.label), { size: g(24), color: theme.trim, weight: 700, spacing, maxWidth: px(440) }),
      time: e.time ? await line(e.time, { size: g(34), color: theme.ink, weight: 700, marginTop: g(8), maxWidth: px(440) }) : null,
      venue: e.venue?.name
        ? await line(e.venue.name, { size: g(script ? 40 : 34), color: accent, weight: 600, family: display, marginTop: g(6), maxWidth: events.length > 1 ? px(440) : textWidth })
        : null,
      address: e.venue?.address
        ? await line(e.venue.address, { size: g(24), color: theme.muted, marginTop: g(4), maxWidth: events.length > 1 ? px(440) : textWidth })
        : null,
    }))
  );

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

          {/* Everything but the footer, centred in the space below the
              thoranam so short cards don't leave the bottom half empty. */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
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
            {eyebrowEl}

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: g(24), lineHeight: 1.08 }}>
              {brideEl}
              {groom && (
                <div style={{ display: "flex", fontFamily: display, fontSize: nameSize * grow * 0.5, color: theme.trim, margin: `${px(4)}px 0` }}>&</div>
              )}
              {groomEl}
            </div>

            {requestEl}

            {familyEls.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: g(18) }}>{familyEls}</div>
            )}

            {dateEl && (
              <div
                style={{
                  display: "flex",
                  marginTop: g(36),
                  padding: `${g(14)}px ${g(36)}px`,
                  borderTop: `${px(2)}px solid ${theme.trim}`,
                  borderBottom: `${px(2)}px solid ${theme.trim}`,
                }}
              >
                {dateEl}
              </div>
            )}

            {eventEls.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: px(56), marginTop: g(44), width: "100%" }}>
                {eventEls.map((e) => (
                  <div key={e.key} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {e.label}
                    {e.time}
                    {e.venue}
                    {e.address}
                  </div>
                ))}
              </div>
            )}
          </div>

          {qr && inviteUrl ? (
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
                {scanEl}
                <div style={{ display: "flex", marginTop: px(8), fontSize: px(20), color: theme.trim }}>
                  {inviteUrl.replace(/^https?:\/\//, "")}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", marginBottom: px(34), fontSize: px(20), letterSpacing: px(1), color: dark ? theme.ink : theme.muted, opacity: 0.75 }}>
              {madeWith}
            </div>
          )}
        </div>
        {watermark && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: px(120),
                fontWeight: 700,
                letterSpacing: px(6),
                color: "rgba(128,128,128,0.035)",
                transform: "rotate(-30deg)",
              }}
            >
              InviteForYou
            </div>
          </div>
        )}
      </div>
    ),
    { width, height, fonts: fonts.length ? fonts : undefined }
  );
}

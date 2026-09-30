import { useFormatter, useTranslations } from "next-intl";
import { hasInvocation, type LayoutStyleId } from "@/lib/layoutStyles";
import { nameFitScale, scriptLang } from "@/lib/monogram";
import type { RoyalPalette } from "../royal/palettes";
import RoyalCountdown from "../royal/RoyalCountdown";
import IntroSweep from "../motion/IntroSweep";
import { Sky } from "../motion/scenery";
import { heroArt } from "./heroArt";
import st from "./styleHero.module.css";

/** Local-noon date so the day never shifts across time zones. */
function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

/**
 * The hero of a layout-style template (lib/layoutStyles.ts): its own art
 * above and below, the tradition's invocation (a blessing, a verse, the
 * Bismillah), the lead line, names, countdown and date — framed and
 * patterned per style in styleHero.module.css. Replaces the royal layout's
 * toran-and-mandapam hero for these templates.
 */
export default function StyleHero({
  layout,
  templateId,
  singlePerson,
  palette,
  brideName,
  groomName,
  weddingDate,
  showCountdown,
}: {
  layout: LayoutStyleId;
  templateId: string;
  /** Birthday, baby, housewarming, corporate: one name, no "weds". */
  singlePerson: boolean;
  palette: RoyalPalette;
  brideName: string;
  groomName: string;
  weddingDate: string;
  showCountdown: boolean;
}) {
  // A template's own wording (`invite.templateText.<id>`) — occasions share
  // looks but not words — else its layout style's (`invite.styles.<look>`).
  const tTemplate = useTranslations("invite.templateText");
  const tStyle = useTranslations(`invite.styles.${layout}`);
  const own = tTemplate.has(`${templateId}.lead`);
  const t = (key: string) => (own ? tTemplate(`${templateId}.${key}`) : tStyle(key));
  const has = (key: string) => (own ? tTemplate.has(`${templateId}.${key}`) : key !== "invocationNote" || hasInvocation(layout));
  const invocationText = (own ? tTemplate.has(`${templateId}.invocation`) : hasInvocation(layout)) ? t("invocation") : "";
  // Arabic (the Bismillah) reads right to left, in its own font.
  const rtl = /[\u0600-\u06FF]/.test(invocationText);
  const tHero = useTranslations("invite.hero");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const date = parseDate(weddingDate);
  const art = heroArt(layout, palette);

  return (
    <section className={st.hero} data-style={layout}>
      <Sky at="hero" />
      <div className={st.frame}>
        <div className={st.top}>{art.top}</div>
        <div className={st.content}>
          {invocationText && (
            <div className={st.invocation}>
              <p dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : undefined} className={rtl ? st.arabic : undefined}>
                {invocationText}
              </p>
              {has("invocationNote") && <p className={st.invocationNote}>{t("invocationNote")}</p>}
            </div>
          )}
          <p className={st.lead}>{t("lead")}</p>
          <h1
            className={st.names}
            lang={scriptLang(`${brideName} ${groomName}`)}
            style={{ ["--name-fit" as string]: nameFitScale(brideName, singlePerson ? "" : groomName) }}
          >
            <IntroSweep className={st.name}>
              {brideName || tCommon(singlePerson ? "friendFallback" : "brideFallback")}
            </IntroSweep>
            {!singlePerson && (
              <>
                <span className={st.weds}>{t("weds")}</span>
                <IntroSweep className={st.name}>{groomName || tCommon("groomFallback")}</IntroSweep>
              </>
            )}
          </h1>
          {weddingDate && showCountdown && (
            <div className={st.countdown}>
              <RoyalCountdown targetDate={weddingDate} />
            </div>
          )}
          <p className={st.when}>
            {date
              ? format.dateTime(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
              : tHero("dateTba")}
          </p>
        </div>
        <div className={st.bottom}>{art.bottom}</div>
      </div>
      <div className={st.scrollCue} aria-hidden>
        ⌄
      </div>
    </section>
  );
}

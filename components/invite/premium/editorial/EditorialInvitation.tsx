import type { CSSProperties, ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Scissors } from "lucide-react";
import { getFamily } from "@/lib/family";
import { directionsUrl } from "@/lib/maps";
import { scriptLang } from "@/lib/monogram";
import { getFontPairing } from "@/lib/fontPairings";
import { getTemplateConfig } from "@/lib/templates";
import { EMPTY_TRAVEL, withDefaultSections } from "@/lib/types";
import FamilyLines from "../../FamilyLines";
import IntroHost from "../../intros/IntroHost";
import AudioToggle from "../../AudioToggle";
import RsvpForm from "../../RsvpForm";
import AddToCalendar from "../../AddToCalendar";
import GuestGallery from "../../GuestGallery";
import ThingsToKnow from "../../ThingsToKnow";
import BlessingsWall from "../../BlessingsWall";
import ShareBox from "../../ShareBox";
import Section from "../../motion/Section";
import ArtImage, { artSrc } from "../ArtImage";
import { parseDate, type PremiumProps } from "../types";
import m from "../materials.module.css";
import s from "./editorial.module.css";

/**
 * Luxe Editorial — the invitation as a fashion magazine's wedding issue.
 * The couple's own photo is the cover under a Didone masthead of their
 * names, with cover lines, issue number and barcode; inside are a contents
 * page, a feature on their story with a pull quote, "The Agenda", a photo
 * portfolio, "The Guide" and a tear-out reply card. Realism comes from the
 * couple's photos and print typography, so it needs almost no painted art.
 *
 * Art slots (public/art/luxe-editorial/, see docs/template-art.md): cover —
 * a sample cover photo shown until the couple adds their own.
 */
export default function EditorialInvitation({
  data,
  slug,
  mode,
  category,
  occasionTitle,
  coupleLabel,
  rsvpMessages,
  guestPhotos,
  guestGreeting,
}: PremiumProps) {
  const t = useTranslations("premium.editorial");
  const tView = useTranslations("invite.view");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const id = data.templateId;
  const font = getFontPairing(data.fontPairing);
  const sections = withDefaultSections(data.sections);
  const travel = data.travel ?? EMPTY_TRAVEL;
  const places = data.places ?? [];
  const date = parseDate(data.weddingDate);
  const a = data.brideName || tCommon("brideFallback");
  const b = data.groomName || tCommon("groomFallback");
  const photos = data.photos ?? [];
  const cover = photos[0] || artSrc(id, "cover");
  const brideFamily = getFamily(data, "bride");
  const groomFamily = getFamily(data, "groom");
  const eventBLabel = category.eventBLabel || tView("defaultReception");
  const events = [
    { label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue },
    { label: eventBLabel, time: data.receptionTime, venue: data.receptionVenue },
  ];
  const agenda = events.filter((e) => e.time || e.venue?.name);
  const storyParas = (data.story ?? "").split(/\n{2,}/).filter(Boolean);
  // The pull quote is the story's first sentence.
  const pullQuote = storyParas[0]?.match(/^.{20,160}?[.!?।](\s|$)/)?.[0].trim() ?? "";
  const hasGuide =
    (sections.travel && (travel.airports.length > 0 || (travel.stations ?? []).length > 0)) ||
    (sections.places && places.length > 0);

  const shortDate = date
    ? `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getFullYear()).slice(2)}`
    : "—";
  const issueMonth = date ? format.dateTime(date, { month: "long", year: "numeric" }) : "";
  const longDate = date
    ? format.dateTime(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : t("dateTba");

  // Contents: only the pages this issue actually has.
  const contents = [
    sections.story && storyParas.length > 0 && { key: "story", title: category.storyTitle || t("story") },
    sections.family && brideFamily.length + groomFamily.length > 0 && { key: "family", title: t("families") },
    sections.schedule && agenda.length > 0 && { key: "agenda", title: t("agenda") },
    sections.gallery && photos.length > 2 && { key: "portfolio", title: t("portfolio") },
    hasGuide && { key: "guide", title: t("guide") },
    sections.rsvp && { key: "reply", title: t("reply") },
  ].filter(Boolean) as { key: string; title: string }[];
  const page = (key: string) => String(4 + contents.findIndex((c) => c.key === key) * 6).padStart(2, "0");

  const style = {
    "--e-display": font.headingVar,
    "--e-body": font.bodyVar,
    "--inv-heading": font.headingVar,
    "--accent": data.accentColor,
  } as CSSProperties;

  return (
    <div data-invite-root className={s.root} style={style}>
      <IntroHost
        introId={getTemplateConfig(id).intro}
        templateId={id}
        slug={slug}
        preview={mode === "preview"}
        weddingDate={data.weddingDate}
        brideName={data.brideName}
        groomName={data.groomName}
        singlePerson={category.singlePerson}
        accentColor={data.accentColor}
        fontPairing={data.fontPairing}
        monogram={data.monogram}
        greeting={guestGreeting}
      />
      {mode === "public" && (
        <AudioToggle src={data.backgroundMusic || undefined} templateId={id} accentColor={data.accentColor} />
      )}

      {/* ── Cover ── */}
      <section className={`${s.cover} ${cover ? s.hasPhoto : m.paper}`}>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={s.coverPhoto} src={cover} alt={coupleLabel} fetchPriority="high" />
        )}
        <div className={s.coverTop}>
          <p className={s.issueLine}>
            <span>{t("issue")}</span>
            <span>{issueMonth}</span>
            <span>{t("price")}</span>
          </p>
          <h1 className={s.masthead} lang={scriptLang(`${a} ${b}`)}>
            <span>{a}</span>
            <span className={s.amp}>&amp;</span>
            <span>{b}</span>
          </h1>
        </div>

        {!cover && (
          // No photo yet: the couple's initials, blind-embossed into the cover stock.
          <p className={`${s.coverMonogram} ${m.emboss}`} aria-hidden>
            {(data.monogram?.a || a.charAt(0)) + (data.monogram?.b || b.charAt(0))}
          </p>
        )}

        <div className={s.coverLines}>
          <p className={s.exclusive}>{t("exclusive")}</p>
          <p className={s.bigDate}>{shortDate}</p>
          <p className={s.coverLine}>{t("coverDate", { date: longDate })}</p>
          {data.ceremonyVenue?.name && (
            <p className={s.coverLine}>{t("coverVenue", { venue: data.ceremonyVenue.name })}</p>
          )}
          {storyParas.length > 0 && <p className={s.coverLine}>{t("coverStory", { page: page("story") })}</p>}
        </div>

        <div className={s.barcode} aria-hidden>
          <span className={s.bars} />
          <span className={s.barDigits}>{(data.weddingDate || "000000").replace(/-/g, "")}</span>
        </div>
      </section>

      <div className={`${s.inside} ${m.paper}`}>
        {/* ── Contents ── */}
        <section className={s.contents}>
          <p className={s.folio}>
            <span>{t("contents")}</span>
            <span>02</span>
          </p>
          <h2 className={s.contentsTitle}>{t("inThisIssue")}</h2>
          <ol className={s.contentsList}>
            {contents.map((c) => (
              <li key={c.key}>
                <span className={s.pageNo}>{page(c.key)}</span>
                <span className={s.contentsName}>{c.title}</span>
              </li>
            ))}
          </ol>
          <p className={s.editorsNote}>{t("editorsNote", { names: coupleLabel })}</p>
        </section>

        {/* ── Feature: their story ── */}
        {sections.story && storyParas.length > 0 && (
          <Section index={1}>
            <article className={s.feature}>
              <Folio label={t("feature")} page={page("story")} />
              <h2 className={s.featureTitle}>{category.storyTitle || t("story")}</h2>
              <p className={s.standfirst}>{t("standfirst", { a, b })}</p>
              {photos[1] && (
                <figure className={s.featurePhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[1]} alt="" loading="lazy" />
                  <figcaption>{t("caption", { names: coupleLabel })}</figcaption>
                </figure>
              )}
              <div className={s.columns}>
                {storyParas.map((p, i) => (
                  <p key={i} className={i === 0 ? s.dropCap : undefined} lang={scriptLang(p)}>
                    {p}
                  </p>
                ))}
              </div>
              {pullQuote && (
                <blockquote className={s.pullQuote} lang={scriptLang(pullQuote)}>
                  {pullQuote}
                </blockquote>
              )}
            </article>
          </Section>
        )}

        {/* ── Families, as a masthead credits box ── */}
        {sections.family && brideFamily.length + groomFamily.length > 0 && (
          <Section index={2}>
            <section className={s.credits}>
              <Folio label={t("families")} page={page("family")} />
              <div className={s.creditsGrid}>
                {[
                  { name: a, members: brideFamily, side: "bride" as const },
                  { name: b, members: groomFamily, side: "groom" as const },
                ].map((p) => (
                  <div key={p.side} className={s.creditCol}>
                    <p className={s.creditName} lang={scriptLang(p.name)}>
                      {p.name}
                    </p>
                    <FamilyLines members={p.members} side={p.side} lineClassName={s.creditLine} nameClassName={s.creditStrong} />
                  </div>
                ))}
              </div>
            </section>
          </Section>
        )}

        {/* ── The Agenda ── */}
        {sections.schedule && agenda.length > 0 && (
          <Section index={3}>
            <section className={s.agenda}>
              <Folio label={t("agenda")} page={page("agenda")} />
              <h2 className={s.sectionTitle}>{t("agendaTitle")}</h2>
              <p className={s.agendaDate}>{longDate}</p>
              <div className={s.agendaTable}>
                {agenda.map((e, i) => {
                  const href = directionsUrl(e.venue);
                  return (
                    <div key={i} className={s.agendaRow}>
                      <p className={s.agendaTime}>{e.time || "—"}</p>
                      <div>
                        <p className={s.agendaEvent} lang={scriptLang(e.label)}>
                          {e.label}
                        </p>
                        {e.venue?.name && <p className={s.agendaVenue}>{e.venue.name}</p>}
                        {e.venue?.address && <p className={s.agendaAddress}>{e.venue.address}</p>}
                        {href && e.venue?.name && (
                          <a className={s.textLink} href={href} target="_blank" rel="noopener noreferrer">
                            {t("directions")} →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <AddToCalendar
                slug={slug}
                title={occasionTitle}
                date={data.weddingDate}
                events={events}
                classes={{ wrap: s.calendar, row: s.calendarRow, button: s.outlineButton, hint: s.calendarHint }}
              />
            </section>
          </Section>
        )}

        {/* ── Portfolio ── */}
        {sections.gallery && photos.length > 2 && (
          <Section index={4}>
            <section className={s.portfolio}>
              <Folio label={t("portfolio")} page={page("portfolio")} />
              <div className={s.plates}>
                {photos.slice(2, 8).map((src, i) => (
                  <figure key={src} className={s.plate}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" />
                    <figcaption>{t("plate", { n: String(i + 1).padStart(2, "0") })}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </Section>
        )}

        {/* ── The Guide ── */}
        {hasGuide && (
          <Section index={5}>
            <section className={s.guide}>
              <Folio label={t("guide")} page={page("guide")} />
              <h2 className={s.sectionTitle}>{travel.city ? t("guideCity", { city: travel.city }) : t("guideTitle")}</h2>
              <div className={s.guideGrid}>
                {sections.travel && travel.airports.length > 0 && (
                  <GuideCol title={t("byAir")}>
                    {travel.airports.map((x, i) => (
                      <GuideItem key={i} name={`${x.code} · ${x.name}`} meta={x.distance} />
                    ))}
                  </GuideCol>
                )}
                {sections.travel && (travel.stations ?? []).length > 0 && (
                  <GuideCol title={t("byTrain")}>
                    {(travel.stations ?? []).map((x, i) => (
                      <GuideItem key={i} name={`${x.code} · ${x.name}`} meta={x.distance} />
                    ))}
                  </GuideCol>
                )}
                {sections.places && places.length > 0 && (
                  <GuideCol title={t("seeAndDo")}>
                    {places.map((p, i) => (
                      <GuideItem key={i} name={p.title} meta={p.distance} text={p.description} />
                    ))}
                  </GuideCol>
                )}
              </div>
            </section>
          </Section>
        )}

        {sections.faq && (data.faq ?? []).length > 0 && (
          <div className={s.shared}>
            <ThingsToKnow faq={data.faq ?? []} accentColor={data.accentColor} fontPairing={data.fontPairing} templateId={id} />
          </div>
        )}
        {sections.guestPhotos && (
          <div className={s.shared}>
            <GuestGallery
              slug={slug}
              photos={guestPhotos}
              accentColor={data.accentColor}
              fontPairing={data.fontPairing}
              templateId={id}
              mode={mode}
            />
          </div>
        )}

        {/* ── Tear-out reply card ── */}
        {sections.rsvp && (
          <Section index={6}>
            <section className={s.replyWrap}>
              <p className={s.cutLine} aria-hidden>
                <Scissors size={14} />
              </p>
              <div className={s.reply}>
                <RsvpForm
                  slug={slug}
                  accentColor="#111111"
                  templateId={id}
                  brideName={data.brideName}
                  groomName={data.groomName}
                  mode={mode}
                  initialName={guestGreeting}
                  header={
                    <div key="reply-head" className={s.replyHead}>
                      <p className={s.replyKicker}>{t("replyKicker")}</p>
                      <h2>{t("replyTitle")}</h2>
                      <p>{t("replySub")}</p>
                    </div>
                  }
                  classes={{
                    section: s.replyForm,
                    label: s.formLabel,
                    input: s.formInput,
                    button: s.formButton,
                    thanksCard: s.thanksCard,
                    thanksTitle: s.thanksTitle,
                    thanksBody: s.thanksBody,
                    note: s.formNote,
                  }}
                />
              </div>
            </section>
          </Section>
        )}

        {sections.rsvp && mode === "public" && rsvpMessages.length > 0 && (
          <div className={s.shared}>
            <BlessingsWall messages={rsvpMessages} accentColor={data.accentColor} fontPairing={data.fontPairing} templateId={id} />
          </div>
        )}
        {mode === "public" && (
          <div className={s.shared}>
            <ShareBox
              slug={slug}
              occasionTitle={occasionTitle}
              accentColor={data.accentColor}
              weddingDate={data.weddingDate}
              hosts={coupleLabel}
              events={events}
            />
          </div>
        )}
      </div>

      {/* ── Back cover ── */}
      <section className={s.backCover}>
        <p className={s.backKicker}>{t("backKicker")}</p>
        <p className={s.backTitle}>{t("thanks")}</p>
        <p className={s.backNames} lang={scriptLang(coupleLabel)}>
          {coupleLabel}
        </p>
        <ArtImage templateId={id} slot="monogram" className={s.backArt} />
      </section>
      <footer className={s.footer}>{tView("madeWith", { couple: coupleLabel })}</footer>
    </div>
  );
}

function Folio({ label, page }: { label: string; page: string }) {
  return (
    <p className={s.folio}>
      <span>{label}</span>
      <span>{page}</span>
    </p>
  );
}

function GuideCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={s.guideCol}>
      <p className={s.guideHead}>{title}</p>
      {children}
    </div>
  );
}

function GuideItem({ name, meta, text }: { name: string; meta?: string; text?: string }) {
  return (
    <div className={s.guideItem}>
      <p>
        <b lang={scriptLang(name)}>{name}</b>
        {meta && <span>{meta}</span>}
      </p>
      {text && <p className={s.guideText}>{text}</p>}
    </div>
  );
}

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import QRCode from "qrcode";
import {
  getTranslations,
  getFormatter,
  setRequestLocale,
} from "next-intl/server";
import { getAdminDb } from "@/lib/firebase-admin";
import type { ContentLocale, InvitationData } from "@/lib/types";
import { getTemplateConfig } from "@/lib/templates";
import { getFontPairing } from "@/lib/fontPairings";
import { getCategoryMeta, formatOccasionTitle } from "@/lib/i18n/categories";
import { getRoyalPalette } from "@/components/invite/royal/palettes";
import { parseIsoDate } from "@/lib/calendar";
import { resolveMonogram, scriptLang } from "@/lib/monogram";
import PrintButton from "./PrintButton";
import s from "./card.module.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function getInvitation(slug: string) {
  const snap = await getAdminDb().collection("invitations").doc(slug).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.status !== "published") return null;
  return data as InvitationData;
}

/**
 * A printable A5 card for the invitation — names, date, events and a QR
 * code back to the live page. Printing (or "Save as PDF" in the browser's
 * print dialog) gives the PDF; no PDF library needed, and text stays
 * selectable and sharp at any size. Worded in the invitation's language.
 */
export default async function InvitationCardPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: routeLocale, slug } = await params;
  setRequestLocale(routeLocale);
  const data = await getInvitation(slug);
  if (!data) notFound();
  const locale: ContentLocale =
    data.contentLocale ?? (routeLocale === "ta" ? "ta" : "en");

  const [t, tCategories, tCommon, tView, format] = await Promise.all([
    getTranslations({ locale, namespace: "invite.card" }),
    getTranslations({ locale, namespace: "categories" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "invite.view" }),
    getFormatter({ locale }),
  ]);
  const template = getTemplateConfig(data.templateId);
  const category = getCategoryMeta(template.category, tCategories);
  const title = formatOccasionTitle(
    category,
    data.brideName,
    data.groomName,
    tCommon,
  );
  const font = getFontPairing(data.fontPairing);
  const palette = getRoyalPalette(
    template.category === "wedding" ? data.templateId : "",
  );
  const isWedding = template.category === "wedding";
  const monogram = resolveMonogram(
    data.brideName,
    data.groomName,
    data.monogram,
    category.singlePerson,
  );

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const inviteUrl = `${proto}://${host}/invite/${slug}`;
  const qrSvg = await QRCode.toString(inviteUrl, {
    type: "svg",
    margin: 0,
    color: { dark: "#111111", light: "#00000000" },
  });

  const day = parseIsoDate(data.weddingDate);
  const events = [
    {
      label: category.eventALabel,
      time: data.ceremonyTime,
      venue: data.ceremonyVenue,
    },
    {
      label: category.eventBLabel || tView("defaultReception"),
      time: data.receptionTime,
      venue: data.receptionVenue,
    },
  ].filter((e) => e.label && (e.time || e.venue?.name));

  const style = {
    "--card-ink": isWedding ? palette.text : "#1f1f1f",
    "--card-muted": isWedding ? palette.muted : "#6b6b6b",
    "--card-paper": isWedding ? palette.ivory : "#fffdf8",
    "--card-trim": isWedding ? palette.gold : data.accentColor,
    "--card-trim-deep": isWedding ? palette.goldDeep : data.accentColor,
    "--card-accent": data.accentColor,
    "--card-heading": font.headingVar,
    "--card-body": font.bodyVar,
  } as React.CSSProperties;

  const names = category.singlePerson
    ? [data.brideName || tCommon("friendFallback")]
    : [
        data.brideName || tCommon("brideFallback"),
        data.groomName || tCommon("groomFallback"),
      ];

  return (
    <main className={s.page} lang={locale} style={style}>
      <div className={s.toolbar}>
        <a href={`/invite/${slug}`} className={s.back}>
          ← {t("back")}
        </a>
        <PrintButton label={t("print")} />
      </div>
      <p className={s.hint}>{t("hint")}</p>

      <article className={s.card} aria-label={t("metaTitle", { title })}>
        <div className={s.frame}>
          {isWedding && (
            <div
              className={s.monogram}
              lang={scriptLang(`${monogram.a}${monogram.b ?? ""}`)}
            >
              {monogram.a}
              {monogram.b && <span className={s.amp}>&</span>}
              {monogram.b}
            </div>
          )}
          <p className={s.eyebrow}>{t("invited")}</p>
          <h1 className={s.names}>
            {names.map((n, i) => (
              <span key={i} lang={scriptLang(n)}>
                {i > 0 && <span className={s.and}>&</span>}
                {n}
              </span>
            ))}
          </h1>
          <p className={s.request}>{t("request")}</p>
          {day && (
            <p className={s.date}>
              {format.dateTime(day, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {events.length > 0 && (
            <div className={s.events}>
              {events.map((e) => (
                <div key={e.label} className={s.event}>
                  <p className={s.eventLabel}>{e.label}</p>
                  {e.time && <p className={s.eventTime}>{e.time}</p>}
                  {e.venue?.name && <p className={s.venue}>{e.venue.name}</p>}
                  {e.venue?.address && (
                    <p className={s.address}>{e.venue.address}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={s.qrRow}>
            <div className={s.qr} dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <div className={s.qrText}>
              <p>{t("scan")}</p>
              <p className={s.url}>{inviteUrl.replace(/^https?:\/\//, "")}</p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}

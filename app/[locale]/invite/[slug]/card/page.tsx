import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getTranslations, getFormatter, setRequestLocale } from "next-intl/server";
import { getAdminDb } from "@/lib/firebase-admin";
import type { ContentLocale, InvitationData } from "@/lib/types";
import { getTemplateConfig } from "@/lib/templates";
import { getCategoryMeta, formatOccasionTitle } from "@/lib/i18n/categories";
import { parseIsoDate } from "@/lib/calendar";
import { buildWhatsAppMessage } from "@/lib/inviteMessage";
import ShareCardButton from "@/components/invite/ShareCardButton";
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
 * The printable invitation card. The card itself is the image from
 * /invite/<slug>/card/image (lib/cardImage.tsx) — themed to the template,
 * in the invitation's fonts and language — so what's printed, downloaded
 * and shared on WhatsApp is always the same card. Print → "Save as PDF"
 * gives an A5 PDF at print resolution.
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
  const locale: ContentLocale = data.contentLocale ?? (routeLocale === "ta" ? "ta" : "en");

  const [t, tCategories, tCommon, tWhatsApp, format] = await Promise.all([
    getTranslations({ locale, namespace: "invite.card" }),
    getTranslations({ locale, namespace: "categories" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "invite.whatsapp" }),
    getFormatter({ locale }),
  ]);
  const template = getTemplateConfig(data.templateId);
  const category = getCategoryMeta(template.category, tCategories, template.id);
  const title = formatOccasionTitle(category, data.brideName, data.groomName, tCommon);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const inviteUrl = `${proto}://${host}/invite/${slug}`;

  const day = parseIsoDate(data.weddingDate);
  const message = buildWhatsAppMessage(tWhatsApp, {
    kind: "invite",
    title,
    date: day ? format.dateTime(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "",
    events: [
      { label: category.eventALabel, time: data.ceremonyTime, venue: data.ceremonyVenue?.name ?? "" },
      ...(category.eventBLabel
        ? [{ label: category.eventBLabel, time: data.receptionTime, venue: data.receptionVenue?.name ?? "" }]
        : []),
    ],
    url: inviteUrl,
    hosts: category.singlePerson ? data.brideName : [data.brideName, data.groomName].filter(Boolean).join(" & "),
  });

  const image = `/invite/${slug}/card/image`;
  const fileName = `${slug}-invitation-card.png`;

  return (
    <main className={s.page} lang={locale}>
      <div className={s.toolbar}>
        <a href={`/invite/${slug}`} className={s.back}>
          ← {t("back")}
        </a>
        <div className={s.actions}>
          <ShareCardButton
            imageUrl={`${image}?w=1200`}
            fileName={fileName}
            text={message}
            label={t("shareWa")}
            hint={t("copiedHint")}
            className={s.wa}
          />
          <a href={`${image}?w=1748&download=1`} className={s.ghost}>
            <Download size={15} aria-hidden />
            {t("download")}
          </a>
          <PrintButton label={t("print")} />
        </div>
      </div>
      <p className={s.hint}>{t("hint")}</p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${image}?w=1748`} alt={t("metaTitle", { title })} className={s.cardImg} />
    </main>
  );
}

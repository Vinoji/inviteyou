import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { TEMPLATE_IDS } from "@/lib/templates";
import { getDefaultInvitationData } from "@/lib/i18n/defaultContent";
import { INVITATION_NAMESPACES, getContentMessages } from "@/lib/i18n/contentMessages";
import InvitationView from "@/components/invite/InvitationView";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * /sample/<templateId> — a design filled with its sample content, full
 * window, as a guest sees it. Not linked anywhere: it's where the gallery
 * snapshots are taken (scripts/snap-thumbs.mjs). Preview mode, so its
 * forms are disabled and nothing is counted or saved.
 */
export default async function SamplePage({ params }: { params: Promise<{ locale: string; templateId: string }> }) {
  const { locale: routeLocale, templateId } = await params;
  if (!TEMPLATE_IDS.includes(templateId)) notFound();
  setRequestLocale(routeLocale);
  const locale = routeLocale === "ta" ? "ta" : "en";
  const [tDefaults, messages] = await Promise.all([
    getTranslations({ locale, namespace: "defaultContent" }),
    getContentMessages(locale, INVITATION_NAMESPACES, templateId),
  ]);
  const data = { ...getDefaultInvitationData(templateId, tDefaults), contentLocale: locale } as const;
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <main className="min-h-dvh" lang={locale}>
        <InvitationView data={data} slug="sample" mode="preview" />
      </main>
    </NextIntlClientProvider>
  );
}

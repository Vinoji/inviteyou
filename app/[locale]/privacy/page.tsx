import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageAlternates } from "@/lib/seo";
import LegalPage from "@/components/site/LegalPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.privacy" });
  return { title: t("metaTitle"), description: t("intro"), alternates: pageAlternates(locale, "/privacy") };
}

/** Section ids double as footer anchors (#your-data). */
const SECTIONS = [
  { id: "what-we-collect", key: "collect" },
  { id: "your-phone", key: "phone" },
  { id: "guests", key: "guests" },
  { id: "how-we-use", key: "use" },
  { id: "maps", key: "maps" },
  { id: "payments", key: "payments" },
  { id: "sharing", key: "sharing" },
  { id: "storage", key: "storage" },
  { id: "retention", key: "retention" },
  { id: "device", key: "device" },
  { id: "support", key: "support" },
  { id: "your-data", key: "yourData" },
  { id: "children", key: "children" },
  { id: "changes", key: "changes" },
] as const;

/**
 * Plain-language privacy policy describing what this app actually stores
 * and sends (lib/types.ts, the API routes, lib/geo.ts, lib/notify.ts,
 * firestore.rules / storage.rules). Keep it in step with the code when
 * data handling changes.
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage namespace="site.privacy" sections={SECTIONS} />;
}

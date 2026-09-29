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
  const t = await getTranslations({ locale, namespace: "site.terms" });
  return { title: t("metaTitle"), description: t("intro"), alternates: pageAlternates(locale, "/terms") };
}

/** Section ids double as footer anchors (#refunds). */
const SECTIONS = [
  { id: "agreement", key: "agreement" },
  { id: "service", key: "service" },
  { id: "edit-link", key: "editLink" },
  { id: "your-content", key: "content" },
  { id: "acceptable-use", key: "conduct" },
  { id: "guests", key: "guests" },
  { id: "pricing", key: "pricing" },
  { id: "refunds", key: "refunds" },
  { id: "availability", key: "availability" },
  { id: "third-parties", key: "thirdParties" },
  { id: "ours", key: "ip" },
  { id: "liability", key: "liability" },
  { id: "suspension", key: "suspension" },
  { id: "law", key: "law" },
  { id: "changes", key: "changes" },
] as const;

/**
 * Terms & conditions. Matches how the service actually works: one-time
 * price per invitation (lib/pricing.ts), live until 10 days after the event
 * with paid renewals (lib/expiry.ts), no accounts — the edit link is the
 * key (lib/ownerAuth.ts). Keep in step with those.
 */
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage namespace="site.terms" sections={SECTIONS} />;
}

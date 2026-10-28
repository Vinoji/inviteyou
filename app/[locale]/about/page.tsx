import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/site";
import { standardPriceInr } from "@/lib/pricing";
import { SITE_URL, pageAlternates, pageSocial } from "@/lib/seo";
import FestiveBanner from "@/components/site/FestiveBanner";
import paper from "@/components/landing/landing.module.css";

/** /about — who InviteForYou is, what it makes, pricing, privacy, contact. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: pageAlternates(locale, "/about"),
    ...pageSocial({ title: t("ogTitle"), description: t("ogDescription"), kicker: t("eyebrow"), url: locale === "ta" ? "/ta/about" : "/about" }),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const tSeo = await getTranslations("seoPages");
  const tSite = await getTranslations("site");
  const price = standardPriceInr();
  const keys = Object.keys(t.raw("sections") as Record<string, unknown>);
  const base = locale === "ta" ? `${SITE_URL}/ta` : SITE_URL;
  const socials = Object.values(SITE.social).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        url: `${base}/about`,
        name: t("metaTitle"),
        description: t("metaDescription"),
        inLanguage: locale === "ta" ? "ta-IN" : "en-IN",
        mainEntity: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: SITE.name,
        url: SITE_URL,
        email: SITE.contact.email,
        sameAs: socials,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: tSeo("common.breadcrumbHome"), item: `${base}/` },
          { "@type": "ListItem", position: 2, name: t("h1"), item: `${base}/about` },
        ],
      },
    ],
  };

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <FestiveBanner eyebrow={t("eyebrow")} title={t("h1")} intro={t("intro")} />
      <section className="mx-auto max-w-3xl space-y-5 px-6 py-12">
        {keys.map((k) => (
          <div key={k} className={`${paper.festiveCard} p-6`}>
            <h2 className="font-serif text-xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{t(`sections.${k}.t`)}</h2>
            <p className="mt-2 leading-relaxed text-neutral-700 dark:text-neutral-300">{t(`sections.${k}.d`, { price })}</p>
          </div>
        ))}
        <div className={`${paper.festiveCard} p-6`}>
          <h2 className="font-serif text-xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{t("contactTitle")}</h2>
          <p className="mt-2 leading-relaxed text-neutral-700 dark:text-neutral-300">{t("contactText")}</p>
          <a href={`mailto:${SITE.contact.email}`} className="mt-3 inline-flex items-center gap-2 font-semibold text-amber-700 hover:underline dark:text-amber-400">
            <Mail size={16} aria-hidden />
            {SITE.contact.email}
          </a>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/templates" className="font-medium text-amber-700 hover:underline dark:text-amber-400">
              {tSeo("common.allDesigns")}
            </Link>
            <Link href="/invitations/wedding" className="font-medium text-amber-700 hover:underline dark:text-amber-400">
              {tSeo("wedding.h1")}
            </Link>
            <Link href="/privacy" className="font-medium text-amber-700 hover:underline dark:text-amber-400">
              {tSite("footer.privacy")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

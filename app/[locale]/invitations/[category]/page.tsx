import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { showcaseProps } from "@/lib/i18n/showcase";
import { templatePriceInr } from "@/lib/pricing";
import { SITE_URL, pageAlternates } from "@/lib/seo";
import TemplateGallery, { type GalleryTemplate } from "@/components/landing/TemplateGallery";
import FestiveBanner from "@/components/site/FestiveBanner";
import { KolamDivider } from "@/components/site/festive";
import paper from "@/components/landing/landing.module.css";

/**
 * /invitations/<category> — one indexable landing page per occasion
 * (wedding, birthday, housewarming…), in English and Tamil. These are the
 * pages people find from searches like "Tamil wedding invitation" or
 * "birthday e-invite": a keyword-led title and heading, a short intro,
 * the live designs for that occasion, an FAQ, links to the other
 * occasions, and schema.org data (breadcrumbs, the design list, FAQ).
 * Copy lives in messages under `seoPages.<category>`.
 */

const IDS = CATEGORIES.map((c) => c.id);

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => IDS.map((category) => ({ locale, category })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!(IDS as string[]).includes(category)) return {};
  const t = await getTranslations({ locale, namespace: `seoPages.${category}` });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: pageAlternates(locale, `/invitations/${category}`),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitationCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!(IDS as string[]).includes(category)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations(`seoPages.${category}`);
  const tc = await getTranslations("seoPages.common");
  const tCategories = await getTranslations("categories");
  const tTemplates = await getTranslations("templates");
  const tDefaults = await getTranslations("defaultContent");
  const tCommon = await getTranslations("common");

  const meta = getCategoryMeta(category, tCategories);
  const templates: GalleryTemplate[] = getTemplatesByCategory(category as CategoryId, tTemplates).map((tpl) => ({
    id: tpl.id,
    category,
    name: tpl.name,
    tagline: tpl.tagline,
    showcase: showcaseProps(tpl, meta.singlePerson, tDefaults, tCommon),
  }));
  const faqKeys = Object.keys(t.raw("faq") as Record<string, unknown>);
  const whyKeys = Object.keys(tc.raw("why") as Record<string, unknown>);
  const others = IDS.filter((id) => id !== category).map((id) => getCategoryMeta(id, tCategories));

  const base = locale === "ta" ? `${SITE_URL}/ta` : SITE_URL;
  const pageUrl = `${base}/invitations/${category}`;
  const prices = templates.map((tpl) => templatePriceInr(tpl.id));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: tc("breadcrumbHome"), item: `${base}/` },
          { "@type": "ListItem", position: 2, name: meta.label, item: pageUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: t("metaTitle"),
        description: t("metaDescription"),
        inLanguage: locale === "ta" ? "ta-IN" : "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#site` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: templates.length,
          itemListElement: templates.map((tpl, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tpl.name,
            description: tpl.tagline,
          })),
        },
      },
      ...(prices.length
        ? [
            {
              "@type": "Service",
              name: t("h1"),
              serviceType: t("metaTitle"),
              provider: { "@id": `${SITE_URL}/#org` },
              areaServed: "IN",
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "INR",
                lowPrice: String(Math.min(...prices)),
                highPrice: String(Math.max(...prices)),
                offerCount: prices.length,
                url: pageUrl,
              },
            },
          ]
        : []),
      {
        "@type": "FAQPage",
        mainEntity: faqKeys.map((k) => ({
          "@type": "Question",
          name: t(`faq.${k}.q`),
          acceptedAnswer: { "@type": "Answer", text: t(`faq.${k}.a`) },
        })),
      },
    ],
  };
  const json = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <FestiveBanner eyebrow={`${meta.label} · ${tc("eyebrow")}`} title={t("h1")} intro={t("intro")}>
        <a
          href="#designs"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-neutral-950 shadow-lg hover:bg-amber-400"
        >
          {tc("start")}
          <ArrowRight size={16} aria-hidden />
        </a>
      </FestiveBanner>

      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-6 pt-6 text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-amber-700">
          {tc("breadcrumbHome")}
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page">{meta.label}</span>
      </nav>

      <section id="designs" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-8 pb-14 sm:px-6">
        <h2 className="text-center font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">{tc("designsTitle")}</h2>
        <p className="mt-2 text-center text-neutral-600 dark:text-neutral-400">{tc("designsSub")}</p>
        <div className="mt-8">
          <TemplateGallery categories={[]} templates={templates} />
        </div>
      </section>

      <KolamDivider />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">{tc("whyTitle")}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {whyKeys.map((k) => (
            <li key={k} className={`${paper.festiveCard} flex items-start gap-3 p-4 text-neutral-700 dark:text-neutral-300`}>
              <Check size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
              {tc(`why.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-12">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">{tc("faqTitle")}</h2>
        <div className="mt-5 space-y-3">
          {faqKeys.map((k) => (
            <details key={k} className={`${paper.festiveCard} group p-5`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-neutral-900 dark:text-neutral-50">
                {t(`faq.${k}.q`)}
                <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{t(`faq.${k}.a`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">{tc("moreTitle")}</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.id}>
              <Link
                href={`/invitations/${o.id}`}
                className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-amber-500 hover:text-amber-700 dark:border-neutral-700 dark:text-neutral-300"
              >
                {o.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

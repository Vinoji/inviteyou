import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllCategoryMeta } from "@/lib/i18n/categories";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { showcaseProps } from "@/lib/i18n/showcase";
import { standardPriceInr, templatePriceInr, templateTier } from "@/lib/pricing";
import { getSiteStats } from "@/lib/stats";
import { SITE_URL, pageAlternates, pageSocial } from "@/lib/seo";
import { collectionsFor } from "@/lib/collections";
import TemplateGallery, { type GalleryTemplate } from "@/components/landing/TemplateGallery";
import FestiveBanner from "@/components/site/FestiveBanner";
import { KolamDivider } from "@/components/site/festive";
import paper from "@/components/landing/landing.module.css";

/**
 * /templates — every design once, by occasion and price (the playable
 * gallery), then a plain index of every design under its occasion with
 * links to the occasion and tradition pages, for people and for search.
 * The home page's "See all" and the price pills (#free, #value, #premium)
 * land here.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templatesPage" });
  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: pageAlternates(locale, "/templates"),
    ...pageSocial({ title: t("ogTitle"), description: t("ogDescription"), kicker: t("eyebrow"), url: locale === "ta" ? "/ta/templates" : "/templates" }),
  };
}

export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("templatesPage");
  const tCategories = await getTranslations("categories");
  const tTemplates = await getTranslations("templates");
  const tDefaults = await getTranslations("defaultContent");
  const tCommon = await getTranslations("common");
  const tSeo = await getTranslations("seoPages");
  const tHome = await getTranslations("landing.home");

  const categories = getAllCategoryMeta(tCategories);
  const byCategory = categories.map((category) => ({
    category,
    designs: getTemplatesByCategory(category.id, tTemplates),
  }));
  const templates: GalleryTemplate[] = byCategory.flatMap(({ category, designs }) =>
    designs.map((tpl) => ({
      id: tpl.id,
      category: category.id,
      name: tpl.name,
      tagline: tpl.tagline,
      showcase: showcaseProps(tpl, category.singlePerson, tDefaults, tCommon),
    }))
  );
  const stats = await getSiteStats();
  const base = locale === "ta" ? `${SITE_URL}/ta` : SITE_URL;
  const badge = (id: string) => {
    const tier = templateTier(id);
    const price = templatePriceInr(id);
    return tier === "free" ? tHome("badgeFree") : tier === "premium" ? tHome("badge3d", { price }) : tHome("freeAlso", { price });
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: tSeo("common.breadcrumbHome"), item: `${base}/` },
          { "@type": "ListItem", position: 2, name: t("h1"), item: `${base}/templates` },
        ],
      },
      {
        "@type": "CollectionPage",
        url: `${base}/templates`,
        name: t("metaTitle"),
        description: t("metaDescription"),
        inLanguage: locale === "ta" ? "ta-IN" : "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#site` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: templates.length,
          itemListElement: templates.map((tpl, i) => ({ "@type": "ListItem", position: i + 1, name: tpl.name, description: tpl.tagline })),
        },
      },
    ],
  };

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <FestiveBanner eyebrow={t("eyebrow")} title={t("h1")} intro={t("intro", { price: standardPriceInr() })} />

      <section id="templates" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-10 pb-14 sm:px-6">
        <TemplateGallery categories={categories.map((c) => ({ id: c.id, label: c.label }))} templates={templates} ratings={stats.designRatings} />
      </section>

      <KolamDivider />

      {/* Every design, by occasion — plain links for people and search. */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        {byCategory
          .filter((g) => g.designs.length > 0)
          .map(({ category, designs }) => (
            <div key={category.id} className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                <Link href={`/invitations/${category.id}`} className="hover:text-amber-700">
                  {tSeo(`${category.id}.h1`)}
                </Link>
              </h2>
              {collectionsFor(category.id).length > 0 && (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {collectionsFor(category.id).map((c) => (
                    <Link key={c.slug} href={`/invitations/${c.slug}`} className="font-medium text-amber-700 hover:underline dark:text-amber-400">
                      {tSeo(`${c.slug}.label`)}
                    </Link>
                  ))}
                </p>
              )}
              <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {designs.map((tpl) => (
                  <li key={tpl.id} className="text-sm leading-snug text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">{tpl.name}</span>
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                      {badge(tpl.id)}
                    </span>
                    <span className="block text-neutral-600 dark:text-neutral-400">{tpl.tagline}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </section>
    </main>
  );
}

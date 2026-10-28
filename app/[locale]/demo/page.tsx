import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllCategoryMeta } from "@/lib/i18n/categories";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { showcaseProps } from "@/lib/i18n/showcase";
import TemplateShowcase from "@/components/landing/TemplateShowcase";
import { SITE } from "@/lib/site";
import FestiveBanner from "@/components/site/FestiveBanner";
import paper from "@/components/landing/landing.module.css";
import { SITE_URL, pageAlternates, pageSocial } from "@/lib/seo";
import DemoShort from "@/components/site/DemoShort";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.demo" });
  return {
    title: { absolute: t("metaTitleFull") },
    description: t("metaDescriptionFull"),
    alternates: pageAlternates(locale, "/demo"),
    ...pageSocial({ title: t("ogTitle"), description: t("ogDescription"), kicker: t("eyebrow"), url: locale === "ta" ? "/ta/demo" : "/demo" }),
  };
}

/**
 * Demos: walkthrough videos when SITE.demoVideos has any, and always every
 * template's live opening — the "video" of each design, playable in place.
 */
export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("site.demo");
  const tCategories = await getTranslations("categories");
  const tTemplates = await getTranslations("templates");
  const tDefaults = await getTranslations("defaultContent");
  const tCommon = await getTranslations("common");
  const tLanding = await getTranslations("landing");

  const steps = ["step1", "step2", "step3"] as const;
  // Each Short as a schema.org VideoObject, so search can show it as a video.
  const videosJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": SITE.demoVideos.map((v) => ({
      "@type": "VideoObject",
      name: `${tTemplates(`${v.templateId}.name`)} — ${tTemplates(`${v.templateId}.tagline`)}`,
      description: tTemplates(`${v.templateId}.description`),
      thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
      contentUrl: `https://www.youtube.com/shorts/${v.youtubeId}`,
      uploadDate: "2026-10-21",
      publisher: { "@id": `${SITE_URL}/#org` },
    })),
  }).replace(/</g, "\\u003c");

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <FestiveBanner eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <section className="mx-auto max-w-5xl px-6 pt-4 pb-14">
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step}
              className={`${paper.festiveCard} p-5`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-serif text-lg font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                {i + 1}
              </span>
              <h2 className="mt-3 font-semibold text-neutral-900 dark:text-neutral-50">{t(`${step}Title`)}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t(`${step}Body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {SITE.demoVideos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: videosJsonLd }} />
          <div className="mb-6 text-center">
            <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">{t("videosTitle")}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{t("videosBody")}</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {SITE.demoVideos.map((v) => {
              const name = tTemplates(`${v.templateId}.name`);
              return (
                <li key={v.youtubeId} className={`${paper.festiveCard} overflow-hidden`}>
                  <div className="overflow-hidden rounded-t-[21px]">
                    <DemoShort id={v.youtubeId} title={name} playLabel={t("play")} />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="line-clamp-2 min-w-0 font-serif text-sm leading-tight font-bold text-neutral-900 dark:text-neutral-50">{name}</span>
                    <Link
                      href={`/create/${v.templateId}`}
                      className="shrink-0 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
                      aria-label={`${tLanding("useTemplate")} — ${name}`}
                    >
                      {t("use")} →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50">{t("liveTitle")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{t("liveBody")}</p>
          {SITE.social.youtube && (
            <a
              href={SITE.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-amber-700 hover:underline dark:text-amber-400"
            >
              {t("youtube")} →
            </a>
          )}
        </div>
        {getAllCategoryMeta(tCategories).map((category) => {
          const templates = getTemplatesByCategory(category.id, tTemplates);
          if (!templates.length) return null;
          return (
            <div key={category.id} className="mb-12">
              <h3 className="mb-4 font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {category.label}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {templates.map((tpl) => (
                  <figure key={tpl.id} className={paper.festiveCard}>
                    <div className="overflow-hidden rounded-t-[21px]">
                      <TemplateShowcase {...showcaseProps(tpl, category.singlePerson, tDefaults, tCommon)} />
                    </div>
                    <figcaption className="flex items-center justify-between gap-2 p-3">
                      <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">{tpl.name}</span>
                      <Link
                        href={`/create/${tpl.id}`}
                        className="shrink-0 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
                        aria-label={`${tLanding("useTemplate")} — ${tpl.name}`}
                      >
                        {t("use")} →
                      </Link>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

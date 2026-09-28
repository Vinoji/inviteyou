import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllCategoryMeta } from "@/lib/i18n/categories";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { showcaseProps } from "@/lib/i18n/showcase";
import TemplateShowcase from "@/components/landing/TemplateShowcase";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.demo" });
  return { title: t("metaTitle"), description: t("intro") };
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

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-4xl px-6 pt-14 pb-10 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">{t("eyebrow")}</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-neutral-50">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">{t("intro")}</p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
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
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="mb-6 font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {t("videosTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {SITE.demoVideos.map((v) => (
              <figure key={v.youtubeId} className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <iframe
                  className="aspect-video w-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                  title={v.title}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <figcaption className="p-4 text-sm font-medium">{v.title}</figcaption>
              </figure>
            ))}
          </div>
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
                  <figure key={tpl.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    <TemplateShowcase {...showcaseProps(tpl, category.singlePerson, tDefaults, tCommon)} />
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

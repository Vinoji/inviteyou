import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllCategoryMeta } from "@/lib/i18n/categories";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { showcaseProps } from "@/lib/i18n/showcase";
import TemplateShowcase from "@/components/landing/TemplateShowcase";
import type { TemplateMeta } from "@/lib/i18n/templates";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tCategories = await getTranslations("categories");
  const tTemplates = await getTranslations("templates");
  const tDefaults = await getTranslations("defaultContent");
  const tCommon = await getTranslations("common");

  const showcase = (tpl: TemplateMeta, singlePerson: boolean) =>
    showcaseProps(tpl, singlePerson, tDefaults, tCommon);
  const categories = getAllCategoryMeta(tCategories);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-10 text-center sm:pt-24">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
          {t("heading")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
          {t("subheading")}
        </p>
      </section>

      {/* Quick jump to each category */}
      <nav id="templates" className="mx-auto flex max-w-5xl scroll-mt-24 flex-wrap justify-center gap-2 px-6 pb-10">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-600 hover:border-amber-300 hover:text-amber-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-amber-700 dark:hover:text-amber-500"
          >
            {c.label}
          </a>
        ))}
      </nav>

      {categories.map((category) => {
        const templates = getTemplatesByCategory(category.id, tTemplates);
        if (templates.length === 0) return null;
        return (
          <section
            key={category.id}
            id={category.id}
            className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-16"
          >
            <div className="mb-6 flex items-baseline justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {category.label}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{category.tagline}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <article
                  key={tpl.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className={`bg-gradient-to-br p-3 ${tpl.cardGradient}`}>
                    <div className="overflow-hidden rounded-[22px] shadow-lg ring-1 ring-black/10">
                      <TemplateShowcase {...showcase(tpl, category.singlePerson)} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-500">
                      {tpl.tagline}
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                      {tpl.name}
                    </h3>
                    <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">{tpl.description}</p>
                    <Link
                      href={`/create/${tpl.id}`}
                      className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-amber-700 dark:bg-neutral-100 dark:text-neutral-900 dark:group-hover:bg-amber-500"
                    >
                      {t("useTemplate")}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="border-t border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3">
          <Feature title={t("feature1Title")} body={t("feature1Body")} />
          <Feature title={t("feature2Title")} body={t("feature2Body")} />
          <Feature title={t("feature3Title")} body={t("feature3Body")} />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        {title}
      </h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{body}</p>
    </div>
  );
}

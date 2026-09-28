import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllCategoryMeta } from "@/lib/i18n/categories";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { showcaseProps } from "@/lib/i18n/showcase";
import { PRICE_INR } from "@/lib/pricing";
import TemplateGallery, { type GalleryTemplate } from "@/components/landing/TemplateGallery";
import Pricing from "@/components/landing/Pricing";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tCategories = await getTranslations("categories");
  const tTemplates = await getTranslations("templates");
  const tDefaults = await getTranslations("defaultContent");
  const tCommon = await getTranslations("common");

  const categories = getAllCategoryMeta(tCategories);
  const templates: GalleryTemplate[] = categories.flatMap((category) =>
    getTemplatesByCategory(category.id, tTemplates).map((tpl) => ({
      id: tpl.id,
      category: category.id,
      name: tpl.name,
      tagline: tpl.tagline,
      showcase: showcaseProps(tpl, category.singlePerson, tDefaults, tCommon),
    }))
  );

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-4xl px-6 pt-10 pb-8 text-center sm:pt-16">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">{t("eyebrow")}</p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
          {t("heading")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-lg dark:text-neutral-400">
          {t("subheading")}
        </p>
      </section>

      <section id="templates" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 sm:px-6">
        <TemplateGallery
          categories={categories.map((c) => ({ id: c.id, label: c.label }))}
          templates={templates}
        />
      </section>

      <section className="border-t border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-14 sm:grid-cols-3">
          <Feature title={t("feature1Title")} body={t("feature1Body")} />
          <Feature title={t("feature2Title")} body={t("feature2Body")} />
          <Feature title={t("feature3Title", { price: PRICE_INR })} body={t("feature3Body")} />
        </div>
      </section>

      <Pricing />
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{body}</p>
    </div>
  );
}

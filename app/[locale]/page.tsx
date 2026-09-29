import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageAlternates } from "@/lib/seo";
import StructuredData from "@/components/site/StructuredData";
import { getAllCategoryMeta } from "@/lib/i18n/categories";
import { getTemplatesByCategory } from "@/lib/i18n/templates";
import { showcaseProps } from "@/lib/i18n/showcase";
import TemplateGallery, { type GalleryTemplate } from "@/components/landing/TemplateGallery";
import Pricing from "@/components/landing/Pricing";
import Hero from "@/components/landing/Hero";
import paper from "@/components/landing/landing.module.css";
import { KolamDivider, SideGarlands } from "@/components/site/festive";
import {
  FeatureBento,
  FinalCta,
  HowItWorks,
  OccasionMarquee,
  SectionHeading,
} from "@/components/landing/Sections";

/** Openings the hero phone cycles through — one per style family. */
const FEATURED = ["traditional-gold", "silk-curtain", "engagement-ring", "lantern-night", "baby-moon"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, "") };
}

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
  const featured = FEATURED.flatMap((id) => templates.find((tpl) => tpl.id === id)?.showcase ?? []);

  return (
    <main className={`flex-1 ${paper.paper}`}>
      <StructuredData locale={locale} />
      <Hero featured={featured} />

      <OccasionMarquee occasions={categories.map((c) => ({ id: c.id, label: c.label }))} />

      <div className="relative">
        <SideGarlands />
      </div>
      <section id="templates" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 pt-14 pb-16 sm:px-6">
        <SectionHeading eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} sub={t("gallery.sub")} />
        <div className="mt-8">
          <TemplateGallery
            categories={categories.map((c) => ({ id: c.id, label: c.label }))}
            templates={templates}
          />
        </div>
      </section>

      <KolamDivider />
      <HowItWorks />
      <KolamDivider />
      <FeatureBento />
      <KolamDivider />
      <Pricing />
      <FinalCta />
    </main>
  );
}

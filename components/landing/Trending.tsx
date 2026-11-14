"use client";

import { useTranslations } from "next-intl";
import { Flame } from "lucide-react";
import { DesignCard, type GalleryTemplate } from "./TemplateGallery";

/**
 * "Trending now" on the home page: the designs added in the last two weeks
 * (trendingTemplateIds), as the gallery's cards — a swipeable row on
 * phones, a grid on wider screens. Hidden when there are none.
 */
export default function Trending({
  templates,
  ratings = {},
}: {
  templates: GalleryTemplate[];
  ratings?: Record<string, { average: number; count: number }>;
}) {
  const t = useTranslations("landing.home.trending");
  if (!templates.length) return null;
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-12 sm:px-6" aria-labelledby="trending-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e8b04a] px-3 py-1 text-[11px] font-bold tracking-wider text-[#2a0c27] uppercase">
            <Flame size={13} aria-hidden />
            {t("eyebrow")}
          </p>
          <h2 id="trending-title" className="mt-2 font-serif text-2xl font-bold text-[#2a0c27] sm:text-3xl dark:text-[#fff6e6]">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t("sub")}</p>
        </div>
      </div>
      <ul className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {templates.map((tpl) => (
          <li key={tpl.id} className="w-[62%] shrink-0 snap-start sm:w-auto">
            <DesignCard tpl={tpl} rating={ratings[tpl.id]} />
          </li>
        ))}
      </ul>
    </section>
  );
}

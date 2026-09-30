"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { templateListPriceInr, templatePriceInr } from "@/lib/pricing";
import TemplateShowcase, { type ShowcaseProps } from "./TemplateShowcase";
import f from "./landing.module.css";

export interface GalleryTemplate {
  id: string;
  category: string;
  name: string;
  tagline: string;
  showcase: ShowcaseProps;
}

/** How many cards show before "Show all" — two rows on each layout. */
const FIRST_ROWS = { phone: 4, desktop: 8 };

/**
 * The template list on the home page: category tabs and a compact grid of
 * live previews (two across on phones, four on desktop), trimmed to two
 * rows until "Show all" — so the whole range is a short scroll, not a
 * page per template. A #category hash (e.g. /#engagement) opens that tab.
 */
export default function TemplateGallery({
  categories,
  templates,
}: {
  categories: { id: string; label: string }[];
  templates: GalleryTemplate[];
}) {
  const t = useTranslations("landing");
  const [tab, setTab] = useState<string>("all");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (categories.some((c) => c.id === id)) {
        setTab(id);
        setExpanded(false);
        document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    const first = setTimeout(fromHash, 0); // after hydration
    window.addEventListener("hashchange", fromHash);
    return () => {
      clearTimeout(first);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [categories]);

  const shown = tab === "all" ? templates : templates.filter((tpl) => tpl.category === tab);
  const tabs = [
    { id: "all", label: t("allDesigns"), count: templates.length },
    ...categories
      .map((c) => ({ ...c, count: templates.filter((tpl) => tpl.category === c.id).length }))
      .filter((c) => c.count > 0),
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("categoriesLabel")}
        className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
      >
        {tabs.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={tab === c.id}
            onClick={() => {
              setTab(c.id);
              setExpanded(false);
            }}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              tab === c.id
                ? "border-amber-600 bg-amber-600 text-white shadow-sm"
                : "border-neutral-200 text-neutral-600 hover:border-amber-300 hover:text-amber-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-amber-700 dark:hover:text-amber-500"
            }`}
          >
            {c.label}
            <span className={`text-xs ${tab === c.id ? "text-amber-100" : "text-neutral-400"}`}>{c.count}</span>
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((tpl, i) => {
          const listPrice = templateListPriceInr(tpl.id);
          return (
          <li
            key={tpl.id}
            className={
              expanded
                ? ""
                : i >= FIRST_ROWS.desktop
                  ? "hidden"
                  : i >= FIRST_ROWS.phone
                    ? "hidden md:block"
                    : ""
            }
          >
            <article className={`${f.festiveCard} group flex h-full flex-col transition duration-300 hover:-translate-y-1`}>
              <div className="relative overflow-hidden rounded-t-[21px]">
                <TemplateShowcase {...tpl.showcase} />
                {/* Top right: the showcase's "Tap to try it" hint owns top left. */}
                <div className="pointer-events-none absolute top-2 right-2 z-30 flex flex-col items-end gap-1">
                  <span className="inline-flex items-baseline gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-md ring-1 ring-amber-200 dark:bg-neutral-900/95 dark:ring-amber-800">
                    {listPrice && (
                      <s className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                        ₹{listPrice}
                      </s>
                    )}
                    <span className="text-xs font-bold text-amber-800 sm:text-sm dark:text-amber-400">
                      ₹{templatePriceInr(tpl.id)}
                    </span>
                  </span>
                  {listPrice && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow-md sm:text-xs">
                      {t("offer")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                <h3 className="truncate font-serif text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-50">
                  {tpl.name}
                </h3>
                <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">{tpl.tagline}</p>
                <Link
                  href={`/create/${tpl.id}`}
                  className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition group-hover:bg-amber-700 sm:text-sm dark:bg-neutral-100 dark:text-neutral-900 dark:group-hover:bg-amber-500"
                >
                  {t("useShort")}
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </article>
          </li>
          );
        })}
      </ul>

      {!expanded && shown.length > FIRST_ROWS.phone && (
        <div className={`mt-6 text-center ${shown.length > FIRST_ROWS.desktop ? "" : "md:hidden"}`}>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:border-amber-500 hover:text-amber-700 dark:border-neutral-700 dark:text-neutral-200"
          >
            {t("showAll", { count: shown.length })}
            <ChevronDown size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

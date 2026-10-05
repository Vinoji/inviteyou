"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, Crown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { templateListPriceInr, templatePriceInr } from "@/lib/pricing";
import { getTemplateConfig } from "@/lib/templates";
import TemplateShowcase, { type ShowcaseProps } from "./TemplateShowcase";

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
      {/* No tabs on a single-occasion page (/invitations/<category>). */}
      {categories.length > 0 && (
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
      )}

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((tpl, i) => {
          const listPrice = templateListPriceInr(tpl.id);
          const premium = getTemplateConfig(tpl.id).badge === "premium";
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
            {/* A short card: the live opening (4:5), one price chip, and a
                single row with the name and a go-to-editor arrow. */}
            <article
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#fffaf2] shadow-[0_14px_30px_-18px_rgba(61,18,54,0.55)] ring-1 transition duration-300 hover:-translate-y-1 dark:bg-[#1c1220] ${
                premium ? "ring-[#e8b04a]/80" : "ring-[#3d1236]/10 dark:ring-[#e8b04a]/20"
              }`}
            >
              <div className="relative">
                <TemplateShowcase {...tpl.showcase} aspect={4 / 5} />
                <span
                  className={`pointer-events-none absolute top-2 right-2 z-30 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold shadow-md ${
                    premium
                      ? "bg-gradient-to-r from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-[#2a0c27]"
                      : "bg-white/95 text-[#3d1236] dark:bg-[#22091f]/90 dark:text-[#ffe9b8]"
                  }`}
                >
                  {premium && <Crown size={11} aria-label={t("premium")} />}
                  {listPrice && !premium && (
                    <s className="text-[10px] font-medium opacity-50">₹{listPrice}</s>
                  )}
                  ₹{templatePriceInr(tpl.id)}
                </span>
              </div>
              <Link
                href={`/create/${tpl.id}`}
                aria-label={`${t("useTemplate")} — ${tpl.name}`}
                className="flex flex-1 items-center justify-between gap-2 px-3 py-2.5"
              >
                <h3 className="line-clamp-2 font-serif text-[14px] leading-tight font-bold text-[#2a0c27] sm:text-base dark:text-[#fff6e6]">
                  {tpl.name}
                </h3>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-[#2a0c27] shadow-[0_6px_14px_-6px_rgba(201,143,58,0.9)] transition group-hover:scale-110">
                  <ArrowRight size={15} aria-hidden />
                </span>
              </Link>
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

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, BadgeIndianRupee, Box, ChevronDown, Crown, PenLine, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { standardPriceInr, templateListPriceInr, templatePriceInr } from "@/lib/pricing";
import { EDITORS_PICKS, getTemplateConfig, isNewTemplate } from "@/lib/templates";
import TemplateShowcase, { type ShowcaseProps } from "./TemplateShowcase";

export interface GalleryTemplate {
  id: string;
  category: string;
  name: string;
  tagline: string;
  showcase: ShowcaseProps;
}

type Quick = "all" | "new" | "premium" | "value" | "picks";

const isPremium = (id: string) => getTemplateConfig(id).badge === "premium";

/** New designs first, then editor's picks, then the rest (stable). */
function rank(id: string) {
  return isNewTemplate(id) ? 0 : EDITORS_PICKS.includes(id) ? 1 : 2;
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
  const [quick, setQuick] = useState<Quick>("all");

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

  const inTab = tab === "all" ? templates : templates.filter((tpl) => tpl.category === tab);
  // "Best value": everything at the standard price or less (not the
  // cheapest single price, which can be a temporary test price).
  const lowest = standardPriceInr();
  const quickTest: Record<Quick, (id: string) => boolean> = {
    all: () => true,
    new: (id) => isNewTemplate(id),
    premium: isPremium,
    value: (id) => !isPremium(id) && templatePriceInr(id) <= lowest,
    picks: (id) => EDITORS_PICKS.includes(id),
  };
  const shown = inTab
    .filter((tpl) => quickTest[quick](tpl.id))
    .map((tpl, i) => ({ tpl, i }))
    .sort((a, b) => rank(a.tpl.id) - rank(b.tpl.id) || a.i - b.i)
    .map(({ tpl }) => tpl);
  const quickChips = (
    [
      { id: "all", label: t("quick.all"), icon: null },
      { id: "new", label: t("quick.new"), icon: Sparkles },
      { id: "picks", label: t("quick.picks"), icon: Star },
      { id: "premium", label: t("quick.premium"), icon: Crown },
      { id: "value", label: t("quick.value", { price: lowest }), icon: BadgeIndianRupee },
    ] as const
  ).filter((q) => q.id === "all" || inTab.some((tpl) => quickTest[q.id](tpl.id)));
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

      {/* Quick filters — the ways people actually shop for a design. */}
      {quickChips.length > 1 && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:px-0">
          {quickChips.map((q) => {
            const on = quick === q.id;
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setQuick(q.id);
                  setExpanded(false);
                }}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
                  on
                    ? "bg-[#3d1236] text-[#ffe9b8] shadow-sm dark:bg-[#ffe9b8] dark:text-[#3d1236]"
                    : "bg-[#3d1236]/5 text-[#5a3a4f] hover:bg-[#3d1236]/10 dark:bg-white/5 dark:text-[#f6e7d0]/80"
                }`}
              >
                {Icon && <Icon size={13} aria-hidden />}
                {q.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Why it's safe to start: all true, shown where people decide. */}
      <ul className="mb-6 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] text-[#5a3a4f] sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 dark:text-[#f6e7d0]/75">
        {[
          { icon: Sparkles, label: t("trust.free") },
          { icon: BadgeIndianRupee, label: t("trust.once") },
          { icon: PenLine, label: t("trust.edits") },
          { icon: ShieldCheck, label: t("trust.secure") },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-1.5">
            <Icon size={14} className="shrink-0 text-[#c98f3a]" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      {shown.length === 0 && (
        <p className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">{t("quick.none")}</p>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((tpl, i) => {
          const listPrice = templateListPriceInr(tpl.id);
          const price = templatePriceInr(tpl.id);
          const premium = isPremium(tpl.id);
          const fresh = isNewTemplate(tpl.id);
          const pick = EDITORS_PICKS.includes(tpl.id);
          const save = listPrice ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
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
                {/* Price, with the saving against the usual price. */}
                <div className="pointer-events-none absolute top-2 right-2 z-30 flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold shadow-md ${
                      premium
                        ? "bg-gradient-to-r from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-[#2a0c27]"
                        : "bg-white/95 text-[#3d1236] dark:bg-[#22091f]/90 dark:text-[#ffe9b8]"
                    }`}
                  >
                    {premium && <Crown size={11} aria-label={t("premium")} />}
                    {listPrice && <s className="text-[10px] font-medium opacity-50">₹{listPrice}</s>}₹{price}
                  </span>
                  {save >= 5 && (
                    <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                      {t("save", { percent: save })}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/create/${tpl.id}`}
                aria-label={`${t("useTemplate")} — ${tpl.name}`}
                className="flex flex-1 items-center justify-between gap-2 px-3 py-2.5"
              >
                <span className="min-w-0">
                  {(fresh || pick || premium) && (
                    <span
                      className={`mb-0.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase ${
                        fresh ? "text-rose-600 dark:text-rose-400" : "text-[#b0791f] dark:text-[#ffd35c]"
                      }`}
                    >
                      {fresh ? <Sparkles size={10} aria-hidden /> : pick ? <Star size={10} aria-hidden /> : <Box size={10} aria-hidden />}
                      {fresh ? t("badgeNew") : pick ? t("badgePick") : t("badge3d")}
                    </span>
                  )}
                  <h3 className="line-clamp-2 font-serif text-[14px] leading-tight font-bold text-[#2a0c27] sm:text-base dark:text-[#fff6e6]">
                    {tpl.name}
                  </h3>
                </span>
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

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, Crown, Gift, Sparkles, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EDITORS_PICKS, isNewTemplate } from "@/lib/templates";
import { type Tier, templateListPriceInr, templatePriceInr, templateTier, tierPriceInr } from "@/lib/pricing";
import TemplateShowcase, { type ShowcaseProps } from "./TemplateShowcase";

export interface GalleryTemplate {
  id: string;
  category: string;
  name: string;
  tagline: string;
  showcase: ShowcaseProps;
}

/** Occasion buttons, in the order people most often look for them. */
const OCCASION_ICON: Record<string, string> = {
  wedding: "💍",
  engagement: "💞",
  birthday: "🎂",
  housewarming: "🏡",
  baby: "👶",
  anniversary: "💐",
  valentine: "❤️",
  proposal: "💌",
  corporate: "🎤",
};
const OCCASION_ORDER = Object.keys(OCCASION_ICON);
// Live invitations lead (what most people want), 3D next, free cards last.
const TIERS: Tier[] = ["standard", "premium", "free"];
/** Cards per price group before "Show all" — one or two rows. */
const FIRST = { phone: 4, desktop: 4 };

/**
 * The design list, occasion first: pick what you're celebrating, then see
 * its designs grouped by what they cost — free cards, live invitations,
 * premium 3D — each group saying in one line what that price gets you
 * (the full breakdown is the comparison in Pricing). Hashes from links:
 * #wedding etc. open an occasion; #free / #value / #premium jump to a group.
 */
export default function TemplateGallery({
  categories,
  templates,
  ratings = {},
}: {
  categories: { id: string; label: string }[];
  templates: GalleryTemplate[];
  /** Real per-design ratings (lib/stats.ts) — shown only where they exist. */
  ratings?: Record<string, { average: number; count: number }>;
}) {
  const t = useTranslations("landing");
  const occasions = [...categories]
    .filter((c) => templates.some((tpl) => tpl.category === c.id))
    .sort((a, b) => OCCASION_ORDER.indexOf(a.id) - OCCASION_ORDER.indexOf(b.id));
  const [occasion, setOccasion] = useState<string>(occasions[0]?.id ?? "");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      const toGroup: Record<string, Tier> = { free: "free", value: "standard", premium: "premium" };
      if (occasions.some((c) => c.id === id)) {
        setOccasion(id);
        setOpen({});
        document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
      } else if (toGroup[id]) {
        const tier = toGroup[id];
        // 3D designs are weddings; otherwise stay on the chosen occasion.
        if (tier === "premium") setOccasion("wedding");
        setTimeout(() => document.getElementById(`tier-${tier}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    };
    const first = setTimeout(fromHash, 0); // after hydration
    window.addEventListener("hashchange", fromHash);
    return () => {
      clearTimeout(first);
      window.removeEventListener("hashchange", fromHash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A single-occasion page (/invitations/<category>) passes no categories.
  const inOccasion = occasions.length ? templates.filter((tpl) => tpl.category === occasion) : templates;
  const groups = TIERS.map((tier) => ({
    tier,
    items: inOccasion
      .filter((tpl) => templateTier(tpl.id) === tier)
      .map((tpl, i) => ({ tpl, i }))
      // New designs, then our picks, then the rest.
      .sort(
        (a, b) =>
          (isNewTemplate(a.tpl.id) ? 0 : EDITORS_PICKS.includes(a.tpl.id) ? 1 : 2) -
            (isNewTemplate(b.tpl.id) ? 0 : EDITORS_PICKS.includes(b.tpl.id) ? 1 : 2) || a.i - b.i
      )
      .map(({ tpl }) => tpl),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {occasions.length > 0 && (
        <div
          role="tablist"
          aria-label={t("categoriesLabel")}
          className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
        >
          {occasions.map((c) => {
            const on = occasion === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setOccasion(c.id);
                  setOpen({});
                }}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                  on
                    ? "bg-[#3d1236] text-[#ffe9b8] shadow-[0_8px_18px_-8px_rgba(61,18,54,0.8)] dark:bg-[#ffe9b8] dark:text-[#3d1236]"
                    : "bg-white text-[#3d1236] ring-1 ring-[#3d1236]/10 hover:ring-[#e8b04a] dark:bg-white/5 dark:text-[#f6e7d0] dark:ring-white/10"
                }`}
              >
                <span aria-hidden className="text-base">
                  {OCCASION_ICON[c.id] ?? "✨"}
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-12">
        {groups.map(({ tier, items }) => {
          const expanded = open[tier];
          const price = tierPriceInr(tier);
          const usual = tier === "free" ? null : templateListPriceInr(items[0].id);
          return (
            <section key={tier} id={`tier-${tier}`} className="scroll-mt-28">
              {/* The group's price and, in one line, what it gets you. */}
              <header className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <div>
                  <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-[#2a0c27] sm:text-2xl dark:text-[#fff6e6]">
                    {tier === "free" ? (
                      <Gift size={20} className="text-emerald-600" aria-hidden />
                    ) : tier === "premium" ? (
                      <Crown size={20} className="text-[#c98f3a]" aria-hidden />
                    ) : (
                      <Sparkles size={20} className="text-[#c98f3a]" aria-hidden />
                    )}
                    {t(`tiers.${tier}.name`)}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${
                        tier === "free"
                          ? "bg-emerald-600 text-white"
                          : "bg-gradient-to-r from-[#ffe08a] to-[#e8b04a] text-[#2a0c27]"
                      }`}
                    >
                      {tier === "free" ? t("free") : `₹${price}`}
                      {usual && <s className="ml-1 text-xs font-medium opacity-50">₹{usual}</s>}
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{t(`tiers.${tier}.gets`)}</p>
                </div>
                <a href="#compare" className="text-xs font-semibold text-[#b0791f] underline underline-offset-2 dark:text-[#ffd35c]">
                  {t("tiers.whatsIncluded")}
                </a>
              </header>

              <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {items.map((tpl, i) => (
                  <li
                    key={tpl.id}
                    className={expanded ? "" : i >= FIRST.desktop ? "hidden" : i >= FIRST.phone ? "hidden md:block" : ""}
                  >
                    <DesignCard tpl={tpl} rating={ratings[tpl.id]} />
                  </li>
                ))}
              </ul>

              {!expanded && items.length > FIRST.phone && (
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [tier]: true }))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#3d1236]/15 px-5 py-2.5 text-sm font-semibold text-[#3d1236] hover:border-[#e8b04a] dark:border-white/15 dark:text-[#f6e7d0]"
                  >
                    {t("showAll", { count: items.length })}
                    <ChevronDown size={16} aria-hidden />
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** A short card: the live opening (4:5), its price, and one row with the
 * name and an arrow into the editor. */
function DesignCard({ tpl, rating }: { tpl: GalleryTemplate; rating?: { average: number; count: number } }) {
  const t = useTranslations("landing");
  const tier = templateTier(tpl.id);
  const price = templatePriceInr(tpl.id);
  const usual = templateListPriceInr(tpl.id);
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#fffaf2] shadow-[0_14px_30px_-18px_rgba(61,18,54,0.55)] ring-1 transition duration-300 hover:-translate-y-1 dark:bg-[#1c1220] ${
        tier === "premium" ? "ring-[#e8b04a]/80" : "ring-[#3d1236]/10 dark:ring-[#e8b04a]/20"
      }`}
    >
      <div className="relative">
        <TemplateShowcase {...tpl.showcase} aspect={4 / 5} />
        <span
          className={`pointer-events-none absolute top-2 right-2 z-30 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold shadow-md ${
            tier === "free"
              ? "bg-emerald-600 text-white"
              : tier === "premium"
                ? "bg-gradient-to-r from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-[#2a0c27]"
                : "bg-white/95 text-[#3d1236] dark:bg-[#22091f]/90 dark:text-[#ffe9b8]"
          }`}
        >
          {tier === "free" ? (
            <>
              <Gift size={11} aria-hidden />
              {t("free")}
            </>
          ) : (
            <>
              {tier === "premium" && <Crown size={11} aria-label={t("premium")} />}
              {usual && <s className="text-[10px] font-medium opacity-50">₹{usual}</s>}₹{price}
            </>
          )}
        </span>
      </div>
      <Link
        href={`/create/${tpl.id}`}
        aria-label={`${t("useTemplate")} — ${tpl.name}`}
        className="flex flex-1 items-center justify-between gap-2 px-3 py-2.5"
      >
        <span className="min-w-0">
          {isNewTemplate(tpl.id) && (
            <span className="mb-0.5 flex items-center gap-1 text-[10px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
              <Sparkles size={10} aria-hidden />
              {t("badgeNew")}
            </span>
          )}
          <h4 className="line-clamp-2 font-serif text-[14px] leading-tight font-bold text-[#2a0c27] sm:text-base dark:text-[#fff6e6]">
            {tpl.name}
          </h4>
          {rating && (
            <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-[#7a4a12] dark:text-[#ffd35c]">
              <Star size={11} className="fill-[#f2c45a] text-[#c98f3a]" aria-hidden />
              {rating.average.toFixed(1)}
              <span className="font-normal text-neutral-500 dark:text-neutral-400">({rating.count})</span>
            </span>
          )}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-[#2a0c27] shadow-[0_6px_14px_-6px_rgba(201,143,58,0.9)] transition group-hover:scale-110">
          <ArrowRight size={15} aria-hidden />
        </span>
      </Link>
    </article>
  );
}

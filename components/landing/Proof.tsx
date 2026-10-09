import { getFormatter, getTranslations } from "next-intl/server";
import { Eye, Heart, Send, Star, TrendingUp } from "lucide-react";
import type { SiteStats } from "@/lib/stats";

/**
 * "By the numbers" under the hero — real counts from lib/stats.ts. Each
 * tile appears only once its number is meaningful; with none yet, the strip
 * isn't shown at all.
 */
export default async function Proof({ stats }: { stats: SiteStats }) {
  const t = await getTranslations("landing.proof");
  const format = await getFormatter();
  const n = (v: number) => format.number(v);
  const tiles = [
    stats.rating && { icon: Star, value: `${stats.rating.average.toFixed(1)} ★`, label: t("rating", { count: stats.rating.count }) },
    stats.published && { icon: Send, value: n(stats.published), label: t("published") },
    stats.opens && { icon: Eye, value: n(stats.opens), label: t("opens") },
    stats.rsvps && { icon: Heart, value: n(stats.rsvps), label: t("rsvps") },
    stats.upgrade && { icon: TrendingUp, value: `${stats.upgrade.percent}%`, label: t("upgrade") },
  ].filter(Boolean) as { icon: typeof Star; value: string; label: string }[];
  if (tiles.length === 0) return null;

  return (
    <section aria-label={t("label")} className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <ul className={`grid gap-3 ${tiles.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : tiles.length === 3 ? "grid-cols-3" : tiles.length === 2 ? "grid-cols-2" : "mx-auto max-w-xs grid-cols-1"}`}>
        {tiles.map(({ icon: Icon, value, label }) => (
          <li key={label} className="rounded-2xl bg-[#fffaf2] p-4 text-center ring-1 ring-[#e8b04a]/30 dark:bg-[#1c1220]">
            <Icon size={18} className="mx-auto text-[#c98f3a]" aria-hidden />
            <p className="mt-1 font-serif text-2xl font-bold text-[#2a0c27] dark:text-[#fff6e6]">{value}</p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">{label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

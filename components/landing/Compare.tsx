import { getTranslations } from "next-intl/server";
import { Check, Crown, Gift, Minus, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TIER_PRICES, offerActive, tierPriceInr } from "@/lib/pricing";

/**
 * What each price gets you, line by line: Free card / Live invitation /
 * Premium 3D. `true` is included, `false` isn't, a string is "included,
 * with this note". Every line must match what the product really does.
 */
const ROWS: { key: string; cells: [boolean | string, boolean | string, boolean | string] }[] = [
  { key: "preview", cells: [true, true, true] },
  { key: "languages", cells: [true, true, true] },
  { key: "card", cells: ["cardFree", "cardPaid", "cardPaid"] },
  { key: "link", cells: [false, true, true] },
  { key: "opening", cells: [false, true, true] },
  { key: "rsvp", cells: [false, true, true] },
  { key: "personal", cells: [false, true, true] },
  { key: "details", cells: [false, true, true] },
  { key: "story", cells: [false, true, true] },
  { key: "music", cells: [false, true, true] },
  { key: "guests", cells: [false, true, true] },
  { key: "qr", cells: [false, true, true] },
  { key: "edit", cells: [false, true, true] },
  { key: "live", cells: [false, true, true] },
  { key: "world", cells: [false, false, true] },
  { key: "camera", cells: [false, false, true] },
];

export default async function Compare() {
  const t = await getTranslations("landing.compare");
  const offer = offerActive();
  const cols = [
    { key: "free", icon: Gift, price: 0, usual: null as number | null, href: "/#free", hot: false },
    {
      key: "standard",
      icon: Sparkles,
      price: tierPriceInr("standard"),
      usual: offer ? TIER_PRICES.standard.usual : null,
      href: "/#value",
      hot: true,
    },
    {
      key: "premium",
      icon: Crown,
      price: tierPriceInr("premium"),
      usual: offer ? TIER_PRICES.premium.usual : null,
      href: "/#premium",
      hot: false,
    },
  ];

  return (
    <div id="compare" className="mx-auto mt-10 max-w-4xl scroll-mt-24 rounded-3xl bg-[#fffaf2] text-[#2a0c27] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] dark:bg-[#1c1220] dark:text-[#fff6e6]">
      {/* Column heads: what it's called, what it costs, where to start. Sticky
          so the ticks below always line up with a name. */}
      <div className="sticky top-[84px] z-10 grid grid-cols-3 rounded-t-3xl border-b border-[#e8b04a]/30 bg-[#fffaf2] shadow-[0_6px_12px_-10px_rgba(0,0,0,0.4)] sm:grid-cols-[1.6fr_1fr_1fr_1fr] dark:bg-[#1c1220]">
        <div className="hidden items-end p-4 text-sm font-semibold text-neutral-500 sm:flex dark:text-neutral-400">{t("whatYouGet")}</div>
        {cols.map(({ key, icon: Icon, price, usual, href, hot }) => (
          <div key={key} className={`relative flex flex-col items-center gap-1 px-1.5 pt-4 pb-2.5 text-center sm:p-4 ${hot ? "bg-[#f6ead2] dark:bg-[#33201f]" : ""}`}>
            {hot && (
              <span className="absolute -top-0 left-1/2 -translate-x-1/2 rounded-b-md bg-[#b3261e] px-2 py-0.5 text-[9px] font-bold tracking-wider whitespace-nowrap text-white uppercase sm:static sm:translate-x-0 sm:rounded-full sm:text-[10px]">
                {t("popular")}
              </span>
            )}
            <Icon size={18} className={`hidden sm:block ${key === "free" ? "text-emerald-600" : "text-[#c98f3a]"}`} aria-hidden />
            <p className="text-[12px] leading-tight font-bold sm:text-sm">{t(`col.${key}`)}</p>
            <p className="font-serif text-xl leading-none font-bold sm:text-2xl">
              {price === 0 ? t("free") : `₹${price}`}
              {usual && <s className="ml-1 font-sans text-[11px] font-medium opacity-50">₹{usual}</s>}
            </p>
            <Link
              href={href}
              className={`mt-1 hidden h-8 items-center rounded-full px-3 text-xs font-bold sm:inline-flex ${
                hot
                  ? "bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-[#2a0c27]"
                  : "ring-1 ring-[#3d1236]/20 dark:ring-white/20"
              }`}
            >
              {t(`cta.${key}`)}
            </Link>
          </div>
        ))}
      </div>

      <ul>
        {ROWS.map(({ key, cells }, i) => (
          <li
            key={key}
            className={`grid grid-cols-3 items-center sm:grid-cols-[1.6fr_1fr_1fr_1fr] ${i % 2 ? "bg-[#3d1236]/[0.03] dark:bg-white/[0.03]" : ""}`}
          >
            {/* Phones: the feature on its own line above the three ticks. */}
            <p className="col-span-3 px-4 pt-3 text-[13px] font-semibold sm:col-span-1 sm:py-3 sm:text-sm">{t(`rows.${key}`)}</p>
            {cells.map((cell, c) => (
              <div key={c} className={`flex justify-center px-1 pt-1 pb-3 text-center sm:py-3 ${c === 1 ? "bg-[#e8b04a]/12" : ""}`}>
                {cell === false ? (
                  <Minus size={16} className="text-neutral-300 dark:text-neutral-600" aria-label={t("notIncluded")} />
                ) : (
                  <span className="flex flex-col items-center gap-0.5">
                    <Check size={17} className="text-emerald-600" aria-label={t("included")} />
                    {typeof cell === "string" && <span className="text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">{t(`notes.${cell}`)}</span>}
                  </span>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
      {/* Phones: the three buttons under the list, where the decision is made. */}
      <div className="grid grid-cols-3 gap-1.5 border-t border-[#e8b04a]/30 p-2 sm:hidden">
        {cols.map(({ key, href, hot }) => (
          <Link
            key={key}
            href={href}
            className={`flex h-10 items-center justify-center rounded-full text-xs font-bold ${
              hot ? "bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-[#2a0c27]" : "ring-1 ring-[#3d1236]/20 dark:ring-white/20"
            }`}
          >
            {t(`cta.${key}`)}
          </Link>
        ))}
      </div>
      <p className="border-t border-[#e8b04a]/30 px-4 py-3 text-center text-xs text-neutral-500 dark:text-neutral-400">{t("footnote")}</p>
    </div>
  );
}

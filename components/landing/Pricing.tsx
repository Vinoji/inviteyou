import { getTranslations } from "next-intl/server";
import { Check, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PRICE_INR } from "@/lib/pricing";

const FREE_ITEMS = ["free1", "free2", "free3", "free4", "free5"] as const;
const PAID_ITEMS = ["paid1", "paid2", "paid3", "paid4", "paid5", "paid6", "paid7", "paid8"] as const;
const TEAM_ITEMS = ["team1", "team2", "team3"] as const;

/**
 * Home-page pricing: the real offer — design and preview free, one flat
 * price to publish (lib/pricing.ts, the same constant the payment route
 * charges), and a contact option for planners.
 */
export default async function Pricing() {
  const t = await getTranslations("landing.pricing");

  const plans = [
    {
      key: "free",
      name: t("freeName"),
      price: "₹0",
      unit: t("freeUnit"),
      blurb: t("freeBlurb"),
      items: FREE_ITEMS.map((k) => t(k)),
      cta: { href: "/#templates", label: t("freeCta") },
      featured: false,
    },
    {
      key: "paid",
      name: t("paidName"),
      price: `₹${PRICE_INR}`,
      unit: t("paidUnit"),
      blurb: t("paidBlurb"),
      items: PAID_ITEMS.map((k) => t(k)),
      cta: { href: "/#templates", label: t("paidCta") },
      featured: true,
    },
    {
      key: "team",
      name: t("teamName"),
      price: t("teamPrice"),
      unit: t("teamUnit"),
      blurb: t("teamBlurb"),
      items: TEAM_ITEMS.map((k) => t(k)),
      cta: { href: "/support#contact", label: t("teamCta") },
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-24 border-t border-neutral-100 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">{t("eyebrow")}</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-neutral-50">
            {t("title")}
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">{t("subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-3xl border p-6 sm:p-7 ${
                plan.featured
                  ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white shadow-xl shadow-amber-600/10 md:-my-3 dark:from-amber-500/10 dark:to-neutral-900"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow">
                  <Sparkles size={12} aria-hidden />
                  {t("popular")}
                </span>
              )}
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{plan.name}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{plan.blurb}</p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="font-serif text-4xl font-bold text-neutral-900 dark:text-neutral-50">{plan.price}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{plan.unit}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta.href}
                className={`mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-gradient-to-r from-amber-700 to-orange-500 text-white shadow hover:brightness-105"
                    : "border border-neutral-300 text-neutral-800 hover:border-amber-500 hover:text-amber-700 dark:border-neutral-700 dark:text-neutral-200"
                }`}
              >
                {plan.cta.label}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">{t("note")}</p>
      </div>
    </section>
  );
}

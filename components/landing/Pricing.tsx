import { getTranslations } from "next-intl/server";
import { BadgeIndianRupee, Crown, Palette, Repeat, ShieldCheck, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LOWEST_PRICE_INR, PRICES_VARY } from "@/lib/pricing";
import { Garland, Petals, Stars, Thoranam } from "../site/festive";
import f from "./landing.module.css";

const FREE_ITEMS = ["free1", "free2", "free3", "free4", "free5"] as const;
const PAID_ITEMS = ["paid1", "paid2", "paid3", "paid4", "paid5", "paid6", "paid7", "paid8"] as const;
const TEAM_ITEMS = ["team1", "team2", "team3"] as const;

/**
 * Home-page pricing, set like a function hall: a dusk stage with a
 * thoranam, each plan a temple-arch card with its price in a scalloped
 * seal (the featured one in red wax, under a "Most loved" ribbon and a
 * garland). The price is lib/pricing.ts — the same prices the payment
 * route charges ("from ₹…" once templates differ).
 */
export default async function Pricing() {
  const t = await getTranslations("landing.pricing");

  const plans = [
    {
      key: "free",
      icon: Palette,
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
      icon: Crown,
      name: t("paidName"),
      price: `₹${LOWEST_PRICE_INR}`,
      // "from" on its own small line, so the price fits the seal on phones.
      pre: PRICES_VARY ? t("paidFromLabel") : undefined,
      unit: t("paidUnit"),
      blurb: t("paidBlurb"),
      items: PAID_ITEMS.map((k) => t(k)),
      cta: { href: "/#templates", label: t("paidCta") },
      featured: true,
    },
    {
      key: "team",
      icon: Users,
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
    <section id="pricing" className={`scroll-mt-20 ${f.pricingStage}`}>
      <Stars />
      <Thoranam />
      <Petals />
      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-28 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className={f.eyebrow}>{t("eyebrow")}</p>
          <h2 className={f.h2}>{t("title")}</h2>
          <p className="mt-3 text-[#fff6e6]/80">{t("subtitle")}</p>
        </div>

        <div className={`mt-16 ${f.pricingGrid}`}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.key} className={`${f.archCard} ${plan.featured ? f.archFeatured : ""}`}>
                <span className={f.medallion} aria-hidden>
                  <Icon size={22} />
                </span>
                {plan.featured && (
                  <>
                    <div className={f.archGarland} aria-hidden>
                      <Garland id="pricing-garland" />
                    </div>
                    <span className={f.ribbon}>{t("popular")}</span>
                  </>
                )}
                <h3 className={f.planName}>{plan.name}</h3>
                <p className={f.planBlurb}>{plan.blurb}</p>
                <div className={`${f.seal} ${plan.featured ? f.sealWax : ""}`}>
                  <div className={f.sealInner}>
                    <div>
                      {"pre" in plan && plan.pre && <div className={f.sealPre}>{plan.pre}</div>}
                      <div className={`${f.sealPrice} ${plan.price.length > 5 ? f.sealPriceLong : ""}`}>{plan.price}</div>
                      {plan.unit && <div className={f.sealUnit}>{plan.unit}</div>}
                    </div>
                  </div>
                </div>
                <ul className={f.planItems}>
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href={plan.cta.href} className={plan.featured ? `${f.ctaPrimary} mt-6 justify-center` : f.planCtaGhost}>
                  {plan.cta.label}
                </Link>
              </div>
            );
          })}
        </div>

        <div className={f.trustRow}>
          <span className={f.trustChip}>
            <Repeat size={15} aria-hidden />
            {t("trustNoSub")}
          </span>
          <span className={f.trustChip}>
            <BadgeIndianRupee size={15} aria-hidden />
            {t("trustNoHidden")}
          </span>
          <span className={f.trustChip}>
            <ShieldCheck size={15} aria-hidden />
            {t("trustSecure")}
          </span>
        </div>
        <p className="mt-4 text-center text-xs text-[#fff6e6]/60">{t("note")}</p>
      </div>
    </section>
  );
}

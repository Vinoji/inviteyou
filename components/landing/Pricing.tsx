import { getTranslations } from "next-intl/server";
import { BadgeIndianRupee, Repeat, Send, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { tierPriceInr } from "@/lib/pricing";
import { Petals, Stars, Thoranam } from "../site/festive";
import f from "./landing.module.css";
import OfferCountdown from "./OfferCountdown";
import Compare from "./Compare";
import SavingsCalculator from "./SavingsCalculator";

/**
 * Home-page pricing on a dusk stage: the launch countdown, then exactly
 * what each price gets you (Compare), the savings against printed cards,
 * and the trust points. Prices come from lib/pricing.ts — the same prices
 * the payment route charges.
 */
export default async function Pricing() {
  const t = await getTranslations("landing.pricing");

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
        <OfferCountdown className="mx-auto mt-8 max-w-2xl" />

        <Compare />

        <SavingsCalculator price={tierPriceInr("standard")} />

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
          <span className={f.trustChip}>
            <Send size={15} aria-hidden />
            {t("trustValue")}
          </span>
        </div>
        <p className="mt-4 text-center text-xs text-[#fff6e6]/60">{t("note")}</p>
        <p className="mt-2 text-center text-xs text-[#fff6e6]/70">
          {t("teamLine")}{" "}
          <Link href="/support#contact" className="font-semibold text-[#ffd35c] underline underline-offset-2">
            {t("teamCta")}
          </Link>
        </p>
      </div>
    </section>
  );
}

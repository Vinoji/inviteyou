"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { USUAL_PRICES } from "@/lib/pricing";
import { OFFER_LOOKS } from "@/components/offers/themes";
import { timeLeft, useOffer } from "@/components/offers/useOffer";
import { isSitePage } from "./SiteHeader";
import a from "@/components/offers/festivalArt.module.css";

/**
 * The offer in force — the launch offer or a festival's (lib/festivals.ts)
 * — as one slim strip at the very top of the site's pages, in that
 * festival's colours: its name, both prices, the real time left and a link
 * to the designs. It changes by itself as offers start and end, and is
 * gone between offers. Not shown in the editor or on invitations.
 */
export default function OfferBar() {
  const t = useTranslations("landing.offer");
  const tf = useTranslations("festivals");
  const pathname = usePathname();
  const { now, offer } = useOffer(30_000);

  if (!isSitePage(pathname) || !offer) return null;
  const look = OFFER_LOOKS[offer.theme];
  const left = now === null ? null : timeLeft(offer.endsAt, now);

  return (
    <Link
      href="/#templates"
      style={
        look.photo
          ? {
              backgroundImage: `linear-gradient(90deg, ${look.tint}e6, ${look.tint}b3 50%, ${look.tint}e6), url(${look.photo})`,
              color: "#fff",
            }
          : { background: look.bar, color: look.barInk }
      }
      className={`relative z-50 flex ${look.photo ? a.barPhoto : ""} min-h-9 items-center justify-center gap-x-2 px-3 py-1.5 text-center text-[12.5px] leading-tight font-semibold sm:text-sm`}
    >
      <span aria-hidden className="motion-safe:animate-bounce [animation-duration:2.4s]">
        {look.icon}
      </span>
      <span className="min-[360px]:whitespace-nowrap">
        <span className="hidden font-extrabold min-[400px]:inline">
          {tf("offerName", { name: tf(`${offer.theme}.name`) })}:{" "}
        </span>
        {t("barLive")} <b style={look.photo ? { color: look.gold } : undefined}>₹{offer.prices.standard}</b> <s className="opacity-60">₹{USUAL_PRICES.standard}</s>
        <span className="hidden sm:inline">
          {" · "}
          {t("bar3d")} <b style={look.photo ? { color: look.gold } : undefined}>₹{offer.prices.premium}</b> <s className="opacity-60">₹{USUAL_PRICES.premium}</s>
        </span>
        {left && (
          <span className="tabular-nums">
            {" · "}
            {t("barLeft", { d: left.d, h: left.h })}
          </span>
        )}
      </span>
      <ArrowRight size={14} className="shrink-0" aria-hidden />
    </Link>
  );
}

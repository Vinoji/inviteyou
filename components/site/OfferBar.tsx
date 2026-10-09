"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { OFFER_ENDS_AT, TIER_PRICES } from "@/lib/pricing";
import { isSitePage } from "./SiteHeader";

/**
 * The launch offer, as one slim gold strip at the very top of the site's
 * pages (above the header, scrolling away with the page): both offer
 * prices, the real time left (OFFER_ENDS_AT), and a link to the designs.
 * Gone once the offer ends; not shown in the editor or on invitations.
 */
export default function OfferBar() {
  const t = useTranslations("landing.offer");
  const pathname = usePathname();
  // Rendered after mount: the minutes would never match the server's.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!isSitePage(pathname) || (now !== null && now > OFFER_ENDS_AT)) return null;
  const left = now === null ? null : Math.max(0, OFFER_ENDS_AT - now);
  const d = left === null ? 0 : Math.floor(left / 86_400_000);
  const h = left === null ? 0 : Math.floor(left / 3_600_000) % 24;
  const { standard, premium } = TIER_PRICES;

  return (
    <Link
      href="/#templates"
      className="relative z-50 flex min-h-9 items-center justify-center gap-x-2 bg-gradient-to-r from-[#c98f3a] via-[#ffe08a] to-[#c98f3a] px-3 py-1.5 text-center text-[12.5px] leading-tight font-semibold text-[#2a0c27] sm:text-sm"
    >
      <span aria-hidden>🔥</span>
      <span className="min-[360px]:whitespace-nowrap">
        <span className="hidden font-extrabold min-[400px]:inline">{t("title")}: </span>
        {t("barLive")} <b>₹{standard.offer}</b> <s className="opacity-60">₹{standard.usual}</s>
        <span className="hidden sm:inline">
          {" · "}
          {t("bar3d")} <b>₹{premium.offer}</b> <s className="opacity-60">₹{premium.usual}</s>
        </span>
        {left !== null && (
          <span className="tabular-nums">
            {" · "}
            {t("barLeft", { d, h })}
          </span>
        )}
      </span>
      <ArrowRight size={14} className="shrink-0" aria-hidden />
    </Link>
  );
}

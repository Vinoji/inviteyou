"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { TIER_PRICES, offerActive, tierPriceInr } from "@/lib/pricing";
import { Crown, Gift, Play, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useReducedMotionPref } from "@/lib/motionPref";
import TemplateShowcase, { type ShowcaseProps } from "./TemplateShowcase";
import { Diya, Grain, Hills, Kolam, Petals, Stars, Thoranam } from "../site/festive";
import s from "./landing.module.css";

const CYCLE_MS = 7000;

/**
 * The home-page hero: a dusk "stage" in paper-cut layers. A phone in a
 * temple arch plays real invitation openings in turn (tap to try one);
 * stickers around it show what guests get — RSVPs, WhatsApp, calendar.
 * The scene leans gently toward the pointer.
 */
export default function Hero({ featured }: { featured: ShowcaseProps[] }) {
  const t = useTranslations("landing.hero");
  const reduced = useReducedMotionPref();
  const rootRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [pausedUntil, setPausedUntil] = useState(0);

  // Rotate through the featured openings, pausing after a guest taps one.
  useEffect(() => {
    if (reduced || featured.length < 2) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntil) return;
      setIndex((i) => (i + 1) % featured.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [reduced, featured.length, pausedUntil]);

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  }

  const current = featured[index];

  return (
    <section ref={rootRef} className={s.hero} onPointerMove={onPointerMove}>
      <Grain />
      <Stars />
      <Kolam />
      <Thoranam />
      <Petals />

      <div className={s.heroInner}>
        <div>
          <span className={s.chip}>
            <Sparkles size={14} aria-hidden />
            {t("chip")}
          </span>
          <h1 className={s.title}>
            {t.rich("title", {
              hl: (chunks) => (
                <span className={s.hl}>
                  {chunks}
                  <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden>
                    <path pathLength={1} d="M3 14 C40 4 90 4 120 10 S180 16 197 6" />
                  </svg>
                </span>
              ),
            })}
          </h1>
          <p className={s.subtitle}>{t("subtitle")}</p>
          <div className={s.ctas}>
            <Link href="/#templates" className={s.ctaPrimary}>
              <Sparkles size={17} aria-hidden />
              {t("ctaPrimary")}
            </Link>
            <Link href="/demo" className={s.ctaGhost}>
              <Play size={16} aria-hidden />
              {t("ctaSecondary")}
            </Link>
          </div>
          {/* The three ways to buy, each a tap away from its designs. */}
          <ul className={s.priceStrip}>
            <li>
              <Link href="/#free" className={s.pricePill}>
                <Gift size={15} aria-hidden />
                <span>{t("priceFree")}</span>
              </Link>
            </li>
            <li>
              <Link href="/#value" className={`${s.pricePill} ${s.pricePillHot}`}>
                <Sparkles size={15} aria-hidden />
                <span>
                  {offerActive() && <s className={s.priceWas}>₹{TIER_PRICES.standard.usual}</s>} ₹{tierPriceInr("standard")}{" "}
                  {t("priceLive")}
                </span>
              </Link>
            </li>
            <li>
              <Link href="/#premium" className={s.pricePill}>
                <Crown size={15} aria-hidden />
                <span>
                  ₹{tierPriceInr("premium")} {t("price3d")}
                </span>
              </Link>
            </li>
          </ul>
        </div>

        <div className={s.stage}>
          <div className={s.arch} aria-hidden>
            <div className={s.archGlow} />
          </div>
          <div className={s.phone}>
            <div className={s.screen} onPointerDown={() => setPausedUntil(Date.now() + 20000)}>
              <div className={s.notch} aria-hidden />
              {current && (
                <div key={current.templateId} className={s.fadeIn}>
                  <TemplateShowcase {...current} hintAt="bottom" />
                </div>
              )}
            </div>
            {featured.length > 1 && (
              <div className={s.dots}>
                {featured.map((f, i) => (
                  <button
                    key={f.templateId}
                    type="button"
                    aria-label={t("showDesign", { n: i + 1 })}
                    aria-pressed={i === index}
                    onClick={() => {
                      setIndex(i);
                      setPausedUntil(Date.now() + 20000);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={`${s.sticker} ${s.stickerRsvp}`} aria-hidden>
            <span className={s.avatars}>
              {["#f59e0b", "#ec4899", "#10b981"].map((c) => (
                <span key={c} style={{ background: c } as CSSProperties} />
              ))}
            </span>
            <span>
              <b>{t("rsvpTitle")}</b>
              {t("rsvpBody")}
            </span>
          </div>
          <div className={`${s.sticker} ${s.stickerWa}`} aria-hidden>
            <span>
              <b>{t("waTitle")}</b>
              {t("waBody")}
            </span>
          </div>
          <div className={`${s.sticker} ${s.stickerCal}`} aria-hidden>
            <span className={s.calIcon}>
              <span>{t("calMonth")}</span>
              <span>24</span>
            </span>
            <span>
              <b>{t("calTitle")}</b>
              {t("calBody")}
            </span>
          </div>
          <Diya className={s.diyaL} />
          <Diya className={s.diyaR} />
        </div>
      </div>

      <Hills />
    </section>
  );
}

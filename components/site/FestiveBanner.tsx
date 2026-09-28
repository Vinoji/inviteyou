import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Diya, Grain, Hills, Petals, Stars, Thoranam } from "./festive";
import s from "../landing/landing.module.css";

/**
 * The festive page banner used at the top of every site page (Demos,
 * Support, Privacy…): the home hero's dusk stage — stars, thoranam,
 * petals, lamps and paper hills — around a centred title. Sits under the
 * transparent header, which switches to light text over it.
 */
export default function FestiveBanner({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className={s.banner}>
      <Grain />
      <Stars />
      <Thoranam />
      <Petals />
      <div className={s.bannerInner}>
        <span className={s.chip}>
          <Sparkles size={14} aria-hidden />
          {eyebrow}
        </span>
        <h1 className={s.bannerTitle}>{title}</h1>
        {intro && <p className={s.bannerIntro}>{intro}</p>}
        {children}
      </div>
      <Diya className={`${s.bannerDiya} ${s.diyaL}`} />
      <Diya className={`${s.bannerDiya} ${s.diyaR}`} />
      <Hills />
    </section>
  );
}

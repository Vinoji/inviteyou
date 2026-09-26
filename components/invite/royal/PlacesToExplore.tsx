"use client";

import { useRef, useState } from "react";
import { Crown, Landmark, Mountain, Sparkles, Waves } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Place, PlaceScene } from "@/lib/types";
import { SceneArt } from "./Decor";
import MotionHeading from "../motion/MotionHeading";
import s from "./royal.module.css";

const SCENE_ICON: Record<PlaceScene, typeof Crown> = {
  temple: Sparkles,
  palace: Crown,
  nature: Mountain,
  heritage: Landmark,
  beach: Waves,
};

/** Must match `.slides { gap }` in royal.module.css. */
const SLIDE_GAP = 14;

/** "Places to Explore": a swipeable, scroll-snapped card per nearby sight. */
export default function PlacesToExplore({ places, city }: { places: Place[]; city: string }) {
  const t = useTranslations("invite.royal.places");
  const [active, setActive] = useState(0);
  const slidesRef = useRef<HTMLDivElement>(null);
  if (places.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  // One slide's width plus the flex gap between slides.
  const step = (el: HTMLElement) => (el.scrollWidth + SLIDE_GAP) / places.length;
  const scrollTo = (i: number) => {
    const el = slidesRef.current;
    if (el) el.scrollTo({ left: i * step(el), behavior: "smooth" });
  };

  return (
    <section className={`${s.section} ${s.places}`}>
      <div className={s.head}>
        <div className={s.eyebrow}>{t("eyebrow")}</div>
        <MotionHeading>{t("heading")}</MotionHeading>
        <p>{city ? t("sub", { city }) : t("subNoCity")}</p>
      </div>
      <div className={s.carousel}>
        <div
          ref={slidesRef}
          className={s.slides}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / step(el)));
          }}
        >
          {places.map((p, i) => {
            const Icon = SCENE_ICON[p.scene] ?? Landmark;
            return (
              <article key={i} className={s.place}>
                <div className={s.scene}>
                  <SceneArt scene={p.scene} />
                  <span className={s.count}>
                    {pad(i + 1)} / {pad(places.length)}
                  </span>
                </div>
                <div className={s.placeBody}>
                  <div className={s.badge}>
                    <Icon size={18} aria-hidden />
                  </div>
                  <h4>{p.title}</h4>
                  {p.description && <p>{p.description}</p>}
                  {p.distance && <div className={s.km}>{p.distance}</div>}
                </div>
              </article>
            );
          })}
        </div>
        {places.length > 1 && (
          <div className={s.dots}>
            {places.map((p, i) => (
              <button
                key={i}
                type="button"
                className={i === active ? s.dotOn : undefined}
                aria-label={p.title}
                aria-current={i === active}
                onClick={() => scrollTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

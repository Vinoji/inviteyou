"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import b from "./booklet.module.css";

export interface BookPage {
  key: string;
  /** Names the page for the page dots (screen readers, tooltips). */
  title: string;
  /** "navy" pages are dark with light text (RSVP, back cover). */
  tone?: "paper" | "navy";
  /** The page's content stretches to the full page height (covers). */
  fill?: boolean;
  node: ReactNode;
}

/** Forward: the page on top turns over to the left while the next one
 * shows underneath. Back: the previous page turns back over from the left. */
const FLIP: Variants = {
  enter: (dir: number) =>
    dir > 0 ? { rotateY: 0, opacity: 0.4, zIndex: 1 } : { rotateY: -115, opacity: 0.2, zIndex: 3 },
  center: {
    rotateY: 0,
    opacity: 1,
    zIndex: 2,
    transition: { duration: 0.6, ease: [0.3, 0.6, 0.25, 1] },
  },
  exit: (dir: number) =>
    dir > 0
      ? { rotateY: -115, opacity: 0.2, zIndex: 3, transition: { duration: 0.6, ease: [0.45, 0, 0.55, 1] } }
      : { opacity: 0.4, zIndex: 1, transition: { duration: 0.6 } },
};
const FADE: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** True when the gesture started in something that scrolls sideways (the
 * photo row, Places to Explore) or a form field, so a swipe there isn't
 * taken as a page turn. */
function ownsGesture(target: EventTarget | null, root: HTMLElement | null) {
  let el = target instanceof HTMLElement ? target : null;
  while (el && el !== root) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return true;
    // The page's own vertical scroller computes overflow-x as "auto" too;
    // it is not a sideways scroller, so a swipe on it still turns the page.
    if (el.hasAttribute("data-page-scroll")) return false;
    const ox = getComputedStyle(el).overflowX;
    if ((ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth + 2) return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * The chapel invitation as an order-of-service booklet: one page at a time,
 * turned with a 3D page flip — by the arrows, the page dots, a sideways
 * swipe, or the arrow keys. A page taller than the booklet scrolls inside
 * itself. Reduced motion: pages cross-fade.
 */
export default function ChapelBooklet({ pages }: { pages: BookPage[] }) {
  const t = useTranslations("invite.chapel.booklet");
  const reduceMotion = useSafeReducedMotion();
  const [[index, dir], setPage] = useState<[number, number]>([0, 1]);
  const rootRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const last = pages.length - 1;
  const current = Math.min(index, last);
  const page = pages[current];

  const go = (to: number) => {
    const next = Math.max(0, Math.min(last, to));
    if (next !== current) setPage([next, next > current ? 1 : -1]);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") go(current + 1);
    else if (e.key === "ArrowLeft") go(current - 1);
    else return;
    e.preventDefault();
  };
  const onPointerDown = (e: PointerEvent) => {
    // Arrow keys work right after any tap on the book, not only after Tab.
    if (!(e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName))) {
      rootRef.current?.focus({ preventScroll: true });
    }
    swipe.current = ownsGesture(e.target, rootRef.current) ? null : { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
  };

  // A sideways trackpad swipe or shift-wheel turns the page too; one turn
  // per gesture (the wheel keeps firing as it coasts).
  const wheelLock = useRef(0);
  const onWheel = (e: WheelEvent) => {
    const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
    if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(e.deltaY) * 1.2) return;
    if (ownsGesture(e.target, rootRef.current)) return;
    const now = Date.now();
    if (now - wheelLock.current < 700) return;
    wheelLock.current = now;
    go(current + (dx > 0 ? 1 : -1));
  };

  return (
    <div
      ref={rootRef}
      className={b.booklet}
      role="region"
      aria-roledescription={t("roleDescription")}
      aria-label={t("label")}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={b.book} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onWheel={onWheel}>
        <span className={b.pagesBehind} aria-hidden />
        <AnimatePresence initial={false} custom={dir}>
          <motion.article
            key={page.key}
            className={`${b.page} ${page.tone === "navy" ? b.navy : ""}`}
            custom={dir}
            variants={reduceMotion ? FADE : FLIP}
            initial="enter"
            animate="center"
            exit="exit"
            aria-label={t("pageOf", { n: current + 1, total: pages.length })}
          >
            <div className={b.pageScroll} data-page-scroll>
              <div className={`${b.pageInner} ${page.fill ? b.fill : ""}`}>{page.node}</div>
            </div>
            <footer className={b.folio} aria-hidden>
              {current + 1}
            </footer>
          </motion.article>
        </AnimatePresence>
      </div>

      <nav className={b.nav} aria-label={t("navLabel")}>
        <button type="button" className={b.arrow} onClick={() => go(current - 1)} disabled={current === 0} aria-label={t("prev")}>
          <ChevronLeft size={20} aria-hidden />
        </button>
        <div className={b.dots}>
          {pages.map((p, i) => (
            <button
              key={p.key}
              type="button"
              className={`${b.dot} ${i === current ? b.dotOn : ""}`}
              onClick={() => go(i)}
              aria-label={t("goTo", { title: p.title })}
              aria-current={i === current ? "page" : undefined}
              title={p.title}
            />
          ))}
        </div>
        <button type="button" className={b.arrow} onClick={() => go(current + 1)} disabled={current === last} aria-label={t("next")}>
          <ChevronRight size={20} aria-hidden />
        </button>
      </nav>
      <p className={b.counter} aria-live="polite">
        {t("pageOf", { n: current + 1, total: pages.length })}
      </p>
    </div>
  );
}

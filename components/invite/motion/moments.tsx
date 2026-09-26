"use client";

import { useRef, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import MandalaMotif from "../decor/MandalaMotif";
import PaisleyCorner from "../decor/PaisleyCorner";
import FloralSprig from "../decor/FloralSprig";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useMotionTheme } from "./MotionThemeProvider";
import { useTraverseProgress } from "./scroll";

/**
 * Template-specific touches inside individual sections, each switched on by
 * a flag in MotionTheme.moments and inert otherwise. Only transform and
 * opacity (and SVG pathLength) animate; reduced motion shows final states.
 */

/** One family block, entering in the template's `moments.family` style:
 * - "doors": slides in from its side, like two halves of a temple door.
 * - "pressed": a pressed-flower card that tilts into place.
 * - "deco": an art-deco line frame draws itself around it.
 * Without a style (or with reduced motion) it renders as-is. */
export function FamilyBlock({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const style = moments?.family;
  if (!style) return <>{children}</>;

  if (style === "deco") {
    return (
      <div style={{ position: "relative", padding: "18px 14px", marginTop: 18 }}>
        <svg
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <motion.path
            d="M12 0H188L200 12V88L188 100H12L0 88V12Z M20 6H180 M20 94H180"
            fill="none"
            stroke="var(--rp-gold, #C9CCD1)"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            initial={reduceMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
        </svg>
        {children}
      </div>
    );
  }

  if (style === "pressed") {
    return (
      <motion.div
        style={{
          position: "relative",
          margin: "18px auto 0",
          maxWidth: 320,
          padding: "16px 14px 18px",
          borderRadius: 6,
          background: "rgba(255,251,245,0.08)",
          border: "1px solid rgba(246,214,214,0.35)",
        }}
        initial={reduceMotion ? false : { rotate: side === "left" ? -6 : 6, opacity: 0, y: 16 }}
        whileInView={{ rotate: 0, opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
      >
        <FloralSprig
          color="#F6D6D6"
          size={30}
          flip={side === "right"}
          className="pointer-events-none absolute -top-3 -right-2 opacity-80"
        />
        {children}
      </motion.div>
    );
  }

  // "doors"
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      initial={{ x: side === "left" ? -60 : 60, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** moments.family "doors": a thali (mangalsutra) line drawing between the families. */
export function Thali({ color }: { color: string }) {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  if (moments?.family !== "doors") return null;
  const draw = reduceMotion
    ? {}
    : {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, amount: 0.8 },
        transition: { duration: 1.4, ease: "easeInOut" as const },
      };
  return (
    <svg
      viewBox="0 0 120 56"
      width="120"
      height="56"
      aria-hidden
      style={{ display: "block", margin: "14px auto 0" }}
    >
      {/* chain */}
      <motion.path
        d="M6 6Q60 60 114 6"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeDasharray="0.1 4"
        strokeLinecap="round"
        {...draw}
      />
      {/* pendant */}
      <motion.path
        d="M60 33c-7 0-10 6-10 10 0 6 5 10 10 10s10-4 10-10c0-4-3-10-10-10z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        {...draw}
      />
      <motion.path
        d="M54 44c2 3 10 3 12 0"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        {...draw}
      />
    </svg>
  );
}

/** moments.events "diyas": a small diya at an event row's left edge that
 * lights as the row scrolls into view. */
export function EventDiya() {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  if (moments?.events !== "diyas") return null;
  return (
    <svg
      viewBox="0 0 20 24"
      width="16"
      height="20"
      aria-hidden
      style={{ position: "absolute", left: -13, top: "50%", marginTop: -12, overflow: "visible" }}
    >
      <path d="M2 16q8 6 16 0l-2 4H4z" fill="var(--rp-gold, #C8962E)" />
      <motion.path
        d="M10 3c3 4 4 8 0 12-4-4-3-8 0-12z"
        fill="#FFC24A"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: "50% 100%", transformBox: "fill-box" }}
      />
    </svg>
  );
}

/** moments.mandalaLayer: a large faint mandala that turns 0→20° as its
 * section crosses the screen. Fills its positioned parent, behind the content. */
export function TempleMandala({ color }: { color: string }) {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const progress = useTraverseProgress(ref);
  const rotate = useTransform(progress, [0, 1], [0, 20]);
  if (!moments?.mandalaLayer) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <motion.div style={{ rotate: reduceMotion ? 0 : rotate }}>
        <MandalaMotif color={color} size={420} opacity={0.1} />
      </motion.div>
    </div>
  );
}

/** moments.mandalaLayer: paisleys in two corners of a section, turning
 * slowly as it crosses the screen. */
export function TemplePaisleys({ color }: { color: string }) {
  const { moments } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const progress = useTraverseProgress(ref);
  const rotate = useTransform(progress, [0, 1], [0, 20]);
  const rotateBack = useTransform(rotate, (r) => -r);
  if (!moments?.mandalaLayer) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none" }}
    >
      <motion.div
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          opacity: 0.35,
          rotate: reduceMotion ? 0 : rotate,
        }}
      >
        <PaisleyCorner color={color} size={56} />
      </motion.div>
      <motion.div
        style={{
          position: "absolute",
          right: 8,
          bottom: 8,
          opacity: 0.35,
          scale: -1,
          rotate: reduceMotion ? 0 : rotateBack,
        }}
      >
        <PaisleyCorner color={color} size={56} />
      </motion.div>
    </div>
  );
}

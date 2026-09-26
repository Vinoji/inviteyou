"use client";

import { Children, useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useMotionTheme } from "./MotionThemeProvider";
import s from "./motion.module.css";

type Tag = "h1" | "h2" | "h3";

/** The heading's text if its children are plain strings, else null. */
function plainText(children: ReactNode): string | null {
  const parts = Children.toArray(children);
  return parts.every((p) => typeof p === "string" || typeof p === "number") ? parts.join("") : null;
}

/**
 * A section heading animated by the template's `heading` style
 * (lib/motionThemes.ts), once, when it enters the viewport:
 * - "maskUp": the text slides up out of a clipping mask (with a slight
 *   wobble when the theme sets `headingWobble`).
 * - "goldSweep": a bright gold band sweeps across the text.
 * - "inkType": words type in (60ms per character, at most 1.2s), then a
 *   thin caret blinks twice and disappears. Needs plain-text children;
 *   otherwise falls back to maskUp.
 * - "handwrite": revealed left to right, as if being written.
 * "letters" falls back to maskUp. Reduced motion shows the heading as-is.
 */
export default function MotionHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: Tag;
  className?: string;
  children: ReactNode;
}) {
  const theme = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  if (reduceMotion) return <Tag className={className}>{children}</Tag>;

  const text = plainText(children);

  if (theme.heading === "goldSweep") {
    return (
      <Tag
        ref={ref}
        className={`${className ?? ""} ${s.goldSweep} ${inView ? s.goldSweepPlay : ""}`}
      >
        {children}
      </Tag>
    );
  }

  if (theme.heading === "inkType" && text !== null) {
    const words = text.split(/(\s+)/);
    const total = Math.max(1, text.length);
    const perChar = Math.min(0.06, 1.2 / total);
    // Characters typed before each word, for its delay.
    const starts = words.map((_, i) => words.slice(0, i).join("").length);
    return (
      <Tag ref={ref} className={className} aria-label={text}>
        {words.map((w, i) => {
          const delay = starts[i] * perChar;
          return /^\s+$/.test(w) ? (
            w
          ) : (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 0.12, delay }}
            >
              {w}
            </motion.span>
          );
        })}
        <motion.span
          aria-hidden
          className={s.caret}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: [0, 1, 0, 1, 0, 1, 0] } : { opacity: 0 }}
          transition={{
            duration: 1.1,
            delay: total * perChar,
            times: [0, 0.1, 0.3, 0.45, 0.65, 0.8, 1],
          }}
        />
      </Tag>
    );
  }

  if (theme.heading === "handwrite") {
    // Triggered by the heading (via `inView`), never by the clipped span:
    // an element fully hidden by its own clip-path never counts as visible.
    return (
      <Tag ref={ref} className={className}>
        <motion.span
          style={{ display: "inline-block" }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: inView ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
          transition={{ duration: 1.3, ease: [0.45, 0, 0.3, 1] }}
        >
          {children}
        </motion.span>
      </Tag>
    );
  }

  // "maskUp" (and fallbacks). The in-view trigger sits on the mask, not the
  // text: the text starts clipped out of view, so observing it never fires.
  return (
    <Tag className={className}>
      <motion.span
        style={{ display: "block", overflow: "clip", paddingBottom: "0.08em" }}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.6 }}
      >
        <motion.span
          style={{ display: "block", transformOrigin: "0 100%" }}
          variants={{
            hidden: { y: "105%", rotate: theme.headingWobble ? 1.5 : 0 },
            shown: { y: "0%", rotate: 0 },
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.span>
      </motion.span>
    </Tag>
  );
}

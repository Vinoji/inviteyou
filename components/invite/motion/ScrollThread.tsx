"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { useMotionTheme } from "./MotionThemeProvider";
import { usePageProgress, usePaneHeight } from "./scroll";
import s from "./motion.module.css";

type LineThread = "gold" | "ink" | "silver" | "rope";

const LINE: Record<LineThread, { track: string; fill: string; width: number }> = {
  gold: {
    track: "var(--rp-gold, #C8962E)",
    fill: "linear-gradient(var(--rp-gold-light, #E3B45A), var(--rp-gold, #C8962E))",
    width: 2,
  },
  ink: { track: "rgba(17,17,17,0.12)", fill: "#111111", width: 1 },
  silver: {
    track: "rgba(201,204,209,0.25)",
    fill: "linear-gradient(#F2F3F5, #C9CCD1)",
    width: 1.5,
  },
  rope: {
    track: "rgba(156,124,91,0.25)",
    fill: "repeating-linear-gradient(-45deg, #C9A77C 0 3px, #9C7C5B 3px 6px)",
    width: 4,
  },
};

function Tip({ thread }: { thread: LineThread }) {
  switch (thread) {
    case "gold":
      return (
        <>
          <ellipse cx="7" cy="9" rx="4" ry="8" fill="#FFC24A" opacity="0.35" />
          <path d="M7 1c3 5 4 9 0 13-4-4-3-8 0-13z" fill="#FFD27A" />
          <path d="M3 17h8l-1 4H4z" fill="var(--rp-gold, #C8962E)" />
        </>
      );
    case "silver":
      return (
        <g className={s.twinkle}>
          <path d="M7 3Q7 11 15 11Q7 11 7 19Q7 11 -1 11Q7 11 7 3Z" fill="#F2F3F5" />
        </g>
      );
    case "rope":
      // A small scallop shell.
      return (
        <>
          <path d="M7 6 L1 15 Q7 21 13 15 Z" fill="#FFF9F0" stroke="#E9806E" strokeWidth="0.8" />
          <path d="M7 6 L4.5 16 M7 6 L7 17.5 M7 6 L9.5 16" stroke="#E9806E" strokeWidth="0.6" />
        </>
      );
    case "ink":
    default:
      return null;
  }
}

/** Frame shared by every thread: an absolute layer over the invitation with
 * a sticky, viewport- (or pane-) tall frame, so the thread stays on screen. */
function ThreadFrame({
  layerRef,
  children,
}: {
  layerRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const paneHeight = usePaneHeight(layerRef, true);
  return (
    <div ref={layerRef} className={s.threadLayer} aria-hidden>
      <div className={s.threadFrame} style={paneHeight ? { height: paneHeight } : undefined}>
        {children}
      </div>
    </div>
  );
}

function LineThreadView({
  thread,
  progress,
}: {
  thread: LineThread;
  progress: MotionValue<number>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackPx = useMotionValue(0);
  const tipY = useTransform(() => progress.get() * trackPx.get());
  const look = LINE[thread];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => trackPx.set(track.clientHeight));
    ro.observe(track);
    return () => ro.disconnect();
  }, [trackPx]);

  const lineStyle: CSSProperties = { width: look.width };
  return (
    <div ref={trackRef} className={s.threadTrack}>
      <div className={s.threadLine} style={{ ...lineStyle, background: look.track }} />
      <motion.div
        className={s.threadLine}
        style={{ ...lineStyle, background: look.fill, scaleY: progress }}
      />
      {thread !== "ink" && (
        <motion.svg className={s.threadTip} viewBox="0 0 14 22" style={{ y: tipY }}>
          <Tip thread={thread} />
        </motion.svg>
      )}
    </div>
  );
}

/** "vine": a vine growing down the left margin with page progress; a flower
 * blooms at each step the vine reaches. */
function VineThreadView({ progress }: { progress: MotionValue<number> }) {
  const flowers = [0.14, 0.3, 0.46, 0.62, 0.78, 0.94];
  const d =
    "M10 0 C 2 60, 18 120, 10 180 S 2 300, 10 360 S 18 480, 10 540 S 2 660, 10 720 S 18 840, 10 900 S 2 1020, 10 1080";
  return (
    <svg className={s.vine} viewBox="0 0 24 1080" preserveAspectRatio="none">
      <motion.path
        d={d}
        fill="none"
        stroke="#A8BFA0"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: progress }}
      />
      {flowers.map((f, i) => (
        <Bloom key={f} progress={progress} at={f} y={f * 1080} flip={i % 2 === 1} />
      ))}
    </svg>
  );
}

function Bloom({
  progress,
  at,
  y,
  flip,
}: {
  progress: MotionValue<number>;
  at: number;
  y: number;
  flip: boolean;
}) {
  const scale = useTransform(progress, [at - 0.03, at], [0, 1]);
  const rotate = useTransform(progress, [at - 0.03, at], [-30, 0]);
  return (
    // Framer's style transform would replace a transform attribute, so the
    // position lives on an outer group.
    <g transform={`translate(${flip ? 16 : 4} ${y})`}>
      <motion.g style={{ scale, rotate, transformBox: "fill-box", transformOrigin: "50% 50%" }}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-4"
            rx="2.6"
            ry="4"
            fill="#E79AA8"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="2" fill="#F7E7B4" />
      </motion.g>
    </g>
  );
}

/**
 * The template's scroll-progress thread (MotionTheme.thread), following the
 * whole invitation's scroll, pinned to the viewport (or the editor's
 * preview pane). Place it as the first child of the invitation root.
 * Styles: "gold" (flame tip), "ink" (a 1px line), "silver" (twinkling star
 * tip), "rope" (twisted rope, shell tip), "vine" (a growing vine with
 * blooms). Hidden with reduced motion.
 */
export default function ScrollThread() {
  const { thread } = useMotionTheme();
  const reduceMotion = useSafeReducedMotion();
  const layerRef = useRef<HTMLDivElement>(null);
  const progress = usePageProgress(layerRef);

  if (!thread || reduceMotion) return null;
  return (
    <ThreadFrame layerRef={layerRef}>
      {thread === "vine" ? (
        <VineThreadView progress={progress} />
      ) : (
        <LineThreadView thread={thread} progress={progress} />
      )}
    </ThreadFrame>
  );
}

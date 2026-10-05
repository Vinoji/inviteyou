"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Hand, RotateCcw } from "lucide-react";
import type { IntroId } from "@/lib/templates";
import { INTROS } from "@/components/invite/intros/registry";
import ParticleField, {
  type BurstOptions,
  type ParticleFieldHandle,
} from "@/components/invite/particles/ParticleField";

/** The intro is laid out at a phone-sized stage and scaled to the card, so
 * every template looks exactly as it does for guests, just smaller. */
const STAGE_W = 390;
const STAGE_H = 620;
/** After the opening finishes, the card rests on the names, then replays. */
const REPLAY_AFTER_MS = 5000;
/** 3D openings play a timed sequence and build a scene as soon as they
 * mount — heavy, and distracting in a grid. Their cards wait for a tap. */
const TAP_TO_START = new Set<IntroId>(["palaceGate", "templeGate", "cathedralDoors", "parkGate"]);

export interface ShowcaseProps {
  introId: IntroId;
  templateId: string;
  names: { a: string; b?: string };
  monogram: { a: string; b?: string };
  weddingDate: string;
  dateLabel: string;
  fonts: { display: string; script: string; caps: string };
  accent: string;
  /** --name-fit for long sample names. */
  nameFit: number;
  /** Tailwind gradient classes for the resting card, e.g. "from-amber-200 to-red-100". */
  gradient: string;
  /** Where the "Tap to try it" chip sits — bottom inside a phone mock-up, clear of the notch. */
  hintAt?: "top" | "bottom";
  /** A still card (names on the design's colours) that never plays — for
   * pickers that list many designs at once. */
  still?: boolean;
}

/**
 * A landing-page card's live preview: the template's real opening animation,
 * playable (tap the bell, pull the tassel, scratch the foil…), silent, and
 * only mounted while the card is on screen so a page of sixteen stays light.
 */
export default function TemplateShowcase(p: ShowcaseProps) {
  const t = useTranslations("landing");
  const boxRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleFieldHandle>(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"closed" | "opening" | "done">("closed");
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(!p.still && !TAP_TO_START.has(p.introId));

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE_W));
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const replay = useCallback(() => {
    particlesRef.current?.clear();
    setPhase("closed");
    setRun((n) => n + 1);
  }, []);

  // Rest on the finished card for a moment, then play again — but only
  // while it's on screen; off screen it just waits.
  useEffect(() => {
    if (phase !== "done" || !visible) return;
    const id = setTimeout(replay, REPLAY_AFTER_MS);
    return () => clearTimeout(id);
  }, [phase, visible, replay]);

  const onOpen = useCallback(() => setPhase("opening"), []);
  const onDone = useCallback(() => setPhase("done"), []);
  const burst = useCallback((opts: BurstOptions) => particlesRef.current?.burst(opts), []);

  const Intro = INTROS[p.introId];
  const live = visible && scale > 0 && started;

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden bg-gradient-to-br ${p.gradient}`}
      style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}`, containerType: "inline-size" }}
    >
      {live && (
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={
            {
              width: STAGE_W,
              height: STAGE_H,
              transform: `scale(${scale})`,
              "--name-fit": p.nameFit,
            } as CSSProperties
          }
        >
          {phase !== "done" && (
            <Intro
              key={run}
              names={p.names}
              monogram={p.monogram}
              weddingDate={p.weddingDate}
              dateLabel={p.dateLabel}
              fonts={p.fonts}
              accent={p.accent}
              templateId={p.templateId}
              onOpen={onOpen}
              onDone={onDone}
              burst={burst}
              preview
            />
          )}
          <ParticleField
            ref={particlesRef}
            preset="marigold"
            mode="burst"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          />
        </div>
      )}

      {!started && (
        <button
          type="button"
          onClick={() => !p.still && setStarted(true)}
          aria-label={p.still ? undefined : t("tryIt")}
          tabIndex={p.still ? -1 : undefined}
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 p-5 text-center text-white ${p.still ? "cursor-default" : ""}`}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(232,176,74,0.28),transparent_60%)]" aria-hidden />
          <span
            className="relative text-[clamp(15px,8cqw,30px)] leading-tight drop-shadow-md"
            style={{ fontFamily: p.fonts.display }}
          >
            {p.names.a}
            {p.names.b && (
              <>
                <span className="mx-1.5 opacity-80">&</span>
                {p.names.b}
              </>
            )}
          </span>
          <span className="relative text-[clamp(9px,3.4cqw,12px)] tracking-[0.3em] text-[#ffe9b8]/80 uppercase">
            {p.dateLabel}
          </span>
          {!p.still && (
            <span className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
              <Hand size={12} aria-hidden />
              {t("tryIt")}
            </span>
          )}
        </button>
      )}

      {phase === "done" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/25 p-6 text-center text-white backdrop-blur-[2px]">
          <p
            className="text-[clamp(15px,8cqw,30px)] leading-tight drop-shadow-md"
            style={{ fontFamily: p.fonts.display }}
          >
            {p.names.a}
            {p.names.b && (
              <>
                <span className="mx-2 text-xl opacity-80">&</span>
                {p.names.b}
              </>
            )}
          </p>
          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-neutral-900 shadow hover:bg-white"
          >
            <RotateCcw size={13} aria-hidden />
            {t("replay")}
          </button>
        </div>
      )}

      {phase === "closed" && live && (
        <span className={`pointer-events-none absolute ${p.hintAt === "bottom" ? "bottom-3 left-1/2 -translate-x-1/2" : "top-3 left-3"} z-20 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white backdrop-blur`}>
          <Hand size={12} aria-hidden />
          {/* Icon only on narrow cards, where the price badge shares the top. */}
          <span className="sr-only sm:not-sr-only">{t("tryIt")}</span>
        </span>
      )}
    </div>
  );
}

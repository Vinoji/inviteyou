"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import useSafeReducedMotion from "../useSafeReducedMotion";
import type { IntroProps } from "./types";
import { playSound, useWarmAudio } from "./audio";
import s from "./bottle.module.css";

/** A cork "pop": a quick falling tone with a puff of noise. */
function popSound() {
  playSound((ac, now) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(650, now);
    o.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    o.connect(g).connect(ac.destination);
    o.start(now);
    o.stop(now + 0.2);
    const noise = ac.createBuffer(1, ac.sampleRate * 0.06, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    const ng = ac.createGain();
    ng.gain.value = 0.08;
    src.buffer = noise;
    src.connect(ng).connect(ac.destination);
    src.start(now);
  });
}

/** Two shapes per wave band; the band morphs between them. */
const BANDS = [
  {
    a: "M0 40 Q50 28 100 40 T200 40 T300 40 T400 40 V80 H0Z",
    b: "M0 40 Q50 52 100 40 T200 40 T300 40 T400 40 V80 H0Z",
    fill: "#3FB8AF",
    y: "58%",
    dur: 3.2,
  },
  {
    a: "M0 44 Q60 34 120 44 T240 44 T360 44 T480 44 V80 H0Z",
    b: "M0 44 Q60 54 120 44 T240 44 T360 44 T480 44 V80 H0Z",
    fill: "#2E9C9B",
    y: "62%",
    dur: 4.1,
  },
  {
    a: "M0 46 Q40 38 80 46 T160 46 T240 46 T320 46 T400 46 V80 H0Z",
    b: "M0 46 Q40 54 80 46 T160 46 T240 46 T320 46 T400 46 V80 H0Z",
    fill: "#1D6E7A",
    y: "66%",
    dur: 3.7,
  },
];

/**
 * Intro "bottle" (beach-boho): a beach at golden hour — sky, sun, three
 * rolling wave bands, wet sand — with a glass bottle rocking at the
 * waterline. The layers tilt with the phone where the browser allows
 * (DeviceOrientation without a permission prompt), otherwise they drift
 * gently. Tapping the cork pops it (with a pop sound and bubbles), the
 * message slides out and unrolls into a parchment card with the names,
 * then a big wave rolls in over everything and pulls back to leave the
 * invitation, with sun glints. About 3.6s.
 *
 * Reduced motion: the unrolled message on a still beach, and a "View
 * invitation" button.
 */
export default function BottleIntro({ names, fonts, onOpen, onDone, burst, preview }: IntroProps) {
  const t = useTranslations("invite.intros.bottle");
  const reduceMotion = useSafeReducedMotion();
  useWarmAudio(!preview && !reduceMotion);
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0); // rest, popped, unrolled, wave in, wave out
  const rootRef = useRef<HTMLDivElement>(null);
  const corkRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Tilt parallax: -1…1 from device gamma, smoothed.
  const tiltRaw = useMotionValue(0);
  const tilt = useSpring(tiltRaw, { stiffness: 40, damping: 12 });
  const farX = useTransform(tilt, [-1, 1], [-8, 8]);
  const midX = useTransform(tilt, [-1, 1], [-16, 16]);
  const nearX = useTransform(tilt, [-1, 1], [-26, 26]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // iOS gates orientation behind a permission prompt; skip it there and
    // keep the idle drift instead.
    const DOE = window.DeviceOrientationEvent as unknown as
      { requestPermission?: () => Promise<string> } | undefined;
    if (reduceMotion || !DOE || typeof DOE.requestPermission === "function") return;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      tiltRaw.set(Math.max(-1, Math.min(1, e.gamma / 30)));
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, [reduceMotion, tiltRaw]);

  function pop() {
    if (stage !== 0) return;
    setStage(1);
    onOpen();
    if (!preview) popSound();
    const root = rootRef.current?.getBoundingClientRect();
    const cork = corkRef.current?.getBoundingClientRect();
    if (root && cork) {
      burst({
        preset: "bubbles",
        origin: {
          x: (cork.left - root.left + cork.width / 2) / root.width,
          y: (cork.top - root.top + cork.height / 2) / root.height,
        },
      });
    }
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(400, () => setStage(2));
    at(1600, () => setStage(3));
    at(1900, () => burst({ preset: "bubbles", origin: { x: 0.5, y: 0.2 } }));
    at(2300, () => setStage(4));
    at(2400, () => burst({ preset: "sunGlints" }));
    at(3600, onDone);
  }

  function viewStatic() {
    onOpen();
    onDone();
  }

  const unrolled = reduceMotion || stage >= 2;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div ref={rootRef} className={s.root} role="dialog" aria-label={t("dialogLabel")}>
      {/* The beach scene — hidden while the wave covers it, so the wave
          pulls back onto the invitation, not the beach. */}
      <div className={s.scene} style={{ opacity: stage >= 4 ? 0 : 1 }}>
        <motion.div
          className={`${s.layer} ${s.sky} ${reduceMotion ? s.sunset : ""}`}
          style={{ x: farX }}
        >
          <div className={s.sun} />
        </motion.div>
        {BANDS.map((b, i) => (
          <motion.svg
            key={i}
            className={`${s.band} ${reduceMotion ? "" : s.drift}`}
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
            style={{
              top: b.y,
              x: i === 0 ? farX : i === 1 ? midX : nearX,
              animationDelay: `${-i * 2}s`,
            }}
            aria-hidden
          >
            {/* A plain SVG <animate> morph: a looping two-shape swell needs no JS. */}
            <path d={b.a} fill={b.fill}>
              {!reduceMotion && (
                <animate
                  attributeName="d"
                  values={`${b.a};${b.b};${b.a}`}
                  dur={`${b.dur}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                />
              )}
            </path>
          </motion.svg>
        ))}
        <motion.div className={s.sand} style={{ x: nearX }} />

        <div className={s.column}>
          <motion.p
            className={s.lead}
            style={{ fontFamily: fonts.display }}
            animate={{ opacity: stage === 0 ? 1 : 0 }}
          >
            {t("lead")}
          </motion.p>

          {/* The unrolled message. */}
          <div className={s.scrollSlot}>
            <motion.div
              className={s.parchment}
              initial={false}
              animate={unrolled ? { scaleY: 1, opacity: 1 } : { scaleY: 0.05, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 1.0, ease }}
            >
              <motion.span
                className={s.rollShade}
                aria-hidden
                initial={false}
                animate={{ y: unrolled ? "110%" : "0%" }}
                transition={{ duration: reduceMotion ? 0 : 1.0, ease }}
              />
              <span className={s.cardEyebrow} style={{ fontFamily: fonts.caps }}>
                {t("eyebrow")}
              </span>
              <span className={s.cardNames} style={{ fontFamily: fonts.display }}>
                {names.a}
                {names.b !== undefined && (
                  <>
                    <br />
                    &amp; {names.b}
                  </>
                )}
              </span>
            </motion.div>
          </div>
        </div>

        {/* The bottle at the waterline. */}
        <motion.div
          className={`${s.bottleWrap} ${reduceMotion || stage > 0 ? "" : s.rock}`}
          animate={{ opacity: stage >= 2 ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg className={s.bottle} viewBox="0 0 120 60" aria-hidden>
            <defs>
              <linearGradient id="bottle-glass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(220,255,250,0.85)" />
                <stop offset="1" stopColor="rgba(63,184,175,0.55)" />
              </linearGradient>
            </defs>
            <path
              d="M8 18Q4 30 8 42H70Q86 42 94 36H104V24H94Q86 18 70 18Z"
              fill="url(#bottle-glass)"
              stroke="rgba(255,255,255,0.8)"
            />
            <motion.rect
              x="22"
              y="24"
              width="40"
              height="12"
              rx="6"
              fill="#F4E4C1"
              animate={{ x: stage >= 1 ? 70 : 22, opacity: stage >= 2 ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            />
            <path
              d="M14 22Q12 30 14 38"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <motion.button
            ref={corkRef}
            type="button"
            className={s.cork}
            onClick={reduceMotion ? viewStatic : pop}
            disabled={stage !== 0}
            aria-label={reduceMotion ? t("view") : t("tapCork")}
            initial={false}
            animate={
              stage >= 1
                ? { y: [0, -140, 600], x: [0, 30, 60], rotate: 540 }
                : { y: 0, x: 0, rotate: 0 }
            }
            transition={{ duration: 1.1, times: [0, 0.35, 1], ease: "easeOut" }}
          />
        </motion.div>

        <div className={s.footer}>
          {reduceMotion ? (
            <button
              type="button"
              className={s.viewBtn}
              style={{ fontFamily: fonts.caps }}
              onClick={viewStatic}
            >
              {t("view")}
            </button>
          ) : (
            <motion.p
              className={s.hint}
              style={{ fontFamily: fonts.caps }}
              animate={{ opacity: stage === 0 ? 1 : 0 }}
            >
              {t("tapCork")}
            </motion.p>
          )}
        </div>
      </div>

      {/* The big wave: rolls in over everything, then pulls back. */}
      {!reduceMotion && (
        <motion.div
          className={s.bigWave}
          initial={false}
          animate={{ y: stage === 3 ? "-20%" : stage === 4 ? "110%" : "100%" }}
          transition={{ duration: stage === 4 ? 1.1 : 0.7, ease: [0.45, 0, 0.3, 1] }}
          aria-hidden
        >
          <svg viewBox="0 0 400 40" preserveAspectRatio="none" className={s.foam}>
            <path
              d="M0 40V22Q25 6 50 20T100 18T150 22T200 16T250 22T300 18T350 22T400 16V40Z"
              fill="#1D6E7A"
            />
            <path
              d="M0 22Q25 6 50 20T100 18T150 22T200 16T250 22T300 18T350 22T400 16"
              fill="none"
              stroke="#FFF9F0"
              strokeWidth="3"
            />
          </svg>
          <div className={s.waveBody} />
        </motion.div>
      )}
    </div>
  );
}

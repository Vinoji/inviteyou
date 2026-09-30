"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useIntroText } from "./useIntroText";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "./types";
import s from "./scratch.module.css";

const BRUSH = 30; // CSS px
const REVEAL_AT = 0.5; // share of foil cleared

/** Rose-gold foil with a fine diagonal sheen and a few fixed sparkles. */
function paintFoil(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
  g.addColorStop(0, "#c98e9b");
  g.addColorStop(0.35, "#f3d9de");
  g.addColorStop(0.55, "#d8a7b1");
  g.addColorStop(0.8, "#f7e6ea");
  g.addColorStop(1, "#b77d8c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  for (let x = -rect.height; x < rect.width; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, rect.height);
    ctx.lineTo(x + rect.height, 0);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 18; i++) {
    const px = ((i * 37) % 97) / 97;
    const py = ((i * 53) % 89) / 89;
    ctx.beginPath();
    ctx.arc(px * rect.width, py * rect.height, 1.2 + (i % 3) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Share of the foil already scratched away (sampled, not every pixel). */
function clearedShare(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let clear = 0;
  let total = 0;
  for (let i = 3; i < data.length; i += 4 * 24) {
    total++;
    if (data[i] < 40) clear++;
  }
  return total ? clear / total : 0;
}

/**
 * Intro "scratch" (scratch-reveal): a lilac keepsake card with the names
 * printed on it and the date hidden under rose-gold foil. Guests scratch the
 * foil away with a finger or mouse; once about half is gone the rest melts
 * off, confetti bursts and the card lifts away. A "Reveal" button does the
 * same for keyboard users and with reduced motion.
 */
export default function ScratchIntro({ templateId, names, dateLabel, fonts, onOpen, onDone, burst }: IntroProps) {
  const t = useIntroText("invite.intros.scratch", templateId);
  const reduceMotion = useSafeReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [scratching, setScratching] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const started = useRef(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paintFoil(canvas);
    const ro = new ResizeObserver(() => {
      if (!started.current) paintFoil(canvas);
    });
    ro.observe(canvas);
    const pending = timers.current;
    return () => {
      ro.disconnect();
      pending.forEach(clearTimeout);
    };
  }, []);

  function begin() {
    if (started.current) return;
    started.current = true;
    setScratching(true);
    onOpen();
  }

  function reveal() {
    if (revealed) return;
    begin();
    setRevealed(true);
    if (!reduceMotion) {
      burst({ preset: "glitter", colors: ["#F3D9DE", "#D8A7B1", "#C9B6E4"] });
      burst({ preset: "pastelPetals" });
    }
    timers.current.push(setTimeout(onDone, reduceMotion ? 50 : 2100));
  }

  function scratchTo(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    ctx.globalCompositeOperation = "destination-out";
    // Opaque, so each stroke erases fully (paintFoil leaves a faint sheen colour set).
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 8 === 0 && clearedShare(canvas) > REVEAL_AT) reveal();
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = null;
    begin();
    scratchTo(e);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (drawing.current && !revealed) scratchTo(e);
  }

  function onUp() {
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas && !revealed && clearedShare(canvas) > REVEAL_AT) reveal();
  }

  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <motion.div
      className={s.root}
      role="dialog"
      aria-label={t("dialogLabel")}
      initial={false}
      animate={revealed && !reduceMotion ? { opacity: [1, 1, 0] } : { opacity: 1 }}
      transition={{ duration: 2.1, times: [0, 0.7, 1] }}
    >
      <motion.div
        className={s.card}
        initial={false}
        animate={revealed && !reduceMotion ? { y: [0, 0, -40], rotate: [0, 0, -2] } : { y: 0 }}
        transition={{ duration: 2.1, times: [0, 0.65, 1] }}
      >
        <p className={s.eyebrow} style={{ fontFamily: fonts.caps }}>
          {t("eyebrow")}
        </p>
        <h1 className={s.names} style={{ fontFamily: fonts.display }} lang={scriptLang(namesText)}>
          <span>{names.a}</span>
          {names.b !== undefined && (
            <>
              <span className={s.amp}>&amp;</span>
              <span>{names.b}</span>
            </>
          )}
        </h1>
        <p className={s.lead} style={{ fontFamily: fonts.caps }}>
          {t("lead")}
        </p>

        <div className={s.ticket}>
          <div className={s.under}>
            <span className={s.heart} aria-hidden>
              ♥
            </span>
            <span className={s.date} style={{ fontFamily: fonts.display }}>
              {dateLabel || t("soon")}
            </span>
          </div>
          <motion.canvas
            ref={canvasRef}
            className={s.foil}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            initial={false}
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: 0.6 }}
            aria-hidden
          />
          <motion.span
            className={s.scratchHint}
            style={{ fontFamily: fonts.caps }}
            initial={false}
            animate={{ opacity: scratching ? 0 : 1 }}
            aria-hidden
          >
            {t("scratchHere")}
          </motion.span>
        </div>

        <button
          type="button"
          className={s.revealBtn}
          style={{ fontFamily: fonts.caps }}
          onClick={reveal}
          disabled={revealed}
        >
          {t("reveal")}
        </button>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFormatter } from "next-intl";
import type { IntroProps } from "../../intros/types";
import { useIntroText } from "../../intros/useIntroText";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import { parseIsoDate } from "@/lib/calendar";
import s from "./pastel.module.css";

const BRUSH = 26;
const REVEAL_AT = 0.45;

/** Pastel foil: blush to lilac, with a little shimmer. */
function paintFoil(canvas: HTMLCanvasElement) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, r.width, r.height);
  g.addColorStop(0, "#f6d3dc");
  g.addColorStop(0.5, "#e9d8f0");
  g.addColorStop(1, "#d8c6ea");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(r.width / 2, r.height / 2, Math.min(r.width, r.height) / 2, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.25 + ((i * 7) % 10) / 20})`;
    ctx.beginPath();
    ctx.arc(((i * 37) % 97) / 97 * r.width, ((i * 53) % 89) / 89 * r.height, 0.6 + (i % 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(120,90,140,0.7)";
  ctx.font = `600 ${Math.round(r.width * 0.07)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText("✦  ✦  ✦", r.width / 2, r.height / 2 + r.width * 0.025);
}

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
  // The circle's corners are clear from the start (≈21% of the square).
  return Math.max(0, (clear / Math.max(1, total) - 0.21) / 0.79);
}

/**
 * Intro "pastelPalace" (pastel-palace): a watercolour castle in a pale
 * garden, a rose wreath and the couple's monogram; the date hides under a
 * pastel foil — scratch it (or tap Reveal) and petals fall as it shows.
 */
export default function PastelPalaceIntro({ monogram, weddingDate, templateId, onOpen, onDone, burst }: IntroProps) {
  const t = useIntroText("invite.intros.pastelPalace", templateId);
  const format = useFormatter();
  const reduce = useSafeReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const started = useRef(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const day = parseIsoDate(weddingDate);
  const initials = [monogram.a, monogram.b].filter(Boolean).join(" & ");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paintFoil(canvas);
    const ro = new ResizeObserver(() => !started.current && paintFoil(canvas));
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
    onOpen();
  }
  function reveal() {
    if (revealed) return;
    begin();
    setRevealed(true);
    if (!reduce) burst({ preset: "pastelPetals", colors: ["#f6c6d4", "#ffffff", "#e3cdee", "#f2d9a8"], origin: { x: 0.5, y: 0.45 } });
    timers.current.push(setTimeout(onDone, reduce ? 0 : 1400));
  }
  function scratchTo(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 8 === 0 && clearedShare(canvas) > REVEAL_AT) reveal();
  }

  return (
    <div className={s.stage} role="dialog" aria-label={t("dialogLabel")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/art/pastel-palace/castle.webp" alt="" className={s.stageCastle} aria-hidden />
      <span className={s.stageWash} aria-hidden />
      <motion.div
        className={s.stageCard}
        initial={false}
        animate={revealed && !reduce ? { y: -12 } : { y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/pastel-palace/wreath.webp" alt="" className={s.stageWreath} aria-hidden />
        <div className={s.stageInner}>
          <p className={s.stageMono}>{initials}</p>
          <p className={s.stageEyebrow}>{t("eyebrow")}</p>
          <div className={s.scratchBox}>
            <div className={s.scratchDate} aria-live="polite">
              {day ? (
                <>
                  <b>{format.dateTime(day, { day: "numeric" })}</b>
                  <span>{format.dateTime(day, { month: "long" })}</span>
                  <small>{format.dateTime(day, { year: "numeric", weekday: "long" })}</small>
                </>
              ) : (
                <b>✦</b>
              )}
            </div>
            <motion.canvas
              ref={canvasRef}
              className={s.foil}
              aria-hidden
              initial={false}
              animate={{ opacity: revealed ? 0 : 1 }}
              transition={{ duration: reduce ? 0 : 0.5 }}
              style={{ pointerEvents: revealed ? "none" : "auto" }}
              onPointerDown={(e) => {
                begin();
                drawing.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                last.current = null;
                scratchTo(e);
              }}
              onPointerMove={(e) => drawing.current && scratchTo(e)}
              onPointerUp={() => {
                drawing.current = false;
                last.current = null;
              }}
            />
          </div>
        </div>
      </motion.div>
      {!revealed && (
        <div className={s.stageActions}>
          <p className={s.stageHint}>{t("hint")}</p>
          <button type="button" className={s.revealBtn} onClick={reveal}>
            {reduce ? t("view") : t("open")}
          </button>
        </div>
      )}
    </div>
  );
}

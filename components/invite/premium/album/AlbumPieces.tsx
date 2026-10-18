"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Hand, MoveHorizontal, X } from "lucide-react";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import s from "./album.module.css";

/**
 * The interactive pieces of "Our Photo Story": every one plays with the
 * couple's own photos — a crossfading slideshow, a swipeable stack, tiles
 * that flip to reveal a photo, a scratch card for the date, a then-and-now
 * slider, a wall of polaroids to drag about, a filmstrip with a full-screen
 * viewer, and a heart made of photos.
 */

/* ------------------------------------------------------------------ */
/* Hero slideshow                                                      */
/* ------------------------------------------------------------------ */

export function Slideshow({ photos, children }: { photos: string[]; children: React.ReactNode }) {
  const t = useTranslations("premium.album");
  const reduce = useSafeReducedMotion();
  const [i, setI] = useState(0);
  const n = photos.length;
  useEffect(() => {
    if (reduce || n < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % n), 5200);
    return () => clearInterval(id);
  }, [n, reduce, i]);
  return (
    <>
      <div className={s.slides} onClick={() => n > 1 && setI((v) => (v + 1) % n)}>
        {photos.map((src, k) => (
          <div key={`${src}-${k}`} className={`${s.slide} ${k === i ? s.slideOn : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading={k === 0 ? "eager" : "lazy"} />
          </div>
        ))}
        <div className={s.slidesShade} />
      </div>
      <div className={s.heroCard}>
        {children}
        {n > 1 && (
          <div className={s.dots} role="tablist" aria-label={t("slidesLabel")}>
            {photos.map((_, k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={t("slideN", { n: k + 1 })}
                className={`${s.dot} ${k === i ? s.dotOn : ""}`}
                onClick={() => setI(k)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Swipeable stack                                                     */
/* ------------------------------------------------------------------ */

export function SwipeStack({ photos, captions }: { photos: string[]; captions: string[] }) {
  const t = useTranslations("premium.album");
  // Order of the cards: the first is on top.
  const [saved, setOrder] = useState(() => photos.map((_, k) => k));
  const [fly, setFly] = useState<{ id: number; dir: 1 | -1 } | null>(null);
  // Photos added or removed (in the editor): start the stack afresh.
  const order = saved.length === photos.length ? saved : photos.map((_, k) => k);

  const next = useCallback(
    (dir: 1 | -1) => {
      if (fly || order.length < 2) return;
      setFly({ id: order[0], dir });
      setTimeout(() => {
        setOrder([...order.slice(1), order[0]]);
        setFly(null);
      }, 320);
    },
    [fly, order]
  );
  const back = () => {
    if (fly) return;
    setOrder([order[order.length - 1], ...order.slice(0, -1)]);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) next(info.offset.x > 0 ? 1 : -1);
  };

  const visible = order.slice(0, 4);
  return (
    <>
      <div className={s.stack}>
        {visible
          .map((id, depth) => ({ id, depth }))
          .reverse()
          .map(({ id, depth }) => {
            const top = depth === 0;
            const flying = fly?.id === id;
            return (
              <motion.div
                key={id}
                className={s.stackCard}
                style={{ zIndex: 10 - depth }}
                drag={top && !fly ? "x" : false}
                dragSnapToOrigin
                onDragEnd={top ? onDragEnd : undefined}
                initial={false}
                animate={
                  flying
                    ? { x: fly!.dir * 420, rotate: fly!.dir * 24, opacity: 0 }
                    : { x: 0, y: depth * 10, scale: 1 - depth * 0.05, rotate: [0, -3, 2.5, -1.5][depth] ?? 0, opacity: 1 }
                }
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                whileDrag={{ rotate: 0, scale: 1.03 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[id]} alt="" draggable={false} />
                <p className={s.stackCaption}>{captions[id % captions.length]}</p>
              </motion.div>
            );
          })}
      </div>
      <div className={s.stackControls}>
        <button type="button" className={s.roundBtn} onClick={back} aria-label={t("previous")}>
          <ChevronLeft size={20} />
        </button>
        <span className={s.tapHint}>
          <Hand size={13} aria-hidden />
          {t("swipeHint")}
        </span>
        <button type="button" className={s.roundBtn} onClick={() => next(1)} aria-label={t("next")}>
          <ChevronRight size={20} />
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Tap-to-reveal tiles                                                 */
/* ------------------------------------------------------------------ */

export function RevealTiles({ photo }: { photo: string }) {
  const t = useTranslations("premium.album");
  const [on, setOn] = useState<boolean[]>(() => Array(9).fill(false));
  const all = on.every(Boolean);
  const hearts = ["♥", "✿", "♥", "✿", "♥", "✿", "♥", "✿", "♥"];
  return (
    <>
      <div className={s.tiles}>
        {on.map((flipped, k) => {
          const x = (k % 3) * 50;
          const y = Math.floor(k / 3) * 50;
          return (
            <button
              key={k}
              type="button"
              className={`${s.tile} ${flipped ? s.tileOn : ""}`}
              aria-label={t("tileN", { n: k + 1 })}
              aria-pressed={flipped}
              onClick={() => setOn((v) => v.map((b, j) => (j === k ? !b : b)))}
            >
              <span className={s.tileFront} aria-hidden>
                {hearts[k]}
              </span>
              <span className={s.tileBack} style={{ backgroundImage: `url("${photo}")`, backgroundPosition: `${x}% ${y}%` }} />
            </button>
          );
        })}
      </div>
      <button type="button" className={`${s.button} ${s.revealAll}`} onClick={() => setOn(Array(9).fill(!all))}>
        {all ? t("hideAll") : t("revealAll")}
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Scratch card                                                        */
/* ------------------------------------------------------------------ */

export function ScratchCard({ photo, kicker, title, sub }: { photo: string; kicker: string; title: string; sub: string }) {
  const t = useTranslations("premium.album");
  const reduce = useSafeReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const drawing = useRef(false);
  const strokes = useRef(0);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const paint = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      const g = c.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const grad = g.createLinearGradient(0, 0, r.width, r.height);
      grad.addColorStop(0, "#d9b46a");
      grad.addColorStop(0.45, "#f6e2a8");
      grad.addColorStop(0.55, "#e8c77f");
      grad.addColorStop(1, "#b8913f");
      g.fillStyle = grad;
      g.fillRect(0, 0, r.width, r.height);
      g.fillStyle = "rgba(255,255,255,0.18)";
      for (let k = 0; k < 220; k++) g.fillRect((k * 53) % r.width, (k * 97) % r.height, 1.5, 1.5);
      g.fillStyle = "#6b4e16";
      g.textAlign = "center";
      g.font = `600 ${Math.max(14, r.width / 20)}px system-ui, sans-serif`;
      g.fillText(t("scratchHere"), r.width / 2, r.height / 2);
      g.font = `${Math.max(22, r.width / 10)}px serif`;
      g.fillText("♥", r.width / 2, r.height / 2 - r.width / 9);
    };
    paint();
  }, [t]);

  function scratch(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || done) return;
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    const r = c.getBoundingClientRect();
    g.globalCompositeOperation = "destination-out";
    g.beginPath();
    g.arc(e.clientX - r.left, e.clientY - r.top, Math.max(18, r.width / 14), 0, Math.PI * 2);
    g.fill();
    // Check now and then how much is uncovered.
    strokes.current += 1;
    if (strokes.current % 12 === 0) {
      const data = g.getImageData(0, 0, c.width, c.height).data;
      let clear = 0;
      for (let k = 3; k < data.length; k += 64) if (data[k] === 0) clear++;
      if (clear / (data.length / 64) > 0.5) setDone(true);
    }
  }

  return (
    <div className={s.scratch}>
      <div className={s.scratchUnder}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" loading="lazy" />
        <div className={s.scratchText}>
          <p>{kicker}</p>
          <p>{title}</p>
          <p>{sub}</p>
        </div>
      </div>
      <canvas
        ref={canvas}
        className={`${s.scratchCanvas} ${done || reduce ? s.scratchDone : ""}`}
        aria-label={t("scratchLabel")}
        role="img"
        onPointerDown={(e) => {
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          scratch(e);
        }}
        onPointerMove={scratch}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
        onDoubleClick={() => setDone(true)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Then & now                                                          */
/* ------------------------------------------------------------------ */

export function ThenNow({ before, after }: { before: string; after: string }) {
  const t = useTranslations("premium.album");
  const [pos, setPos] = useState(50);
  return (
    <div className={s.compare}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="" loading="lazy" />
      <div className={s.compareTop} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt="" loading="lazy" />
      </div>
      <span className={s.compareLabel} style={{ left: 12 }}>
        {t("then")}
      </span>
      <span className={s.compareLabel} style={{ right: 12 }}>
        {t("now")}
      </span>
      <div className={s.compareHandle} style={{ left: `${pos}%` }}>
        <span className={s.compareKnob}>
          <MoveHorizontal size={18} aria-hidden />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className={s.compareRange}
        aria-label={t("compareLabel")}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Polaroid wall                                                       */
/* ------------------------------------------------------------------ */

const SPOTS = [
  [6, 8, -8],
  [38, 4, 5],
  [66, 10, -4],
  [14, 44, 6],
  [46, 40, -6],
  [70, 48, 8],
  [4, 72, -3],
  [36, 70, 4],
  [62, 74, -7],
];

export function PolaroidWall({ photos, captions }: { photos: string[]; captions: string[] }) {
  const wall = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState<number[]>(() => photos.map((_, k) => k));
  const raise = (k: number) => setFront((f) => [...f.filter((x) => x !== k), k]);
  return (
    <div ref={wall} className={s.wall}>
      {photos.slice(0, SPOTS.length).map((src, k) => {
        const [x, y, r] = SPOTS[k];
        return (
          <motion.div
            key={`${src}-${k}`}
            className={s.polaroid}
            style={{ left: `${x}%`, top: `${y}%`, rotate: r, zIndex: 1 + front.indexOf(k) }}
            drag
            dragConstraints={wall}
            dragElastic={0.12}
            dragMomentum={false}
            whileDrag={{ scale: 1.08, rotate: 0, boxShadow: "0 24px 40px -12px rgba(47,58,50,.6)" }}
            onPointerDown={() => raise(k)}
          >
            <span className={s.pin} aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} loading="lazy" />
            <p className={s.stackCaption} style={{ bottom: 4, fontSize: 13 }}>
              {captions[k % captions.length]}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filmstrip + full-screen viewer                                      */
/* ------------------------------------------------------------------ */

export function Filmstrip({ photos }: { photos: string[] }) {
  const t = useTranslations("premium.album");
  const [open, setOpen] = useState<number | null>(null);
  const n = photos.length;
  const go = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + n) % n)), [n]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);
  return (
    <>
      <div className={s.strip}>
        {photos.map((src, k) => (
          <button key={`${src}-${k}`} type="button" className={s.frame} onClick={() => setOpen(k)} aria-label={t("openPhoto", { n: k + 1 })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <p className={s.tapHint} style={{ display: "flex", justifyContent: "center" }}>
        <Hand size={13} aria-hidden />
        {t("stripHint")}
      </p>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className={s.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={t("viewer")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.img
              key={open}
              src={photos[open]}
              alt=""
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              drag="x"
              dragSnapToOrigin
              onDragEnd={(_, info) => Math.abs(info.offset.x) > 70 && go(info.offset.x < 0 ? 1 : -1)}
              onClick={(e) => e.stopPropagation()}
            />
            <button type="button" className={`${s.roundBtn} ${s.lightboxClose}`} onClick={() => setOpen(null)} aria-label={t("close")}>
              <X size={20} />
            </button>
            <div className={s.lightboxBar} onClick={(e) => e.stopPropagation()}>
              <button type="button" className={s.roundBtn} onClick={() => go(-1)} aria-label={t("previous")}>
                <ChevronLeft size={20} />
              </button>
              <span>
                {open + 1} / {n}
              </span>
              <button type="button" className={s.roundBtn} onClick={() => go(1)} aria-label={t("next")}>
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Heart of photos                                                     */
/* ------------------------------------------------------------------ */

const HEART = [
  "0110110",
  "1111111",
  "1111111",
  "1111111",
  "0111110",
  "0011100",
  "0001000",
].join("");

export function PhotoHeart({ photos }: { photos: string[] }) {
  let k = 0;
  return (
    <div className={s.heart} aria-hidden>
      {HEART.split("").map((c, i) => {
        if (c === "0") return <span key={i} className={s.heartGap} />;
        const src = photos[k++ % photos.length];
        return (
          <motion.span
            key={i}
            className={s.heartCell}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 7) * 0.04 + Math.floor(i / 7) * 0.06, duration: 0.5 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" />
          </motion.span>
        );
      })}
    </div>
  );
}

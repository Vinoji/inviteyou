"use client";

import { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useTranslations } from "next-intl";
import { Bell, Flame } from "lucide-react";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import { templeBell } from "../../intros/sceneSounds";
import s from "./album.module.css";

/**
 * The temple-only pieces of "Temple Photo Story": a thoranam over the hero,
 * sanctum doors that open with a bell on a photo, brass lamps that light a
 * photo one by one, and a garland of photo medallions that swing when tapped.
 */

/* ------------------------------------------------------------------ */
/* Thoranam: marigolds and mango leaves strung across the top          */
/* ------------------------------------------------------------------ */

export function Thoranam({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const n = 15;
  return (
    <svg className={className} style={style} viewBox="0 0 600 70" preserveAspectRatio="none" aria-hidden>
      <path d="M0 10 Q300 34 600 10" fill="none" stroke="#5b3a12" strokeWidth="2" />
      {Array.from({ length: n }, (_, i) => {
        const x = 20 + i * (560 / (n - 1));
        const y = 10 + 24 * (1 - Math.pow((x - 300) / 300, 2));
        return (
          <g key={i}>
            {i % 2 === 0 ? (
              <path
                d={`M${x} ${y} q-9 14 0 34 q9 -20 0 -34z`}
                fill={i % 4 === 0 ? "#2f6b2a" : "#3f8a36"}
                stroke="#1f4a1c"
                strokeWidth="0.8"
              />
            ) : (
              <>
                <circle cx={x} cy={y + 6} r="7" fill="#f59e0b" />
                <circle cx={x} cy={y + 18} r="6" fill="#fbbf24" />
                <circle cx={x} cy={y + 28} r="5" fill="#ea580c" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Carved teak door (one leaf)                                         */
/* ------------------------------------------------------------------ */

export function CarvedDoor({ flip }: { flip?: boolean }) {
  const id = flip ? "r" : "l";
  return (
    <svg viewBox="0 0 200 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`teak-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#3e1d09" />
          <stop offset="0.5" stopColor="#6a3514" />
          <stop offset="1" stopColor="#3e1d09" />
        </linearGradient>
        <radialGradient id={`brass-${id}`} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff2b8" />
          <stop offset="0.5" stopColor="#d9a93c" />
          <stop offset="1" stopColor="#8a6114" />
        </radialGradient>
      </defs>
      <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
        <rect width="200" height="520" fill={`url(#teak-${id})`} />
        <rect x="10" y="10" width="180" height="500" fill="none" stroke="#d9a93c" strokeWidth="4" />
        <rect x="18" y="18" width="164" height="484" fill="none" stroke="#8a6114" strokeWidth="1.5" />
        {[34, 196, 358].map((y) => (
          <g key={y}>
            <rect x="32" y={y} width="136" height="128" rx="8" fill="#4e250d" stroke="#b8862b" strokeWidth="2.5" />
            {/* A carved lotus in each panel */}
            <g transform={`translate(100 ${y + 64})`} fill="none" stroke="#c99a3d" strokeWidth="2">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <ellipse key={a} cx="0" cy="-22" rx="9" ry="20" transform={`rotate(${a})`} />
              ))}
              <circle r="9" fill="#d9a93c" stroke="none" />
            </g>
          </g>
        ))}
        {/* Brass studs */}
        {Array.from({ length: 9 }, (_, r) =>
          [24, 176].map((x) => <circle key={`${r}-${x}`} cx={x} cy={40 + r * 55} r="5.5" fill={`url(#brass-${id})`} />)
        )}
        {/* Ring handle at the inner edge */}
        <circle cx="178" cy="276" r="13" fill="none" stroke={`url(#brass-${id})`} strokeWidth="5" />
        <circle cx="178" cy="262" r="5" fill={`url(#brass-${id})`} />
      </g>
    </svg>
  );
}

/** A small brass bell hanging from a chain. */
function HangingBell({ ringing }: { ringing: number }) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.svg
      key={ringing}
      className={s.bell}
      viewBox="0 0 60 110"
      aria-hidden
      style={{ transformOrigin: "50% 0%" }}
      initial={{ rotate: 0 }}
      animate={reduce || ringing === 0 ? { rotate: 0 } : { rotate: [0, 22, -18, 12, -8, 4, 0] }}
      transition={{ duration: 1.8, ease: "easeOut" }}
    >
      <defs>
        <linearGradient id="bell-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6114" />
          <stop offset="0.45" stopColor="#f6d27a" />
          <stop offset="1" stopColor="#8a6114" />
        </linearGradient>
      </defs>
      <path d="M30 0 V40" stroke="#8a6114" strokeWidth="3" strokeDasharray="4 3" />
      <circle cx="30" cy="44" r="5" fill="none" stroke="#b8862b" strokeWidth="3" />
      <path d="M12 92 Q12 54 30 50 Q48 54 48 92 Z" fill="url(#bell-brass)" />
      <rect x="8" y="90" width="44" height="7" rx="3" fill="#b8862b" />
      <circle cx="30" cy="102" r="5" fill="#8a6114" />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sanctum doors: ring the bell, the doors swing open on a photo       */
/* ------------------------------------------------------------------ */

export function SanctumDoors({ photo, title, sub }: { photo: string; title: string; sub: string }) {
  const t = useTranslations("premium.templeAlbum");
  const reduce = useSafeReducedMotion();
  const [open, setOpen] = useState(false);
  const [rings, setRings] = useState(0);
  const toggle = () => {
    if (!open) templeBell();
    setRings((r) => r + 1);
    setOpen((o) => !o);
  };
  const swing = { duration: reduce ? 0 : 1.6, ease: [0.65, 0, 0.3, 1] as const };
  return (
    <div className={s.sanctum}>
      <HangingBell ringing={rings} />
      <div className={s.sanctumArch}>
        <div className={s.sanctumInside}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" loading="lazy" />
          <motion.div
            className={s.sanctumText}
            initial={false}
            animate={{ opacity: open ? 1 : 0, y: open ? 0 : 12 }}
            transition={{ duration: reduce ? 0 : 0.8, delay: open && !reduce ? 0.9 : 0 }}
          >
            <p>{title}</p>
            <p>{sub}</p>
          </motion.div>
        </div>
        <div className={s.sanctumDoors} aria-hidden>
          <motion.div className={`${s.leaf} ${s.leafLeft}`} initial={false} animate={{ rotateY: open ? -108 : 0 }} transition={swing}>
            <CarvedDoor />
          </motion.div>
          <motion.div className={`${s.leaf} ${s.leafRight}`} initial={false} animate={{ rotateY: open ? 108 : 0 }} transition={swing}>
            <CarvedDoor flip />
          </motion.div>
        </div>
        <button type="button" className={s.sanctumHit} onClick={toggle} aria-label={t("doorsLabel")} aria-pressed={open} />
      </div>
      <button type="button" className={`${s.button} ${s.revealAll}`} onClick={toggle}>
        <Bell size={15} aria-hidden style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />
        {open ? t("closeDoors") : t("ring")}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Light the lamps: each lit lamp brightens the photo                  */
/* ------------------------------------------------------------------ */

function Diya({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 60 70" aria-hidden className={s.diyaArt}>
      {lit && (
        <g className={s.flame}>
          <ellipse cx="30" cy="22" rx="14" ry="18" fill="rgba(255,190,80,.28)" />
          <path d="M30 6 Q40 22 30 34 Q20 22 30 6Z" fill="#ffb627" />
          <path d="M30 14 Q35 24 30 32 Q25 24 30 14Z" fill="#fff4c2" />
        </g>
      )}
      <path d="M30 34 v6" stroke="#3b2a12" strokeWidth="2" />
      <path d="M4 42 Q30 40 56 42 Q50 62 30 62 Q10 62 4 42Z" fill="#b5652a" />
      <path d="M4 42 Q30 40 56 42" fill="none" stroke="#e7a25b" strokeWidth="2" />
      <path d="M12 50 Q30 54 48 50" fill="none" stroke="#7a3b14" strokeWidth="1.5" />
    </svg>
  );
}

export function LampLighting({ photo, count = 7 }: { photo: string; count?: number }) {
  const t = useTranslations("premium.templeAlbum");
  const [lit, setLit] = useState<boolean[]>(() => Array(count).fill(false));
  const n = lit.filter(Boolean).length;
  const all = n === count;
  const glow = n / count;
  return (
    <div className={s.lamps}>
      <div className={s.lampPhoto}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          loading="lazy"
          style={{ filter: `brightness(${0.18 + glow * 0.87}) saturate(${0.4 + glow * 0.7}) sepia(${0.35 * (1 - glow)})` }}
        />
        <span className={s.lampGlow} style={{ opacity: glow }} />
        <motion.p className={s.lampBlessing} initial={false} animate={{ opacity: all ? 1 : 0, y: all ? 0 : 10 }} transition={{ duration: 0.8 }}>
          {t("lampsBlessing")}
        </motion.p>
      </div>
      <div className={s.diyas}>
        {lit.map((on, k) => (
          <button
            key={k}
            type="button"
            className={s.diya}
            aria-label={t("lampN", { n: k + 1 })}
            aria-pressed={on}
            onClick={() => setLit((v) => v.map((b, j) => (j === k ? !b : b)))}
          >
            <Diya lit={on} />
          </button>
        ))}
      </div>
      <p className={s.tapHint} style={{ display: "flex", justifyContent: "center" }} aria-live="polite">
        <Flame size={13} aria-hidden />
        {n === 0 ? t("lampsHint") : t("lampsLit", { n, total: count })}
      </p>
      <button type="button" className={`${s.button} ${s.revealAll}`} onClick={() => setLit(Array(count).fill(!all))}>
        {all ? t("putOut") : t("lightAll")}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Garland of photo medallions that swing when tapped                  */
/* ------------------------------------------------------------------ */

const DROPS = [70, 120, 160, 120, 70];

function Medallion({ src, drop, k, label }: { src: string; drop: number; k: number; label: string }) {
  const controls = useAnimationControls();
  const reduce = useSafeReducedMotion();
  const swing = () => {
    if (reduce) return;
    const dir = k % 2 ? -1 : 1;
    controls.start({ rotate: [0, 26 * dir, -20 * dir, 13 * dir, -7 * dir, 3 * dir, 0], transition: { duration: 2.2, ease: "easeOut" } });
  };
  return (
    <motion.button
      type="button"
      className={s.medallion}
      style={{ ["--drop" as string]: `${drop}px`, ["--sway-delay" as string]: `${k * -0.7}s`, transformOrigin: "50% 0%" }}
      animate={controls}
      onClick={swing}
      aria-label={label}
    >
      <span className={s.medallionSway}>
        <span className={s.medallionThread} />
        <span className={s.medallionFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" draggable={false} />
        </span>
        <span className={s.medallionTassel} />
      </span>
    </motion.button>
  );
}

export function PhotoGarland({ photos }: { photos: string[] }) {
  const t = useTranslations("premium.templeAlbum");
  return (
    <div className={s.garland}>
      <Thoranam className={s.garlandString} />
      <div className={s.medallions}>
        {photos.slice(0, DROPS.length).map((src, k) => (
          <Medallion key={`${src}-${k}`} src={src} drop={DROPS[k]} k={k} label={t("swingN", { n: k + 1 })} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import useSafeReducedMotion from "../useSafeReducedMotion";
import { scriptLang } from "@/lib/monogram";
import type { IntroProps } from "../intros/types";
import { playSound, useWarmAudio } from "../intros/audio";
import { usePalaceT, worldOf } from "./world";
import type { WorldId } from "./shots";
import s from "./intro.module.css";

/** A soft, rising tanpura-like drone with a bell on top — only after the guest's tap. */
function entranceChime(_world?: string) {
  void _world;
  playSound((ac, now) => {
    [
      [146.8, 0.05, 0, 3.2],
      [220, 0.035, 0.05, 3],
      [293.7, 0.025, 0.1, 2.8],
      [880, 0.02, 0.35, 2.2],
      [1318.5, 0.012, 0.42, 1.8],
    ].forEach(([f, gain, at, len]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + at;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + len + 0.1);
    });
  });
}

/** Temple: a bright brass bell rung three times. Cathedral: a peal of
 * three church bells. Only from the guest's tap. */
function bells(world: WorldId) {
  const partials =
    world === "temple"
      ? [
          [523, 0.06],
          [1046, 0.03],
          [1308, 0.025],
          [1570, 0.015],
        ]
      : [
          [262, 0.06],
          [524, 0.035],
          [628, 0.025],
          [786, 0.015],
        ];
  playSound((ac, now) => {
    [0, 0.5, 1.0].forEach((at, k) => {
      partials.forEach(([f, gain]) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        const t0 = now + at;
        o.type = "sine";
        o.frequency.value = world === "cathedral" ? f * [1, 0.89, 0.75][k] : f;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2);
        o.connect(g).connect(ac.destination);
        o.start(t0);
        o.stop(t0 + 2.3);
      });
    });
  });
}

/** Park: a few birds calling — quick rising and falling chirps. */
function birdsong() {
  playSound((ac, now) => {
    [0, 0.18, 0.32, 0.9, 1.05, 1.6].forEach((at, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + at;
      const base = 2400 + (i % 3) * 500;
      o.type = "sine";
      o.frequency.setValueAtTime(base, t0);
      o.frequency.exponentialRampToValueAtTime(base * 1.6, t0 + 0.06);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t0 + 0.12);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.03, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + 0.16);
    });
  });
}

/** When each beat of the opening lands (ms). The last one shows the button. */
const BEATS = [400, 1100, 2200, 2700, 3400, 4500, 5900, 6600, 7300, 8000];
const LAST = BEATS.length;

/**
 * Intro "palaceGate" (royal-palace-3d): darkness, a few motes of gold, then
 * a palace gate appears; brass lamps light one after the other, the doors
 * swing inward, golden light pours out and the view moves through the
 * gateway into a hall of receding arches. "You are invited", the names and
 * the date follow, then "Enter the celebration". About eight seconds, with
 * "Skip intro" throughout. CSS 3D only (no WebGL), so it shows instantly
 * and plays the same in the landing-page card. Reduced motion: the final
 * frame, still.
 */
export default function PalaceIntro({ names, dateLabel, fonts, templateId, onOpen, onDone, burst, preview }: IntroProps) {
  const world = worldOf(templateId);
  const t = usePalaceT("intro", world);
  const reduce = useSafeReducedMotion();
  useWarmAudio(!preview);
  const [beat, setBeat] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    if (reduce) {
      pending.push(setTimeout(() => setBeat(LAST), 0));
    } else {
      BEATS.forEach((ms, i) => pending.push(setTimeout(() => setBeat(i + 1), ms)));
    }
    return () => pending.forEach(clearTimeout);
  }, [reduce]);

  function enter() {
    if (leaving) return;
    setLeaving(true);
    onOpen();
    if (reduce) {
      onDone();
      return;
    }
    if (!preview) (world === "palace" ? entranceChime : world === "park" ? birdsong : bells)(world);
    if (world === "temple") burst({ preset: "marigold", colors: ["#F28C1B", "#F7C531", "#FFF7E6"] });
    else if (world === "park") burst({ preset: "pastelPetals", colors: ["#F7C6D9", "#F2A7C3", "#FFFFFF"] });
    else if (world === "cathedral") burst({ preset: "pastelPetals", colors: ["#FFFFFF", "#F6D5DC", "#EBD08A"] });
    else burst({ preset: "glitter", colors: ["#FFF3C4", "#EBD08A", "#C9A24A"] });
    timers.current.push(setTimeout(onDone, 1100));
  }

  const at = (n: number) => beat >= n;
  const namesText = [names.a, names.b].filter(Boolean).join(" ");

  return (
    <div
      className={`${s.root} ${leaving ? s.leaving : ""}`}
      data-beat={beat}
      data-world={world}
      role="dialog"
      aria-label={t("dialogLabel")}
      style={{ "--intro-display": fonts.display, "--intro-caps": fonts.caps } as CSSProperties}
    >
      <div className={`${s.motes} ${at(1) ? s.on : ""}`} aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 53) % 100}%`, top: `${(i * 31) % 90}%`, animationDelay: `${(i % 6) * 0.5}s` }} />
        ))}
      </div>

      {/* Beyond the gate: a hall of arches, seen once the view moves through. */}
      <div className={`${s.hall} ${at(6) ? s.on : ""}`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={s.arch} style={{ "--i": i } as CSSProperties} />
          ))}
          <span className={s.hallGlow} />
        </div>

      {/* The gate */}
      <div className={`${s.world} ${at(6) ? s.push : ""}`} aria-hidden>
        <div className={`${s.facade} ${at(2) ? s.on : ""}`}>
          {world === "palace" && (
            <>
              <span className={s.dome} />
              <span className={`${s.chhatri} ${s.chhatriL}`} />
              <span className={`${s.chhatri} ${s.chhatriR}`} />
            </>
          )}
          {world === "temple" && (
            <span className={s.gopuram}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={s.tier} style={{ "--i": i } as CSSProperties} />
              ))}
              <span className={s.vault} />
            </span>
          )}
          {world === "park" && (
            <>
              <span className={`${s.tree} ${s.treeL}`} />
              <span className={`${s.tree} ${s.treeR}`} />
              <span className={s.blossomArch} />
            </>
          )}
          {world === "cathedral" && (
            <>
              <span className={`${s.tower} ${s.towerL}`} />
              <span className={`${s.tower} ${s.towerR}`} />
              <span className={s.gable} />
              <span className={`${s.rose} ${at(4) ? s.lit : ""}`} />
            </>
          )}
          <div className={s.wall}>
            <span className={s.frieze} />
            {/* Jharokha windows either side of the gate, lit from within */}
            {["l1", "l2", "r1", "r2"].map((k) => (
              <span key={k} className={`${s.jharokha} ${s[k]} ${at(4) ? s.lit : ""}`} />
            ))}
            <div className={`${s.gate} ${at(5) ? s.open : ""}`}>
              <span className={s.light} />
              <span className={`${s.door} ${s.doorL}`} />
              <span className={`${s.door} ${s.doorR}`} />
            </div>
          </div>
          <span className={`${s.lamp} ${s.lampL} ${at(3) ? s.lit : ""}`}>
            <span className={s.flame} />
          </span>
          <span className={`${s.lamp} ${s.lampR} ${at(4) ? s.lit : ""}`}>
            <span className={s.flame} />
          </span>
        </div>
      </div>

      <div className={s.copy}>
        <p className={`${s.invited} ${at(7) ? s.on : ""}`}>{t("invited")}</p>
        <h1 className={`${s.names} ${at(8) ? s.on : ""}`} lang={scriptLang(namesText)}>
          {names.a}
          {names.b !== undefined && (
            <>
              <span className={s.amp}> &amp; </span>
              {names.b}
            </>
          )}
        </h1>
        {dateLabel && <p className={`${s.date} ${at(9) ? s.on : ""}`}>{dateLabel}</p>}
        <button
          type="button"
          className={`${s.enter} ${at(LAST) ? s.on : ""}`}
          onClick={enter}
          disabled={leaving}
          tabIndex={at(LAST) ? 0 : -1}
        >
          {t("enter")}
        </button>
      </div>

      {!at(LAST) && (
        <button type="button" className={s.skip} onClick={enter}>
          {t("skip")}
        </button>
      )}
    </div>
  );
}

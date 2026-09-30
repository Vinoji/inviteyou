"use client";

import { playSound } from "./audio";

/**
 * Small synthesised sounds for the layout-style openings (SceneIntro) —
 * WebAudio only, nothing to download. Each is played from the guest's tap.
 */

/** A struck bell: a few inharmonic partials with a long decay. */
export function templeBell() {
  playSound((ac, now) => {
    [[520, 0.1], [1245, 0.05], [1860, 0.03], [2700, 0.015]].forEach(([f, v]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(v, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      o.connect(g).connect(ac.destination);
      o.start(now);
      o.stop(now + 3.3);
    });
  });
}

/** Rising notes — reedy (shehnai-like) or pure (flute-like). */
function notes(freqs: number[], type: OscillatorType, step: number, level: number, length = 0.6) {
  playSound((ac, now) => {
    freqs.forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t0 = now + i * step;
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(level, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
      o.connect(g).connect(ac.destination);
      o.start(t0);
      o.stop(t0 + length + 0.05);
    });
  });
}

export const shehnai = () => notes([293.66, 329.63, 369.99, 440, 493.88, 587.33], "sawtooth", 0.13, 0.022);
export const flute = () => notes([523.25, 587.33, 659.25, 783.99, 880], "sine", 0.16, 0.06, 0.8);
export const chime = () => notes([880, 1174.66, 1318.51, 1760], "triangle", 0.11, 0.05, 1.4);
export const softChime = () => notes([659.25, 783.99, 987.77], "sine", 0.18, 0.05, 1.6);

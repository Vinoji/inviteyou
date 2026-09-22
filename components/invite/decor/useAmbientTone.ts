"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A soft, template-tinted chord synthesized entirely in the browser via the
 * Web Audio API. This exists specifically so "default background music"
 * never depends on a downloaded or fabricated audio file — sourcing real
 * music without being able to verify its license is exactly the kind of
 * risk this project has avoided elsewhere (see the decorative SVGs), and
 * generating a short ambient tone in code sidesteps it entirely. It's a
 * fallback: a couple who uploads their own track always hears that instead
 * (see AudioToggle).
 */
const CHORDS: Record<string, number[]> = {
  "traditional-gold": [196.0, 246.94, 293.66], // warm G major-ish triad
  "floral-pastel": [261.63, 329.63, 392.0], // airy C major triad
  "elegant-bw": [220.0, 277.18, 329.63], // restrained A minor triad
  "beach-boho": [246.94, 311.13, 369.99], // breezy B-ish triad
  "minimal-modern": [233.08, 293.66, 349.23], // clean Bb major triad
};

export function useAmbientTone(templateId: string) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stopFnRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    stopFnRef.current?.();
    stopFnRef.current = null;
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return; // Web Audio unsupported — button just does nothing.

    const ctx = ctxRef.current ?? new Ctor();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const freqs = CHORDS[templateId] ?? CHORDS["traditional-gold"];
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.5);
    master.connect(ctx.destination);

    const oscillators = freqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      // A slow, gentle detune wobble per note so the chord breathes
      // instead of sounding like a flat, static test tone.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12 + i * 0.04;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 2.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);

      osc.connect(master);
      osc.start();
      lfo.start();
      return [osc, lfo];
    });

    stopFnRef.current = () => {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(0, now + 0.6);
      oscillators.flat().forEach((node) => {
        try {
          node.stop(now + 0.7);
        } catch {
          // Already stopped — harmless.
        }
      });
    };
    setPlaying(true);
  }, [templateId]);

  useEffect(() => stop, [stop]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else start();
  }, [playing, start, stop]);

  return { playing, toggle };
}

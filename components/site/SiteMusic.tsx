"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { MUSIC_LIBRARY } from "@/lib/mediaLibrary";

/** The site's theme music: Krishna flute, looping. */
const TRACK = MUSIC_LIBRARY.find((t) => t.id === "krishna-flute")!.src;
/** Low-to-medium by default; visitors can raise it with the slider. */
const DEFAULT_VOLUME = 0.35;
const PREF_KEY = "namma:site-music";
const VOLUME_KEY = "namma:site-music-volume";
const GESTURES = ["pointerdown", "keydown", "touchend"] as const;

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode — the choice just isn't remembered.
  }
}

function savedVolume() {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  const v = Number(read(VOLUME_KEY));
  return v > 0 && v <= 1 ? v : DEFAULT_VOLUME;
}

/**
 * Soft background music on the marketing pages. The header's speaker
 * button opens a small panel to play/pause and set the volume. It starts
 * by itself where the browser allows it, otherwise on the visitor's first
 * tap or key press (browsers block sound before that). Turning it off and
 * the volume are remembered on this device. It pauses while the tab is
 * hidden and stops when the visitor leaves the site pages (the header
 * unmounts), so it never overlaps an invitation's own music.
 */
export default function SiteMusic({ className = "" }: { className?: string }) {
  const t = useTranslations("site.music");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  // Only shown once the panel opens (after hydration), so reading storage
  // here can't mismatch the server render.
  const [volume, setVolume] = useState(savedVolume);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const audio = new Audio(TRACK);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = savedVolume();
    audioRef.current = audio;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    let armed = read(PREF_KEY) !== "off";
    const disarm = () => {
      armed = false;
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    };
    const tryPlay = () => {
      if (!armed) return;
      audio
        .play()
        .then(disarm)
        .catch(() => {
          // Not allowed yet — wait for a tap.
        });
    };
    function onGesture(e: Event) {
      // Taps on the music controls decide for themselves.
      if ((e.target as Element | null)?.closest?.("[data-site-music]")) return disarm();
      tryPlay();
    }
    tryPlay();
    GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));

    let wasPlaying = false;
    const onVisibility = () => {
      if (document.hidden) {
        wasPlaying = !audio.paused;
        audio.pause();
      } else if (wasPlaying) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disarm();
      document.removeEventListener("visibilitychange", onVisibility);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  // Close the panel on an outside tap or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play().catch(() => {});
    write(PREF_KEY, playing ? "off" : "on");
  }

  function changeVolume(v: number) {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    write(VOLUME_KEY, String(v));
  }

  const Icon = !playing || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div ref={boxRef} data-site-music className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t("controls")}
        title={t("controls")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8b04a]/50 text-[#ffe9b8] transition hover:bg-[#ffe9b8]/15 md:h-9 md:w-9"
      >
        <Icon size={17} className={playing ? "motion-safe:animate-pulse" : ""} />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-[90] mt-2 flex w-60 items-center gap-3 rounded-2xl border border-[#e8b04a]/40 bg-[#fffaf2] p-3 shadow-2xl shadow-black/30 dark:bg-[#1c1220]">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? t("off") : t("on")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b3261e] text-white"
          >
            {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
          </button>
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            {t("volume")}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-full accent-[#b3261e]"
            />
          </label>
        </div>
      )}
    </div>
  );
}

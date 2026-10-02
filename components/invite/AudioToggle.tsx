"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Volume1, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { INTRO_OPENED_EVENT, MUSIC_STATE_EVENT, MUSIC_TOGGLE_EVENT } from "./intros/events";
import MotionToggle from "./MotionToggle";
import { saveMusicVolume, savedMusicVolume, setMusicVolume } from "@/lib/media/volume";

const GESTURES = ["pointerdown", "keydown", "touchend"] as const;

/**
 * A floating music toggle. The couple's track (uploaded, or picked from
 * lib/mediaLibrary) loops and starts on its own: straight away where the
 * browser allows it, otherwise on the guest's first tap or key press
 * anywhere on the page (or opening the intro) — browsers block sound
 * before any interaction. A guest who pauses it stays paused.
 *
 * It plays at 25% by default; the small speaker beside the button opens a
 * volume slider (remembered on the device, and working on iPhones too —
 * see lib/media/volume). Without a track there's no music button at all.
 *
 * `preview` is the editor's copy: it sits in the corner of the preview
 * pane, starts only on taps inside the preview (`[data-preview-root]`),
 * and answers the editor's music list (MUSIC_TOGGLE_EVENT).
 */
export default function AudioToggle({
  src,
  accentColor,
  preview = false,
}: {
  src?: string;
  /** Kept for callers; the music doesn't depend on the design. */
  templateId: string;
  accentColor: string;
  preview?: boolean;
}) {
  const t = useTranslations("invite.audio");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [filePlaying, setFilePlaying] = useState(false);
  const userPaused = useRef(false);
  // Read once on the client; the slider only renders after a tap.
  const [volume, setVolume] = useState(savedMusicVolume);
  const volumeRef = useRef(volume);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const volumeBox = useRef<HTMLDivElement>(null);
  const usingFile = Boolean(src);
  const playing = filePlaying;

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(MUSIC_STATE_EVENT, { detail: { playing: filePlaying } }));
  }, [filePlaying]);

  // Autoplay: try now, then on the first interaction. Re-armed for each new
  // track, so a freshly picked song plays even after a pause.
  useEffect(() => {
    userPaused.current = false;
    if (!usingFile) return;
    let armed = true;
    const disarm = () => {
      armed = false;
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
      window.removeEventListener(INTRO_OPENED_EVENT, onIntro);
    };
    function tryPlay(fromGesture = false) {
      const audio = audioRef.current;
      if (!armed || userPaused.current || !audio || !audio.paused) return;
      setMusicVolume(audio, volumeRef.current, fromGesture);
      audio
        .play()
        .then(() => {
          setFilePlaying(true);
          disarm();
        })
        .catch(() => {
          // Not allowed yet — wait for a tap.
        });
    }
    function onGesture(e: Event) {
      if (preview && !(e.target as Element | null)?.closest?.("[data-preview-root]")) return;
      tryPlay(true);
    }
    const onIntro = () => tryPlay(true);
    tryPlay();
    GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
    window.addEventListener(INTRO_OPENED_EVENT, onIntro);
    return disarm;
  }, [usingFile, src, preview]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      userPaused.current = true;
      setFilePlaying(false);
    } else {
      userPaused.current = false;
      setMusicVolume(audio, volumeRef.current, true);
      audio
        .play()
        .then(() => setFilePlaying(true))
        .catch(() => {
          // Playback can still fail (e.g. the file no longer exists) —
          // leave the button in its "off" state.
        });
    }
  }
  function changeVolume(v: number) {
    setVolume(v);
    volumeRef.current = v;
    saveMusicVolume(v);
    if (audioRef.current) setMusicVolume(audioRef.current, v, true);
  }

  useEffect(() => {
    if (!volumeOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!volumeBox.current?.contains(e.target as Node)) setVolumeOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [volumeOpen]);

  const toggleRef = useRef(toggle);
  useEffect(() => {
    toggleRef.current = toggle;
  });

  useEffect(() => {
    if (!preview) return;
    const onToggle = () => toggleRef.current();
    window.addEventListener(MUSIC_TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(MUSIC_TOGGLE_EVENT, onToggle);
  }, [preview]);

  return (
    <>
      {usingFile && (
        <audio
          // A fresh element per song: on iOS a library song is wired into
          // a Web Audio graph for volume, which an uploaded song can't use.
          key={src}
          ref={audioRef}
          src={src}
          loop
          preload="metadata"
          onPause={() => setFilePlaying(false)}
          onPlay={() => setFilePlaying(true)}
        />
      )}
      {!preview && <MotionToggle accentColor={accentColor} aboveMusic={usingFile} />}
      {usingFile && (
        <div
          ref={volumeBox}
          className={`${preview ? "absolute right-[4.25rem] bottom-5" : "fixed right-[5.25rem] bottom-6"} z-40`}
        >
          {volumeOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-44 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
              <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: accentColor }}>
                {t("volume")}
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor }}
                />
              </label>
            </div>
          )}
          <button
            type="button"
            onClick={() => setVolumeOpen((o) => !o)}
            aria-expanded={volumeOpen}
            aria-label={t("volume")}
            style={{ color: accentColor }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur active:scale-90"
          >
            {volume < 0.5 ? <Volume1 size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      )}
      {usingFile && (
        <button
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? t("pause") : t("play")}
          style={{ backgroundColor: accentColor }}
          className={`${preview ? "absolute right-4 bottom-4" : "fixed right-5 bottom-5"} z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-90`}
        >
          <Music size={19} className={playing ? "animate-[spin_6s_linear_infinite]" : ""} />
        </button>
      )}
    </>
  );
}

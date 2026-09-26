"use client";

import { useEffect, useRef, useState } from "react";
import { Music } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAmbientTone } from "./decor/useAmbientTone";
import { INTRO_OPENED_EVENT } from "./intros/events";

/**
 * A floating music toggle. If the couple uploaded their own track, this
 * plays that file; otherwise it falls back to a short synthesized ambient
 * chord (see useAmbientTone) so there's always *something* rather than a
 * dead button. Starts paused either way — browsers block unrequested
 * autoplay-with-sound, and guests in a quiet room shouldn't have music
 * forced on them. A tap is a real user gesture, so playback always
 * succeeds here.
 *
 * The one exception: when a guest opens the intro (INTRO_OPENED_EVENT, fired
 * from inside their tap), the couple's own uploaded track starts — they
 * chose that music on purpose. The synthesized fallback never auto-starts.
 */
export default function AudioToggle({
  src,
  templateId,
  accentColor,
}: {
  src?: string;
  templateId: string;
  accentColor: string;
}) {
  const t = useTranslations("invite.audio");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [filePlaying, setFilePlaying] = useState(false);
  const ambient = useAmbientTone(templateId);

  const usingFile = Boolean(src);
  const playing = usingFile ? filePlaying : ambient.playing;

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    if (!usingFile) return;
    const start = () => {
      const audio = audioRef.current;
      if (!audio || !audio.paused) return;
      audio
        .play()
        .then(() => setFilePlaying(true))
        .catch(() => {
          // Blocked or missing file — the toggle stays available.
        });
    };
    window.addEventListener(INTRO_OPENED_EVENT, start);
    return () => window.removeEventListener(INTRO_OPENED_EVENT, start);
  }, [usingFile]);

  function toggle() {
    if (!usingFile) {
      ambient.toggle();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (filePlaying) {
      audio.pause();
      setFilePlaying(false);
    } else {
      audio
        .play()
        .then(() => setFilePlaying(true))
        .catch(() => {
          // Playback can still fail (e.g. the file no longer exists) —
          // leave the button in its "off" state.
        });
    }
  }

  return (
    <>
      {usingFile && <audio ref={audioRef} src={src} loop preload="none" />}
      <button
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? t("pause") : t("play")}
        style={{ backgroundColor: accentColor }}
        className="fixed right-5 bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-90"
      >
        <Music size={19} className={playing ? "animate-[spin_6s_linear_infinite]" : ""} />
      </button>
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pause, Play, Scissors, X } from "lucide-react";
import { decode, peaks, trimAudio } from "@/lib/media/compressAudio";

/** The shortest part we'll keep. */
const MIN_S = 10;
const BARS = 90;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * After a song is chosen: pick the part guests will hear. Shows the song's
 * shape, a start and an end, and plays just that part; "Use this part"
 * cuts it in the browser (with a short fade at each end) so only that part
 * is uploaded. A song the browser can't read goes up whole.
 */
export default function AudioTrimmer({
  file,
  onDone,
  onCancel,
}: {
  file: File;
  /** The song to upload: the cut part (already an MP3), or the whole file. */
  onDone: (song: Blob, trimmed: boolean) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("editor.trim");
  const [audio, setAudio] = useState<AudioBuffer | null>(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    let live = true;
    decode(file).then((a) => {
      if (!live) return;
      if (!a || !a.duration) return setFailed(true);
      setAudio(a);
      setRange([0, a.duration]);
    });
    return () => {
      live = false;
    };
  }, [file]);

  // A song the browser can't read is uploaded as it is.
  useEffect(() => {
    if (failed) onDone(file, false);
  }, [failed, file, onDone]);

  const shape = useMemo(() => (audio ? peaks(audio, BARS) : []), [audio]);
  const duration = audio?.duration ?? 0;
  const [start, end] = range;

  function setStart(v: number) {
    setRange(([, e]) => [Math.min(v, Math.max(0, e - MIN_S)), e]);
  }
  function setEnd(v: number) {
    setRange(([s]) => [s, Math.max(v, Math.min(duration, s + MIN_S))]);
  }

  function toggle() {
    const el = player.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    el.currentTime = start;
    void el.play();
    setPlaying(true);
  }

  async function use() {
    player.current?.pause();
    if (!audio) return;
    // The whole song: no cut, the usual upload (which compresses it if that helps).
    if (start < 0.5 && end > duration - 0.5) return onDone(file, false);
    setProgress(0);
    try {
      onDone(await trimAudio(audio, start, end, setProgress), true);
    } catch {
      onDone(file, false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal aria-label={t("title")}>
      <div className="w-full max-w-md rounded-t-3xl bg-[#fffaf2] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl dark:bg-[#1c1220]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
              <Scissors size={17} aria-hidden />
              {t("title")}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">{t("sub")}</p>
          </div>
          <button type="button" onClick={onCancel} aria-label={t("cancel")} className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={18} aria-hidden />
          </button>
        </div>

        {!audio ? (
          <p className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            {t("reading")}
          </p>
        ) : (
          <>
            {/* the song's shape, the chosen part in gold */}
            <div className="mt-5 flex h-16 items-center gap-[2px]" aria-hidden>
              {shape.map((v, i) => {
                const at = ((i + 0.5) / BARS) * duration;
                const inside = at >= start && at <= end;
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full ${inside ? "bg-[#c98f3a]" : "bg-neutral-300 dark:bg-neutral-700"}`}
                    style={{ height: `${Math.max(8, v * 100)}%` }}
                  />
                );
              })}
            </div>

            <label className="mt-4 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <span className="flex justify-between">
                {t("start")}
                <span className="tabular-nums text-neutral-500">{clock(start)}</span>
              </span>
              <input type="range" min={0} max={duration} step={0.5} value={start} onChange={(e) => setStart(Number(e.target.value))} className="mt-1 w-full accent-[#c98f3a]" />
            </label>
            <label className="mt-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <span className="flex justify-between">
                {t("end")}
                <span className="tabular-nums text-neutral-500">{clock(end)}</span>
              </span>
              <input type="range" min={0} max={duration} step={0.5} value={end} onChange={(e) => setEnd(Number(e.target.value))} className="mt-1 w-full accent-[#c98f3a]" />
            </label>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggle}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
              >
                {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
                {playing ? t("stop") : t("play")}
              </button>
              <span className="text-sm tabular-nums text-neutral-500">{t("length", { time: clock(end - start) })}</span>
            </div>

            <button
              type="button"
              onClick={use}
              disabled={progress !== null}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] text-sm font-bold text-[#2a0c27] disabled:opacity-60"
            >
              {progress !== null ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Scissors size={16} aria-hidden />}
              {progress !== null ? t("working", { percent: Math.round(progress * 100) }) : start < 0.5 && end > duration - 0.5 ? t("useWhole") : t("use")}
            </button>
          </>
        )}

        <audio
          ref={player}
          src={url}
          preload="auto"
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= end) {
              e.currentTarget.pause();
              setPlaying(false);
            }
          }}
          onEnded={() => setPlaying(false)}
        />
      </div>
    </div>
  );
}

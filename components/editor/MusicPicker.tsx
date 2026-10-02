"use client";

import { useEffect, useState } from "react";
import { Check, Music2, Pause, Play, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { MUSIC_LIBRARY, findTrack, forCategory, type LibraryTrack } from "@/lib/mediaLibrary";
import { MUSIC_STATE_EVENT, MUSIC_TOGGLE_EVENT } from "@/components/invite/intros/events";

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Background music: songs from the library (suggested for this occasion
 * first), the couple's own upload, or none. Picking a song plays it in the
 * preview right away — exactly as guests will hear it, looping — and the
 * chosen row's button pauses/resumes the preview (MUSIC_TOGGLE_EVENT).
 */
export default function MusicPicker({
  category,
  value,
  onChange,
  uploadLabel,
  uploading,
  onUpload,
}: {
  category: string;
  value: string;
  onChange: (src: string) => void;
  uploadLabel: string;
  uploading: boolean;
  onUpload: (file: File | null) => void;
}) {
  const t = useTranslations("editor");
  const [playing, setPlaying] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const onState = (e: Event) => setPlaying(Boolean((e as CustomEvent).detail?.playing));
    window.addEventListener(MUSIC_STATE_EVENT, onState);
    return () => window.removeEventListener(MUSIC_STATE_EVENT, onState);
  }, []);

  const { suggested, others } = forCategory(MUSIC_LIBRARY, category);
  const own = value && !findTrack(value);

  function row(track: LibraryTrack) {
    const chosen = value === track.src;
    return (
      <li key={track.id}>
        <button
          type="button"
          onClick={() => (chosen ? window.dispatchEvent(new Event(MUSIC_TOGGLE_EVENT)) : onChange(track.src))}
          aria-pressed={chosen}
          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left ${
            chosen
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              chosen ? "bg-amber-500 text-white" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {chosen && playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {t(`musicLibrary.tracks.${track.id}.name`)}
            </span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              {t(`musicLibrary.tracks.${track.id}.mood`)} · {mmss(track.duration)}
            </span>
          </span>
          {chosen && <Check size={16} className="shrink-0 text-amber-600" aria-hidden />}
        </button>
      </li>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{t("musicLibrary.hint")}</p>

      <ul className="space-y-1.5">
        <li>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-pressed={!value}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm ${
              !value
                ? "border-amber-500 bg-amber-50 font-semibold dark:bg-amber-950/40"
                : "border-neutral-200 dark:border-neutral-800"
            } text-neutral-700 dark:text-neutral-200`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
              <Music2 size={14} />
            </span>
            {t("musicLibrary.none")}
          </button>
        </li>
        {own && (
          <li>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(MUSIC_TOGGLE_EVENT))}
              aria-pressed
              className="flex w-full items-center gap-3 rounded-lg border border-amber-500 bg-amber-50 px-3 py-2 text-left dark:bg-amber-950/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </span>
              <span className="flex-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {t("musicLibrary.yourSong")}
              </span>
              <Check size={16} className="text-amber-600" aria-hidden />
            </button>
          </li>
        )}
      </ul>

      {suggested.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {t("musicLibrary.suggested")}
          </p>
          <ul className="space-y-1.5">{suggested.map(row)}</ul>
        </div>
      )}

      {showAll || suggested.length === 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {t("musicLibrary.more")}
          </p>
          <ul className="space-y-1.5">{others.map(row)}</ul>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
        >
          {t("musicLibrary.showMore", { count: others.length })}
        </button>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600 hover:border-amber-400 dark:border-neutral-700 dark:text-neutral-300">
        <Upload size={15} />
        {uploadLabel}
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            onUpload(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("musicLibrary.credit")}</p>
    </div>
  );
}

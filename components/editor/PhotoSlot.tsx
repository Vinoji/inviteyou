"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

const tile =
  "relative aspect-square overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900";
const iconBtn =
  "flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75 disabled:opacity-30";

/** A filled gallery slot: the photo, its order controls and remove. */
export function PhotoTile({
  index,
  count,
  url,
  onRemove,
  onMove,
}: {
  index: number;
  count: number;
  url: string;
  onRemove: (index: number) => void;
  onMove: (index: number, by: -1 | 1) => void;
}) {
  const t = useTranslations("editor");
  const n = index + 1;
  return (
    <div className={tile}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={t("photoLabel", { n })} className="h-full w-full object-cover" />
      {index === 0 && (
        <span className="absolute top-1 left-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          {t("coverBadge")}
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className={`${iconBtn} absolute top-1 right-1`}
        aria-label={t("removePhoto")}
      >
        <X size={14} />
      </button>
      <div className="absolute inset-x-1 bottom-1 flex justify-between">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className={iconBtn}
          aria-label={t("moveEarlier", { n })}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === count - 1}
          className={iconBtn}
          aria-label={t("moveLater", { n })}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/** The next empty slot: pick a photo (it's cropped before upload). */
export function AddPhotoTile({
  index,
  uploading,
  onPick,
}: {
  index: number;
  uploading: boolean;
  onPick: (file: File | null) => void;
}) {
  const t = useTranslations("editor");
  return (
    <div className={tile}>
      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-neutral-400 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400">
        {uploading ? (
          <span className="text-xs">{t("uploading")}</span>
        ) : (
          <>
            <span className="text-xl">+</span>
            <span className="text-[10px]">{t("photoLabel", { n: index + 1 })}</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            onPick(e.target.files?.[0] ?? null);
            e.target.value = ""; // so picking the same file again still fires
          }}
        />
      </label>
    </div>
  );
}

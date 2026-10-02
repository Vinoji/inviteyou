"use client";

import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, ChevronUp, Crop, GripVertical, ImagePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { MAX_PHOTOS, photoRole, photoShape } from "@/lib/photoPlan";
import { ASPECT_LABEL } from "./PhotoCropper";

const iconBtn =
  "flex h-8 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";

/**
 * The couple's photos as a list in display order. Each row says where the
 * photo appears in this design and the shape that suits it; rows are
 * dragged by the handle (or moved with the arrows) to reorder, and
 * "Adjust" re-crops a photo that's already uploaded.
 */
export function PhotoList({
  templateId,
  photos,
  galleryShown,
  onReorder,
  onRemove,
  onMove,
  onAdjust,
}: {
  templateId: string;
  photos: string[];
  galleryShown: boolean;
  onReorder: (photos: string[]) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, by: -1 | 1) => void;
  onAdjust: (index: number) => void;
}) {
  return (
    <Reorder.Group axis="y" values={photos} onReorder={onReorder} className="space-y-2">
      {photos.map((url, i) => (
        <PhotoRow
          key={url}
          url={url}
          index={i}
          count={photos.length}
          templateId={templateId}
          galleryShown={galleryShown}
          onRemove={onRemove}
          onMove={onMove}
          onAdjust={onAdjust}
        />
      ))}
    </Reorder.Group>
  );
}

function PhotoRow({
  url,
  index,
  count,
  templateId,
  galleryShown,
  onRemove,
  onMove,
  onAdjust,
}: {
  url: string;
  index: number;
  count: number;
  templateId: string;
  galleryShown: boolean;
  onRemove: (index: number) => void;
  onMove: (index: number, by: -1 | 1) => void;
  onAdjust: (index: number) => void;
}) {
  const t = useTranslations("editor");
  const controls = useDragControls();
  const n = index + 1;
  const role = photoRole(templateId, index);
  const hidden = role === "gallery" && !galleryShown;
  const shape = photoShape(templateId, index);
  return (
    <Reorder.Item
      value={url}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="flex h-14 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-neutral-400 active:cursor-grabbing"
        aria-label={t("dragToReorder")}
        title={t("dragToReorder")}
      >
        <GripVertical size={18} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={t("photoLabel", { n })}
        draggable={false}
        className={`h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14 ${hidden ? "opacity-40" : ""}`}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-start gap-1.5 text-sm leading-tight font-semibold text-neutral-800 dark:text-neutral-100">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white dark:bg-neutral-100 dark:text-neutral-900">
            {n}
          </span>
          <span>{t(`photoRoles.${role}.label`)}</span>
        </p>
        <p className="mt-0.5 text-xs leading-snug text-neutral-500 dark:text-neutral-400">
          {hidden
            ? t("photoGalleryOff")
            : `${t(`photoRoles.${role}.where`)} ${
                shape === "original" ? t("anyShape") : t("bestShape", { shape: t(ASPECT_LABEL[shape]) })
              }`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onAdjust(index)}
        className={iconBtn}
        aria-label={t("adjustPhoto", { n })}
        title={t("adjustPhoto", { n })}
      >
        <Crop size={16} />
      </button>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className={`${iconBtn} h-6`}
          aria-label={t("moveEarlier", { n })}
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === count - 1}
          className={`${iconBtn} h-6`}
          aria-label={t("moveLater", { n })}
        >
          <ChevronDown size={16} />
        </button>
      </div>
      <button type="button" onClick={() => onRemove(index)} className={iconBtn} aria-label={t("removePhoto")}>
        <X size={16} />
      </button>
    </Reorder.Item>
  );
}

/** "Add photos": pick one (cropped first) or several at once (uploaded as they are). */
export function AddPhotos({
  count,
  progress,
  onPick,
}: {
  count: number;
  /** Set while a batch uploads: photos done / total. */
  progress: { done: number; total: number } | null;
  onPick: (files: File[]) => void;
}) {
  const t = useTranslations("editor");
  const full = count >= MAX_PHOTOS;
  return (
    <label
      className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-4 text-sm font-semibold dark:border-neutral-700 ${
        full || progress
          ? "cursor-default text-neutral-400 dark:text-neutral-600"
          : "cursor-pointer text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
      }`}
    >
      <ImagePlus size={18} />
      {progress
        ? t("uploadingPhotos", { done: progress.done, total: progress.total })
        : full
          ? t("photosFull", { max: MAX_PHOTOS })
          : t("addPhotos", { left: MAX_PHOTOS - count })}
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={full || Boolean(progress)}
        onChange={(e) => {
          onPick(Array.from(e.target.files ?? []));
          e.target.value = ""; // so picking the same file again still fires
        }}
      />
    </label>
  );
}

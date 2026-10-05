"use client";

import { useState } from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import { ArrowUpToLine, ChevronDown, ChevronUp, Crop, GripVertical, ImagePlus, MoreHorizontal, Trash2, X } from "lucide-react";
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
  // Phones: a row's actions open in a slide-up panel instead of tiny buttons.
  const [sheetFor, setSheetFor] = useState<number | null>(null);
  const sheetIndex = sheetFor !== null && sheetFor < photos.length ? sheetFor : null;
  return (
    <>
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
          onOptions={setSheetFor}
        />
      ))}
    </Reorder.Group>
    <PhotoSheet
      index={sheetIndex}
      photos={photos}
      templateId={templateId}
      onClose={() => setSheetFor(null)}
      onAdjust={onAdjust}
      onMove={onMove}
      onRemove={onRemove}
      onMakeFirst={(i) => onReorder([photos[i], ...photos.filter((_, k) => k !== i)])}
    />
    </>
  );
}

/** The slide-up panel of one photo's actions (phones). */
function PhotoSheet({
  index,
  photos,
  templateId,
  onClose,
  onAdjust,
  onMove,
  onRemove,
  onMakeFirst,
}: {
  index: number | null;
  photos: string[];
  templateId: string;
  onClose: () => void;
  onAdjust: (index: number) => void;
  onMove: (index: number, by: -1 | 1) => void;
  onRemove: (index: number) => void;
  onMakeFirst: (index: number) => void;
}) {
  const t = useTranslations("editor");
  const open = index !== null;
  const act = (fn: () => void) => () => {
    fn();
    onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <motion.button
            type="button"
            aria-label={t("close")}
            className="absolute inset-0 bg-[#22091f]/60 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("photoOptions", { n: index + 1 })}
            className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-3xl border-t border-[#e8b04a]/50 bg-[#fffaf2] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl dark:bg-[#1c1220]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 80 && onClose()}
          >
            <div className="flex items-center gap-3 bg-gradient-to-br from-[#3d1236] to-[#22091f] px-4 pt-3 pb-4 text-[#fff6e6]">
              <span className="absolute top-1.5 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-[#e8b04a]/50" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[index]} alt="" className="mt-2 h-14 w-14 rounded-xl object-cover ring-2 ring-[#e8b04a]/60" />
              <div className="mt-2 min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#e8b04a] uppercase">
                  {t("photoLabel", { n: index + 1 })}
                </p>
                <p className="truncate font-serif text-base font-bold">{t(`photoRoles.${photoRole(templateId, index)}.label`)}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="mt-2 flex h-10 w-10 items-center justify-center rounded-full text-[#ffe9b8] hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="divide-y divide-[#e8b04a]/15 px-2 py-1 text-[15px] font-semibold text-neutral-800 dark:text-neutral-100">
              <SheetItem icon={Crop} label={t("cropResize")} onClick={act(() => onAdjust(index))} />
              {index > 0 && <SheetItem icon={ArrowUpToLine} label={t("makeFirst")} onClick={act(() => onMakeFirst(index))} />}
              {index > 0 && <SheetItem icon={ChevronUp} label={t("moveUp")} onClick={act(() => onMove(index, -1))} />}
              {index < photos.length - 1 && (
                <SheetItem icon={ChevronDown} label={t("moveDown")} onClick={act(() => onMove(index, 1))} />
              )}
              <SheetItem icon={Trash2} label={t("removePhoto")} danger onClick={act(() => onRemove(index))} />
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SheetItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Crop;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex h-14 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-[#e8b04a]/10 ${
          danger ? "text-red-600 dark:text-red-400" : ""
        }`}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            danger ? "bg-red-50 dark:bg-red-950/40" : "bg-[#e8b04a]/15 text-[#9a6418] dark:text-[#ffd35c]"
          }`}
        >
          <Icon size={17} aria-hidden />
        </span>
        {label}
      </button>
    </li>
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
  onOptions,
}: {
  url: string;
  index: number;
  count: number;
  templateId: string;
  galleryShown: boolean;
  onRemove: (index: number) => void;
  onMove: (index: number, by: -1 | 1) => void;
  onAdjust: (index: number) => void;
  onOptions: (index: number) => void;
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
        onClick={() => onOptions(index)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8b04a]/15 text-[#9a6418] lg:hidden dark:text-[#ffd35c]"
        aria-label={t("photoOptions", { n })}
      >
        <MoreHorizontal size={20} />
      </button>
      <div className="hidden items-center lg:flex">
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
      </div>
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

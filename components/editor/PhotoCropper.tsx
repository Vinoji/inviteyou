"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useTranslations } from "next-intl";

const ASPECTS = [
  { id: "original", ratio: null },
  { id: "square", ratio: 1 },
  { id: "portrait", ratio: 4 / 5 },
  { id: "landscape", ratio: 3 / 2 },
] as const;
type AspectId = (typeof ASPECTS)[number]["id"];
const ASPECT_LABEL: Record<AspectId, string> = {
  original: "aspectOriginal",
  square: "aspectSquare",
  portrait: "aspectPortrait",
  landscape: "aspectLandscape",
};

/** Longest side of the uploaded result — plenty for a full-screen photo,
 * and keeps uploads well under the storage size limit. */
const MAX_OUTPUT = 2000;
const BOX_MAX_W = 420;

/**
 * Crop-before-upload dialog: pick a shape, drag to position, zoom. The
 * crop is described by the image point under the box centre (cx, cy) and a
 * zoom over "just covers the box", so zooming keeps the centre in place and
 * clamping keeps the box always filled with photo. Photos the browser can't
 * decode (e.g. HEIC outside Safari) skip straight to upload as they are.
 */
export default function PhotoCropper({
  file,
  onCancel,
  onApply,
}: {
  file: File;
  onCancel: () => void;
  /** The cropped JPEG — or the original file when it couldn't be decoded. */
  onApply: (result: Blob) => void;
}) {
  const t = useTranslations("editor");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<AspectId>("original");
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const [boxW, setBoxW] = useState(BOX_MAX_W);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setCenter({ x: image.naturalWidth / 2, y: image.naturalHeight / 2 });
    };
    image.onerror = () => onApply(file);
    image.src = url;
    return () => {
      // Detach first: revoking the URL makes a still-loading image fire
      // onerror, which would upload the file uncropped.
      image.onload = image.onerror = null;
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    const fit = () => setBoxW(Math.min(BOX_MAX_W, window.innerWidth - 64));
    fit();
    window.addEventListener("resize", fit);
    dialogRef.current?.focus();
    return () => window.removeEventListener("resize", fit);
  }, []);

  if (!img || !center) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60">
        <span className="text-sm text-white">{t("uploading")}</span>
      </div>
    );
  }

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const ratio = ASPECTS.find((a) => a.id === aspect)!.ratio ?? iw / ih;
  // Fit the box inside both the width budget and ~60% of the screen height.
  const maxH = typeof window !== "undefined" ? window.innerHeight * 0.6 : 500;
  const w = Math.min(boxW, maxH * ratio);
  const h = w / ratio;
  const scale = Math.max(w / iw, h / ih) * zoom;

  function clamp(c: { x: number; y: number }, s = scale) {
    const hx = w / (2 * s);
    const hy = h / (2 * s);
    return {
      x: Math.min(Math.max(c.x, hx), iw - hx),
      y: Math.min(Math.max(c.y, hy), ih - hy),
    };
  }
  const c = clamp(center);
  const left = w / 2 - c.x * scale;
  const top = h / 2 - c.y * scale;

  function pan(dx: number, dy: number) {
    setCenter(clamp({ x: c.x - dx / scale, y: c.y - dy / scale }));
  }
  function onPointerDown(e: PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerMove(e: PointerEvent) {
    if (!drag.current) return;
    pan(e.clientX - drag.current.x, e.clientY - drag.current.y);
    drag.current = { x: e.clientX, y: e.clientY };
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") return onCancel();
    const step = e.shiftKey ? 40 : 10;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    // Arrow keys pan only while the crop box itself has focus.
    if (moves[e.key] && (e.target as HTMLElement).dataset.cropBox !== undefined) {
      e.preventDefault();
      pan(...moves[e.key]);
    }
  }

  function apply() {
    const sw = w / scale;
    const sh = h / scale;
    const k = Math.min(1, MAX_OUTPUT / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw * k);
    canvas.height = Math.round(sh * k);
    const ctx = canvas.getContext("2d");
    if (!ctx) return onApply(file);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img!, c.x - sw / 2, c.y - sh / 2, sw, sh, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => onApply(blob ?? file), "image/jpeg", 0.88);
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("cropTitle")}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="w-full max-w-[460px] rounded-2xl bg-white p-4 shadow-xl outline-none dark:bg-neutral-900"
      >
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{t("cropTitle")}</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ASPECTS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={aspect === a.id}
              onClick={() => setAspect(a.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                aspect === a.id
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                  : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {t(ASPECT_LABEL[a.id])}
            </button>
          ))}
        </div>

        <div
          className="relative mx-auto mt-3 cursor-grab touch-none overflow-hidden rounded-lg bg-neutral-200 select-none active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-amber-600 dark:bg-neutral-800"
          style={{ width: w, height: h }}
          tabIndex={0}
          aria-label={t("cropDrag")}
          data-crop-box
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{ left, top, width: iw * scale, height: ih * scale }}
          />
          {/* Rule-of-thirds guides. */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="border border-white/25" />
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">{t("cropDrag")}</p>

        <label className="mt-3 flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
          {t("zoom")}
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              const z = Number(e.target.value);
              setZoom(z);
              setCenter(clamp(c, Math.max(w / iw, h / ih) * z));
            }}
            className="flex-1"
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
          >
            {t("cropCancel")}
          </button>
          <button
            type="button"
            onClick={apply}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            {t("cropApply")}
          </button>
        </div>
      </div>
    </div>
  );
}

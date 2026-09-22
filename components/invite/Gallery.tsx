"use client";

import { useState } from "react";
import SectionDivider from "./SectionDivider";

export default function Gallery({
  photos,
  accentColor,
  templateId,
  coupleLabel,
}: {
  photos: string[];
  accentColor: string;
  templateId: string;
  coupleLabel: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  // Skip the first photo — it's already shown as the hero background.
  const gridPhotos = photos.slice(1);
  if (gridPhotos.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
      <div className="text-center">
        <h2
          className="text-sm font-semibold tracking-[0.3em] uppercase"
          style={{ color: accentColor }}
        >
          Gallery
        </h2>
        <div className="mt-3">
          <SectionDivider templateId={templateId} accent={accentColor} />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {gridPhotos.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            className="group aspect-square overflow-hidden rounded-xl bg-neutral-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${coupleLabel} photo ${i + 2}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gridPhotos[active]}
            alt={`${coupleLabel} photo ${active + 2}`}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          <button
            className="absolute top-5 right-5 text-2xl text-white"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}

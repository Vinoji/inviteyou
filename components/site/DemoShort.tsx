"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * A YouTube Short on the Demos page: the thumbnail and a play button, and
 * the player (youtube-nocookie) only after a tap — eight live iframes at
 * once would make phones lag.
 */
export default function DemoShort({ id, title, playLabel }: { id: string; title: string; playLabel: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#22091f]">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${playLabel} — ${title}`} className="group absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" aria-hidden />
          <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e8b04a] text-[#2a0c27] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.8)] transition group-hover:scale-110">
            <Play size={24} className="ml-1 fill-current" aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}

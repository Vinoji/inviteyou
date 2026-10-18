"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { parseYouTube } from "@/lib/youtube";

/**
 * The couple's YouTube video on the invitation: the video's own thumbnail
 * and a play button; YouTube's player (privacy-enhanced, no cookies until
 * played) loads only when a guest taps — so the page stays light on
 * phones. Shorts are shown upright.
 */
export default function InviteVideo({
  url,
  accent = "#c4262e",
  className = "",
  dark = false,
}: {
  url?: string;
  accent?: string;
  className?: string;
  /** On a dark page: light heading text. */
  dark?: boolean;
}) {
  const t = useTranslations("invite.view");
  const [playing, setPlaying] = useState(false);
  const ref = parseYouTube(url);
  if (!ref) return null;
  return (
    <section className={`mx-auto w-full px-5 py-10 ${ref.vertical ? "max-w-xs" : "max-w-2xl"} ${className}`}>
      <h2 className={`mb-4 text-center font-serif text-2xl font-semibold ${dark ? "text-white" : "text-neutral-900"}`} style={{ fontFamily: "var(--inv-heading, inherit)" }}>
        {t("videoTitle")}
      </h2>
      <div
        className={`relative overflow-hidden rounded-2xl bg-black shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] ${ref.vertical ? "aspect-[9/16]" : "aspect-video"}`}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ref.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
            title={t("videoTitle")}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={t("videoPlay")} className="group absolute inset-0 h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${ref.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />
            <span
              className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-xl ring-4 ring-white/30 transition group-hover:scale-110"
              style={{ background: accent }}
            >
              <Play size={26} className="ml-1 fill-white" aria-hidden />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}

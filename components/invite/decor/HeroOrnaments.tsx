import MandalaMotif from "./MandalaMotif";
import PaisleyCorner from "./PaisleyCorner";
import FloralSprig from "./FloralSprig";
import HairlineDiamond from "./HairlineDiamond";
import PalmFrond from "./PalmFrond";
import RingMotif from "./RingMotif";
import HouseMotif from "./HouseMotif";
import BalloonMotif from "./BalloonMotif";
import { Heart } from "lucide-react";

/**
 * Decorative overlay for the hero section, distinct per template. Purely
 * ornamental (aria-hidden), absolutely positioned over the hero photo/
 * gradient so it never affects layout or text flow.
 *
 * When there's no cover photo yet (a fresh invitation before the couple
 * uploads their own pictures), each template gets extra scattered motifs so
 * the hero doesn't read as an empty gradient — built entirely from the same
 * self-authored SVGs already in the codebase, never a stock/fabricated
 * photo of "the couple", since no such photo exists.
 */
export default function HeroOrnaments({
  templateId,
  hasPhoto,
}: {
  templateId: string;
  hasPhoto: boolean;
}) {
  if (templateId === "traditional-gold") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]">
          <MandalaMotif color="#ffffff" size={hasPhoto ? 380 : 460} opacity={hasPhoto ? 0.12 : 0.18} />
        </div>
        <PaisleyCorner
          color="#ffffff"
          size={56}
          className="absolute top-5 left-5 opacity-60 sm:top-8 sm:left-8"
        />
        <PaisleyCorner
          color="#ffffff"
          size={56}
          className="absolute top-5 right-5 rotate-90 opacity-60 sm:top-8 sm:right-8"
        />
        {!hasPhoto && (
          <>
            <MandalaMotif
              color="#ffffff"
              size={130}
              opacity={0.14}
              className="absolute top-28 -right-6"
            />
            <MandalaMotif
              color="#ffffff"
              size={110}
              opacity={0.12}
              className="absolute bottom-24 -left-6"
            />
          </>
        )}
      </div>
    );
  }

  if (templateId === "floral-pastel") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloralSprig
          color="#ffffff"
          size={72}
          className="absolute bottom-4 left-3 opacity-70 sm:bottom-8 sm:left-6"
        />
        <FloralSprig
          color="#ffffff"
          size={72}
          flip
          className="absolute right-3 bottom-4 opacity-70 sm:right-6 sm:bottom-8"
        />
        {!hasPhoto && (
          <>
            <FloralSprig
              color="#ffffff"
              size={56}
              className="absolute top-10 left-4 rotate-[130deg] opacity-40 sm:left-10"
            />
            <FloralSprig
              color="#ffffff"
              size={56}
              flip
              className="absolute top-16 right-4 rotate-[130deg] opacity-40 sm:right-10"
            />
            <FloralSprig
              color="#ffffff"
              size={100}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 opacity-20"
            />
          </>
        )}
      </div>
    );
  }

  if (templateId === "elegant-bw") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <HairlineDiamond
          color="#ffffff"
          size={22}
          className="absolute top-6 left-6 opacity-70 sm:top-10 sm:left-10"
        />
        <HairlineDiamond
          color="#ffffff"
          size={22}
          className="absolute top-6 right-6 opacity-70 sm:top-10 sm:right-10"
        />
        {!hasPhoto && (
          <>
            <HairlineDiamond
              color="#ffffff"
              size={14}
              className="absolute bottom-32 left-10 opacity-40"
            />
            <HairlineDiamond
              color="#ffffff"
              size={14}
              className="absolute right-10 bottom-40 opacity-40"
            />
            <HairlineDiamond
              color="#ffffff"
              size={46}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
            />
          </>
        )}
      </div>
    );
  }

  if (templateId === "beach-boho") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <PalmFrond
          color="#ffffff"
          size={90}
          className="absolute -bottom-2 -left-2 opacity-50 sm:bottom-0 sm:left-2"
        />
        <PalmFrond
          color="#ffffff"
          size={90}
          className="absolute -right-2 -bottom-2 scale-x-[-1] opacity-50 sm:right-2 sm:bottom-0"
        />
        {!hasPhoto && (
          <>
            {/* Reused as a sunburst — the same radial petal shape reads as
                a sun over a beach gradient just as well as a temple motif. */}
            <MandalaMotif
              color="#ffffff"
              size={220}
              opacity={0.16}
              className="absolute top-16 left-1/2 -translate-x-1/2"
            />
            <PalmFrond
              color="#ffffff"
              size={60}
              className="absolute top-10 -left-4 opacity-25"
            />
          </>
        )}
      </div>
    );
  }

  if (templateId === "anniversary-emerald") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]">
          <MandalaMotif color="#ffffff" size={hasPhoto ? 340 : 420} opacity={hasPhoto ? 0.12 : 0.18} />
        </div>
        <HairlineDiamond
          color="#ffffff"
          size={20}
          className="absolute top-6 left-6 opacity-60 sm:top-10 sm:left-10"
        />
        <HairlineDiamond
          color="#ffffff"
          size={20}
          className="absolute top-6 right-6 opacity-60 sm:top-10 sm:right-10"
        />
      </div>
    );
  }

  if (templateId === "valentine-blush") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Heart
          size={hasPhoto ? 200 : 260}
          fill="#ffffff"
          color="#ffffff"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] opacity-10"
        />
        <FloralSprig
          color="#ffffff"
          size={64}
          className="absolute bottom-4 left-3 opacity-60 sm:bottom-8 sm:left-6"
        />
        <FloralSprig
          color="#ffffff"
          size={64}
          flip
          className="absolute right-3 bottom-4 opacity-60 sm:right-6 sm:bottom-8"
        />
      </div>
    );
  }

  if (templateId === "proposal-starlit") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <RingMotif
          color="#ffffff"
          size={hasPhoto ? 110 : 150}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%] opacity-25"
        />
        <RingMotif
          color="#ffffff"
          size={40}
          className="absolute top-8 left-6 opacity-30 sm:top-12 sm:left-10"
        />
        <RingMotif
          color="#ffffff"
          size={40}
          className="absolute top-8 right-6 opacity-30 sm:top-12 sm:right-10"
        />
      </div>
    );
  }

  if (templateId === "birthday-confetti") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <BalloonMotif
          color="#ffffff"
          size={70}
          className="absolute top-6 left-4 opacity-50 sm:top-10 sm:left-10"
        />
        <BalloonMotif
          color="#ffffff"
          size={70}
          className="absolute top-6 right-4 -scale-x-100 opacity-50 sm:top-10 sm:right-10"
        />
      </div>
    );
  }

  if (templateId === "housewarming-terracotta") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <HouseMotif
          color="#ffffff"
          size={hasPhoto ? 90 : 130}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] opacity-20"
        />
        <FloralSprig
          color="#ffffff"
          size={60}
          className="absolute bottom-4 left-3 opacity-55 sm:bottom-8 sm:left-6"
        />
        <FloralSprig
          color="#ffffff"
          size={60}
          flip
          className="absolute right-3 bottom-4 opacity-55 sm:right-6 sm:bottom-8"
        />
      </div>
    );
  }

  // minimal-modern: a single hairline corner bracket, kept deliberately
  // spare regardless of whether a photo is set — restraint is the point.
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-6 left-6 h-6 w-6 border-t border-l border-white/40 sm:top-10 sm:left-10" />
      <div className="absolute right-6 bottom-6 h-6 w-6 border-r border-b border-white/40 sm:right-10 sm:bottom-10" />
    </div>
  );
}

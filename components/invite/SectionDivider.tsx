import MandalaMotif from "./decor/MandalaMotif";
import FloralSprig from "./decor/FloralSprig";
import HairlineDiamond from "./decor/HairlineDiamond";
import WaveLine from "./decor/WaveLine";
import RingMotif from "./decor/RingMotif";
import HouseMotif from "./decor/HouseMotif";
import BalloonMotif from "./decor/BalloonMotif";
import { Heart } from "lucide-react";

export default function SectionDivider({
  templateId,
  accent,
}: {
  templateId: string;
  accent: string;
}) {
  if (templateId === "traditional-gold") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-10 sm:w-16" style={{ backgroundColor: accent }} />
        <MandalaMotif color={accent} size={28} opacity={0.9} />
        <span className="h-px w-10 sm:w-16" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (templateId === "floral-pastel") {
    return (
      <div className="flex items-center justify-center gap-2 py-1" aria-hidden>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
        <FloralSprig color={accent} size={30} />
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
      </div>
    );
  }

  if (templateId === "elegant-bw") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-16" style={{ backgroundColor: accent }} />
        <HairlineDiamond color={accent} size={16} />
        <span className="h-px w-16" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (templateId === "beach-boho") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <WaveLine color={accent} width={56} />
      </div>
    );
  }

  if (templateId === "anniversary-emerald") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-10 sm:w-16" style={{ backgroundColor: accent }} />
        <MandalaMotif color={accent} size={26} opacity={0.9} />
        <span className="h-px w-10 sm:w-16" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (templateId === "valentine-blush") {
    return (
      <div className="flex items-center justify-center gap-2 py-1" aria-hidden>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
        <Heart size={18} fill={accent} color={accent} />
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
      </div>
    );
  }

  if (templateId === "proposal-starlit") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-14" style={{ backgroundColor: accent, opacity: 0.5 }} />
        <RingMotif color={accent} size={24} />
        <span className="h-px w-14" style={{ backgroundColor: accent, opacity: 0.5 }} />
      </div>
    );
  }

  if (templateId === "birthday-confetti") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <BalloonMotif color={accent} size={32} />
      </div>
    );
  }

  if (templateId === "housewarming-terracotta") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.4 }} />
        <HouseMotif color={accent} size={26} />
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.4 }} />
      </div>
    );
  }

  // minimal-modern and fallback: stays deliberately spare.
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <span
        className="h-px w-14"
        style={{ backgroundColor: accent, opacity: 0.5 }}
      />
    </div>
  );
}

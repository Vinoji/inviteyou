import MandalaMotif from "./decor/MandalaMotif";
import FloralSprig from "./decor/FloralSprig";
import HairlineDiamond from "./decor/HairlineDiamond";
import WaveLine from "./decor/WaveLine";
import RingMotif from "./decor/RingMotif";
import HouseMotif from "./decor/HouseMotif";
import BalloonMotif from "./decor/BalloonMotif";
import RotateReveal from "./RotateReveal";
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
        <RotateReveal><MandalaMotif color={accent} size={28} opacity={0.9} /></RotateReveal>
        <span className="h-px w-10 sm:w-16" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (templateId === "floral-pastel") {
    return (
      <div className="flex items-center justify-center gap-2 py-1" aria-hidden>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
        <RotateReveal fromRotate={-40} fromScale={0.4}><FloralSprig color={accent} size={30} /></RotateReveal>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
      </div>
    );
  }

  if (templateId === "elegant-bw") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-16" style={{ backgroundColor: accent }} />
        <RotateReveal fromRotate={45} fromScale={0.5}><HairlineDiamond color={accent} size={16} /></RotateReveal>
        <span className="h-px w-16" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (templateId === "beach-boho") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <RotateReveal fromRotate={0} fromScale={0.3}><WaveLine color={accent} width={56} /></RotateReveal>
      </div>
    );
  }

  if (templateId === "anniversary-emerald") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-10 sm:w-16" style={{ backgroundColor: accent }} />
        <RotateReveal><MandalaMotif color={accent} size={26} opacity={0.9} /></RotateReveal>
        <span className="h-px w-10 sm:w-16" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (templateId === "valentine-blush") {
    return (
      <div className="flex items-center justify-center gap-2 py-1" aria-hidden>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
        <RotateReveal fromRotate={-30} fromScale={0.3}><Heart size={18} fill={accent} color={accent} /></RotateReveal>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.35 }} />
      </div>
    );
  }

  if (templateId === "proposal-starlit") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-14" style={{ backgroundColor: accent, opacity: 0.5 }} />
        <RotateReveal fromRotate={-90} fromScale={0.5}><RingMotif color={accent} size={24} /></RotateReveal>
        <span className="h-px w-14" style={{ backgroundColor: accent, opacity: 0.5 }} />
      </div>
    );
  }

  if (templateId === "birthday-confetti") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <RotateReveal fromRotate={-15} fromScale={0.5}><BalloonMotif color={accent} size={32} /></RotateReveal>
      </div>
    );
  }

  if (templateId === "housewarming-terracotta") {
    return (
      <div className="flex items-center justify-center gap-3 py-1" aria-hidden>
        <span className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.4 }} />
        <RotateReveal fromRotate={20} fromScale={0.5}><HouseMotif color={accent} size={26} /></RotateReveal>
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

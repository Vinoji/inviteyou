import MandalaMotif from "./decor/MandalaMotif";
import FloralSprig from "./decor/FloralSprig";
import HairlineDiamond from "./decor/HairlineDiamond";
import WaveLine from "./decor/WaveLine";

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

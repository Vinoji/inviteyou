import { getFontPairing } from "@/lib/fontPairings";
import SectionDivider from "./SectionDivider";
import RotateReveal from "./RotateReveal";
import FloralSprig from "./decor/FloralSprig";

const FLORAL_TEMPLATES = new Set(["floral-pastel", "valentine-blush"]);

export default function Story({
  story,
  accentColor,
  fontPairing,
  templateId,
  title = "Our Story",
}: {
  story: string;
  accentColor: string;
  fontPairing: string;
  templateId: string;
  title?: string;
}) {
  if (!story) return null;
  const font = getFontPairing(fontPairing);

  const floral = FLORAL_TEMPLATES.has(templateId);

  return (
    <section className="relative mx-auto max-w-2xl px-6 py-14 text-center sm:py-20">
      {floral && (
        <>
          <RotateReveal
            fromRotate={-30}
            fromScale={0.4}
            className="pointer-events-none absolute top-0 left-0 hidden opacity-70 sm:block"
          >
            <FloralSprig color={accentColor} size={48} />
          </RotateReveal>
          <RotateReveal
            fromRotate={30}
            fromScale={0.4}
            delay={0.15}
            className="pointer-events-none absolute top-0 right-0 hidden opacity-70 sm:block"
          >
            <FloralSprig color={accentColor} size={48} flip />
          </RotateReveal>
        </>
      )}
      <h2
        className="text-sm font-semibold tracking-[0.3em] uppercase"
        style={{ color: accentColor }}
      >
        {title}
      </h2>
      <div className="mt-3">
        <SectionDivider templateId={templateId} accent={accentColor} />
      </div>
      <p
        className="mt-6 text-lg leading-relaxed whitespace-pre-line text-neutral-700 sm:text-xl"
        style={{ fontFamily: font.bodyVar }}
      >
        {story}
      </p>
    </section>
  );
}

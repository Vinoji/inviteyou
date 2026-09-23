import { getFontPairing } from "@/lib/fontPairings";
import SectionDivider from "./SectionDivider";

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

  return (
    <section className="mx-auto max-w-2xl px-6 py-14 text-center sm:py-20">
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

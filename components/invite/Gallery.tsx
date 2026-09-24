import { useTranslations } from "next-intl";
import SectionDivider from "./SectionDivider";
import Carousel from "./Carousel";
import ZoomReveal from "./ZoomReveal";

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
  const t = useTranslations("invite.gallery");
  // Skip the first photo — it's already shown as the hero background.
  const carouselPhotos = photos.slice(1);
  if (carouselPhotos.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
      <div className="text-center">
        <h2
          className="text-sm font-semibold tracking-[0.3em] uppercase"
          style={{ color: accentColor }}
        >
          {t("heading")}
        </h2>
        <div className="mt-3">
          <SectionDivider templateId={templateId} accent={accentColor} />
        </div>
      </div>
      <ZoomReveal className="mt-8">
        <Carousel
          images={carouselPhotos}
          altPrefix={t("altPrefix", { coupleLabel })}
          accentColor={accentColor}
        />
      </ZoomReveal>
    </section>
  );
}

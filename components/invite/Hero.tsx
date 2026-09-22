import { Heart } from "lucide-react";
import { getFontPairing } from "@/lib/fontPairings";
import { getThemeClasses } from "./theme";
import Countdown from "./Countdown";
import HeroOrnaments from "./decor/HeroOrnaments";
import ParticlesLoader from "./decor/ParticlesLoader";
import type { ParticleVariant } from "./decor/Particles";

// Only templates whose whole identity isn't "restraint" get ambient
// particles — minimal-modern and elegant-bw stay particle-free on purpose.
function particleVariant(templateId: string): ParticleVariant | null {
  if (templateId === "traditional-gold") return "specks";
  if (templateId === "floral-pastel") return "petals";
  if (templateId === "beach-boho") return "bubbles";
  return null;
}

export default function Hero({
  groomName,
  brideName,
  weddingDate,
  accentColor,
  fontPairing,
  templateId,
  coverPhoto,
}: {
  groomName: string;
  brideName: string;
  weddingDate: string;
  accentColor: string;
  fontPairing: string;
  templateId: string;
  coverPhoto?: string;
}) {
  const font = getFontPairing(fontPairing);
  const theme = getThemeClasses(templateId);
  const variant = particleVariant(templateId);
  const dateLabel = weddingDate
    ? new Date(weddingDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date to be announced";

  return (
    <section className="relative flex min-h-[85vh] w-full items-end overflow-hidden sm:min-h-[90vh]">
      {coverPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverPhoto}
          alt={`${brideName} & ${groomName}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${accentColor}33, ${accentColor}11)`,
          }}
        />
      )}
      <div className={`absolute inset-0 ${theme.heroOverlay}`} />
      <HeroOrnaments templateId={templateId} hasPhoto={Boolean(coverPhoto)} />
      {variant && <ParticlesLoader variant={variant} accentColor={accentColor} />}

      <div className="relative z-10 w-full px-6 pb-12 text-center text-white sm:pb-16">
        <p className="flex animate-fade-in items-center justify-center gap-2 text-xs font-semibold tracking-[0.35em] uppercase opacity-90">
          <Heart size={12} fill="currentColor" aria-hidden />
          We&apos;re getting married
        </p>
        <h1
          className="mt-4 text-4xl leading-tight font-bold text-balance sm:text-6xl animate-fade-in"
          style={{ fontFamily: font.headingVar, animationDelay: "0.1s" }}
        >
          {brideName || "Bride"}
          <span className="mx-3 inline-block opacity-80" style={{ color: accentColor }}>
            &amp;
          </span>
          {groomName || "Groom"}
        </h1>
        <p
          className="mt-4 text-base font-medium opacity-95 sm:text-lg animate-fade-in"
          style={{ fontFamily: font.bodyVar, animationDelay: "0.15s" }}
        >
          {dateLabel}
        </p>

        {weddingDate && (
          <div className="mt-8 flex justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Countdown targetDate={weddingDate} />
          </div>
        )}
      </div>
    </section>
  );
}

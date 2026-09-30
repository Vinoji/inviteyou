import type { CSSProperties, ReactNode } from "react";
import manifest from "@/lib/artManifest.generated.json";

const ART = manifest as Record<string, string[]>;

/** The file for a template's art slot (`public/art/<templateId>/<slot>.<ext>`), if it exists. */
export function artSrc(templateId: string, slot: string): string | null {
  const file = ART[templateId]?.find((f) => f.slice(0, f.lastIndexOf(".")) === slot);
  return file ? `/art/${templateId}/${file}` : null;
}

/**
 * One painted/photographic art slot of a premium template. Shows the image
 * from public/art when it has been added (see docs/template-art.md for each
 * slot's prompt and size), else the drawn fallback — so a template works
 * before its art exists and upgrades the moment it lands.
 */
export default function ArtImage({
  templateId,
  slot,
  alt = "",
  className,
  style,
  priority,
  fallback = null,
}: {
  templateId: string;
  slot: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  fallback?: ReactNode;
}) {
  const src = artSrc(templateId, slot);
  if (!src) return <>{fallback}</>;
  return (
    // Art files are pre-sized WebP; next/image would add nothing but a loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}

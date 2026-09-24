"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getFontPairing } from "@/lib/fontPairings";
import SectionDivider from "./SectionDivider";
import Carousel from "./Carousel";
import ZoomReveal from "./ZoomReveal";
import type { GuestPhoto } from "@/lib/types";

export default function GuestGallery({
  slug,
  photos,
  accentColor,
  fontPairing,
  templateId,
  mode,
}: {
  slug: string;
  photos: GuestPhoto[];
  accentColor: string;
  fontPairing: string;
  templateId: string;
  mode: "preview" | "public";
}) {
  const t = useTranslations("invite.guestGallery");
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const font = getFontPairing(fontPairing);

  async function handleFile(file: File | null) {
    if (!file || mode === "preview") return;
    if (!name.trim()) {
      setError(t("errName"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError(t("errImageFile"));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(t("errImageSize"));
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const storageRef = ref(storage, `invitations/${slug}/guest-photos/${id}.jpg`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);

      const res = await fetch(`/api/guest-photos/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploaderName: name.trim(), url }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? t("errUploadFailed"));
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errUploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
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
        <p
          className="mx-auto mt-4 max-w-md text-sm text-neutral-500"
          style={{ fontFamily: font.bodyVar }}
        >
          {t("subheading")}
        </p>
      </div>

      {photos.length > 0 && (
        <ZoomReveal className="mt-8">
          <Carousel
            images={photos.map((p) => p.url)}
            altPrefix={t("guestPhotoAlt")}
            accentColor={accentColor}
            captions={photos.map((p) => (p.uploaderName ? t("sharedBy", { name: p.uploaderName }) : undefined))}
          />
        </ZoomReveal>
      )}

      <div className="mx-auto mt-8 max-w-sm">
        {done ? (
          <p className="text-center text-sm font-semibold" style={{ color: accentColor }}>
            {t("thanks")}
          </p>
        ) : (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              disabled={mode === "preview"}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500 hover:border-neutral-400 ${
                mode === "preview" ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <Upload size={15} aria-hidden />
              {uploading ? t("uploading") : t("addPhoto")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading || mode === "preview"}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {error && <p className="text-center text-xs text-red-600">{error}</p>}
            {mode === "preview" && (
              <p className="text-center text-xs text-neutral-400">
                {t("disabledPreview")}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

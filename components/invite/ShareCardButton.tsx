"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/share";

/**
 * Shares the invitation card image together with the invitation message.
 *
 * Phones: the system share sheet (Web Share with a file) — pick WhatsApp
 * and the card goes as an image with the message as its caption. The
 * image is fetched ahead of time because the share must start straight
 * from the tap. The message is also copied, since some WhatsApp versions
 * (notably iOS) keep only the image.
 *
 * Elsewhere (desktop browsers can't hand files to WhatsApp): the card is
 * downloaded and WhatsApp opens with the message, ready to attach it.
 */
export default function ShareCardButton({
  imageUrl,
  fileName,
  text,
  label,
  hint,
  preparing,
  phone,
  className,
}: {
  imageUrl: string;
  fileName: string;
  text: string;
  label: string;
  /** Shown after sharing, e.g. "Message copied — paste it if WhatsApp drops it". */
  hint?: string;
  /** Label while the card is still downloading, e.g. "Preparing card…". */
  preparing?: string;
  /** Guest's number — used where WhatsApp opens directly (not the share
   * sheet, which can't pre-pick a contact). */
  phone?: string;
  className?: string;
}) {
  const fileRef = useRef<File | null>(null);
  const [shared, setShared] = useState(false);
  // A tap before the card has arrived would miss the share sheet, so the
  // button waits for it (or for the download to fail).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(imageUrl)
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (!cancelled && blob) fileRef.current = new File([blob], fileName, { type: blob.type || "image/png" });
      })
      .catch(() => {})
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [imageUrl, fileName]);

  function download() {
    const a = document.createElement("a");
    const file = fileRef.current;
    a.href = file ? URL.createObjectURL(file) : `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}download=1`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function share() {
    // Not awaited: the share sheet must open from the tap itself.
    navigator.clipboard?.writeText(text).catch(() => {});
    const file = fileRef.current;
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (file && nav.share && nav.canShare?.({ files: [file] })) {
      nav
        .share({ files: [file], text })
        .then(() => setShared(true))
        .catch(() => {
          // Cancelled — nothing to do.
        });
      return;
    }
    download();
    window.open(whatsappUrl(text, phone), "_blank", "noopener,noreferrer");
    setShared(true);
  }

  return (
    <div className="flex flex-col items-stretch gap-1">
      <button type="button" onClick={share} disabled={!ready && Boolean(preparing)} className={`${className ?? ""} disabled:opacity-70`}>
        {!ready && preparing ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <MessageCircle size={15} aria-hidden />}
        {!ready && preparing ? preparing : label}
      </button>
      {shared && hint && <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
    </div>
  );
}

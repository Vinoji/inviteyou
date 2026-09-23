"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import QRCodeBox from "./QRCodeBox";

export default function ShareBox({
  slug,
  occasionTitle,
  accentColor,
}: {
  slug: string;
  /** Fully formatted, e.g. "Priya & Arjun's Wedding" or "Zara's Birthday". */
  occasionTitle: string;
  accentColor: string;
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${slug}`
      : `/invite/${slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — no-op,
      // the link text is still selectable manually.
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: occasionTitle,
          text: `You're invited! ${occasionTitle}:`,
          url,
        });
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
    } else {
      copyLink();
    }
  }

  return (
    <section className="mx-auto max-w-lg px-6 py-14 sm:py-20">
      <div className="rounded-2xl border border-neutral-200 p-6 text-center sm:p-8">
        <h3 className="font-serif text-lg font-bold text-neutral-900">
          Share this invitation
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Send this link to your guests, or let them scan the QR code.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
          <input
            readOnly
            value={url}
            className="flex-1 truncate bg-transparent px-2 text-sm text-neutral-700 outline-none"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={copyLink}
            style={{ backgroundColor: accentColor }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <button
          onClick={shareLink}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 sm:hidden"
        >
          <Share2 size={15} />
          Share via...
        </button>

        <div className="mt-6 flex justify-center">
          <QRCodeBox url={url} fileName={`${slug}-qr.png`} accentColor={accentColor} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/share";

/** Splits a message into text and links (the capture keeps the links). */
const LINK = /(https?:\/\/\S+)/;
const BOLD = /\*([^*\n]+)\*/;

/**
 * Sharing an invitation on WhatsApp: the message with its link (WhatsApp
 * shows the invitation's own preview card under it). A preview shaped
 * like a WhatsApp bubble shows exactly what the guest will get.
 */
export default function WhatsAppShare({
  text,
  phone,
  className = "",
}: {
  /** The full message, link included. */
  text: string;
  /** Guest's number, when sending to one person. */
  phone?: string;
  className?: string;
}) {
  const t = useTranslations("invite.share");
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const long = lines.length > 7;
  const shown = expanded || !long ? text : `${lines.slice(0, 6).join("\n")}\n…`;

  const sendClass =
    "inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-[#08331a] hover:brightness-95";

  return (
    <div className={`space-y-3 text-left ${className}`}>
      {/* What the guest receives, drawn like a WhatsApp message. */}
      <div className="rounded-xl bg-[#e7ded3] p-3 [background-image:radial-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:14px_14px]">
        <p className="mb-2 text-center text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
          {t("previewLabel")}
        </p>
        <div className="ml-auto max-w-[88%] rounded-lg rounded-tr-none bg-[#d9fdd3] p-1 shadow-sm">
          <p className="px-2 pt-1.5 pb-1 text-[13px] leading-snug break-words whitespace-pre-line text-neutral-800">
            {shown.split(LINK).map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className="text-[#027eb5] underline">
                  {part}
                </span>
              ) : (
                // WhatsApp shows *text* in bold.
                part.split(BOLD).map((bit, j) => (j % 2 === 1 ? <strong key={`${i}-${j}`}>{bit}</strong> : bit))
              )
            )}
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="px-2 pb-1 text-xs font-semibold text-[#027eb5]"
            >
              {expanded ? t("showLess") : t("readMore")}
            </button>
          )}
        </div>
      </div>

      <a href={whatsappUrl(text, phone)} target="_blank" rel="noopener noreferrer" className={sendClass}>
        <MessageCircle size={15} aria-hidden />
        {t("sendText")}
      </a>
    </div>
  );
}

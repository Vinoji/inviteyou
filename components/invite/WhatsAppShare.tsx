"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, MessageCircle, MessageSquareText } from "lucide-react";
import { whatsappUrl } from "@/lib/share";
import ShareCardButton from "./ShareCardButton";

/** Splits a message into text and links (the capture keeps the links). */
const LINK = /(https?:\/\/\S+)/;
const BOLD = /\*([^*\n]+)\*/;

/**
 * Sharing an invitation on WhatsApp, two ways: the invitation card image
 * with the message (and link) as its caption, or the message alone. A
 * preview shaped like a WhatsApp bubble shows exactly what the guest will
 * get — card on top, words and link underneath.
 */
export default function WhatsAppShare({
  slug,
  text,
  phone,
  className = "",
}: {
  slug: string;
  /** The full message, link included. */
  text: string;
  /** Guest's number, when sending to one person. */
  phone?: string;
  className?: string;
}) {
  const t = useTranslations("invite.share");
  const [withCard, setWithCard] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const long = lines.length > 7;
  const shown = expanded || !long ? text : `${lines.slice(0, 6).join("\n")}\n…`;

  const tab = (on: boolean) =>
    `inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
      on ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
    }`;
  const sendClass =
    "inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-[#08331a] hover:brightness-95";

  return (
    <div className={`space-y-3 text-left ${className}`}>
      <div className="flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5" role="radiogroup" aria-label={t("formatLabel")}>
        <button type="button" role="radio" aria-checked={withCard} onClick={() => setWithCard(true)} className={tab(withCard)}>
          <ImageIcon size={14} aria-hidden />
          {t("withCard")}
        </button>
        <button type="button" role="radio" aria-checked={!withCard} onClick={() => setWithCard(false)} className={tab(!withCard)}>
          <MessageSquareText size={14} aria-hidden />
          {t("textOnly")}
        </button>
      </div>

      {/* What the guest receives, drawn like a WhatsApp message. */}
      <div className="rounded-xl bg-[#e7ded3] p-3 [background-image:radial-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:14px_14px]">
        <p className="mb-2 text-center text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
          {t("previewLabel")}
        </p>
        <div className="ml-auto max-w-[88%] rounded-lg rounded-tr-none bg-[#d9fdd3] p-1 shadow-sm">
          {withCard && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/invite/${slug}/card/image?w=600`}
              alt={t("cardAlt")}
              className="block max-h-56 w-full rounded-md bg-white object-cover object-top"
            />
          )}
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

      {withCard ? (
        <>
          <ShareCardButton
            imageUrl={`/invite/${slug}/card/image?w=1200`}
            fileName={`${slug}-invitation-card.png`}
            text={text}
            phone={phone}
            label={t("sendWithCard")}
            preparing={t("preparingCard")}
            hint={t("sharedHint")}
            className={sendClass}
          />
          <p className="text-center text-[11px] text-neutral-500">{phone ? t("cardHintPhone") : t("cardHint")}</p>
        </>
      ) : (
        <a href={whatsappUrl(text, phone)} target="_blank" rel="noopener noreferrer" className={sendClass}>
          <MessageCircle size={15} aria-hidden />
          {t("sendText")}
        </a>
      )}
    </div>
  );
}

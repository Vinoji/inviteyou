"use client";

import { useState } from "react";
import { useOrigin } from "@/lib/useOrigin";
import festive from "@/components/landing/landing.module.css";
import ShareCardButton from "@/components/invite/ShareCardButton";
import { useTranslations } from "next-intl";
import { Check, Copy, Download, ExternalLink, MessageCircle, Printer } from "lucide-react";
import {
  MAX_GUEST_GREETING,
  NAME_TOKEN,
  URL_TOKEN,
  personalInviteUrl,
  waPhone,
  whatsappUrl,
} from "@/lib/share";


export interface HostMessages {
  /** General invite message ("You're invited to …"), has URL_TOKEN. */
  share: string;
  /** Personal invite, has NAME_TOKEN and URL_TOKEN. */
  personal: string;
  /** Reminder, has NAME_TOKEN and URL_TOKEN. */
  reminder: string;
  /** Name used in the reminder preview ("there" / "நண்பரே"). */
  guestFallback: string;
}

function fill(template: string, url: string, name = "") {
  return template.split(URL_TOKEN).join(url).split(NAME_TOKEN).join(name);
}



function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      // Clipboard unavailable — the text is still visible to select by hand.
    }
  }
  return { copied, copy };
}

const card = `p-4 ${festive.festiveCard}`;
const input =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50";
const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800";
const waBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25d366] px-3 py-2 text-sm font-semibold text-[#08331a] hover:brightness-95";

/** Share, personal links and the reminder message, above the guest list. */
export default function HostTools({ slug, messages }: { slug: string; messages: HostMessages }) {
  const t = useTranslations("rsvpsPage");
  const origin = useOrigin();
  const { copied, copy } = useCopy();
  const [guest, setGuest] = useState("");
  const [phone, setPhone] = useState("");
  const inviteUrl = origin ? `${origin}/invite/${slug}` : `/invite/${slug}`;
  const personalUrl = origin && guest.trim() ? personalInviteUrl(inviteUrl, guest) : inviteUrl;
  const reminderPreview = fill(messages.reminder, inviteUrl, messages.guestFallback);
  const phoneOk = !phone.trim() || Boolean(waPhone(phone));

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
        {t("toolsTitle")}
      </h2>

      {/* The invitation card — shared on WhatsApp as an image with the message. */}
      <div className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/invite/${slug}/card/image?w=600`}
          alt={t("cardAlt")}
          className="mx-auto w-40 shrink-0 rounded-md shadow-lg sm:mx-0"
        />
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{t("cardTitle")}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("cardHint")}</p>
          <ShareCardButton
            imageUrl={`/invite/${slug}/card/image?w=1200`}
            fileName={`${slug}-invitation-card.png`}
            text={fill(messages.share, inviteUrl)}
            label={t("shareCard")}
            hint={t("sharedHint")}
            className={`${waBtn} w-full`}
          />
          <div className="flex gap-2">
            <a href={`/invite/${slug}/card/image?w=1748&download=1`} className={`${ghostBtn} flex-1`}>
              <Download size={15} aria-hidden />
              {t("downloadCard")}
            </a>
            <a href={`/invite/${slug}/card`} className={`${ghostBtn} flex-1`}>
              <Printer size={15} aria-hidden />
              {t("printCard")}
            </a>
          </div>
        </div>
      </div>

      <a href={`/invite/${slug}`} className={`${ghostBtn} w-full`}>
        <ExternalLink size={15} aria-hidden />
        {t("openInvite")}
      </a>

      <div className={card}>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{t("personalTitle")}</h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t("personalHint")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700 dark:text-neutral-300">
              {t("guestNameLabel")}
            </span>
            <input
              className={input}
              value={guest}
              maxLength={MAX_GUEST_GREETING}
              onChange={(e) => setGuest(e.target.value)}
              placeholder={t("guestNamePlaceholder")}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700 dark:text-neutral-300">
              {t("phoneLabel")}
            </span>
            <input
              className={`${input} ${phoneOk ? "" : "border-red-400 dark:border-red-500"}`}
              type="tel"
              inputMode="tel"
              value={phone}
              maxLength={24}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePlaceholder")}
              aria-invalid={!phoneOk}
            />
          </label>
        </div>
        {guest.trim() && (
          <p className="mt-3 truncate rounded-lg bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            {personalUrl}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <a
            href={
              guest.trim() && phoneOk
                ? whatsappUrl(fill(messages.personal, personalUrl, guest.trim()), phone)
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!guest.trim() || !phoneOk}
            className={`${waBtn} flex-1 ${guest.trim() && phoneOk ? "" : "pointer-events-none opacity-50"}`}
          >
            <MessageCircle size={15} aria-hidden />
            {t("sendWhatsapp")}
          </a>
          <button
            type="button"
            disabled={!guest.trim()}
            onClick={() => copy("personal", personalUrl)}
            className={`${ghostBtn} flex-1 disabled:opacity-50`}
          >
            {copied === "personal" ? <Check size={15} /> : <Copy size={15} />}
            {copied === "personal" ? t("copied") : t("copyLink")}
          </button>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{t("remindersTitle")}</h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t("remindersHint")}</p>
        <p className="mt-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
          {t("reminderPreview")}
        </p>
        <p className="mt-1 rounded-lg bg-neutral-50 px-3 py-2 text-sm whitespace-pre-line text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          {reminderPreview}
        </p>
        <button
          type="button"
          onClick={() => copy("reminder", reminderPreview)}
          className={`${ghostBtn} mt-3`}
        >
          {copied === "reminder" ? <Check size={15} /> : <Copy size={15} />}
          {copied === "reminder" ? t("copied") : t("copyMessage")}
        </button>
      </div>
    </div>
  );
}

/** Per-guest reminder in the guest list: opens WhatsApp to their number. */
export function RemindButton({
  slug,
  name,
  phone,
  template,
}: {
  slug: string;
  name: string;
  phone: string;
  template: string;
}) {
  const t = useTranslations("rsvpsPage");
  const origin = useOrigin();
  const url = `${origin}/invite/${slug}`;
  return (
    <a
      href={whatsappUrl(fill(template, url, name), phone)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366] px-3 py-1 text-xs font-semibold text-[#08331a] hover:brightness-95"
    >
      <MessageCircle size={13} aria-hidden />
      {t("remind")}
    </a>
  );
}

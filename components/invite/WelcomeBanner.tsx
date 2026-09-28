"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Copy, MessageCircle, MessageSquare, PartyPopper, Users, X } from "lucide-react";
import { whatsappUrl, waPhone } from "@/lib/share";

/** sessionStorage key the editor leaves the buyer's number under, just
 * before redirecting here — so it never travels in the URL. */
export const OWNER_PHONE_KEY = "inviteyou:owner-phone";

/**
 * The owner's edit-link popup: opened right after a successful purchase,
 * and again from the Host tools bar (OwnerAccess). The edit link
 * (with its token) is only ever handed to the browser here, via the
 * one-time post-payment redirect, and by message to the buyer's own phone.
 * If the server couldn't send that message, the buttons below let the
 * buyer send it to themselves.
 */
export default function WelcomeBanner({
  slug,
  templateId,
  editToken,
  accentColor,
  sent,
  onClose,
}: {
  slug: string;
  templateId: string;
  editToken: string;
  accentColor: string;
  /** Channel the server sent the link by, if any. */
  sent: "whatsapp" | "sms" | null;
  onClose: () => void;
}) {
  const t = useTranslations("invite.welcomeBanner");
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState("");
  const [editUrl, setEditUrl] = useState(`/create/${templateId}?edit=${slug}&token=${editToken}`);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Absolute link and the buyer's number are only known in the browser.
  useEffect(() => {
    const id = setTimeout(() => {
      setEditUrl(`${window.location.origin}/create/${templateId}?edit=${slug}&token=${editToken}`);
      try {
        setPhone(sessionStorage.getItem(OWNER_PHONE_KEY) ?? "");
      } catch {
        // No sessionStorage — the send buttons just open without a number.
      }
      closeRef.current?.focus();
    }, 0);
    return () => clearTimeout(id);
  }, [slug, templateId, editToken]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const message = t("selfMessage", { editUrl });
  const digits = waPhone(phone);

  async function copyEditLink() {
    try {
      await navigator.clipboard.writeText(editUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore — the link is visible and selectable in the box.
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          aria-label={t("dismiss")}
        >
          <X size={18} />
        </button>

        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accentColor }}
        >
          <PartyPopper size={20} aria-hidden />
        </span>
        <h2 id="welcome-title" className="mt-4 font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t("body")}</p>

        {/* Wraps the button below the link when there's no room (e.g. Tamil). */}
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            readOnly
            value={editUrl}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={t("editLinkLabel")}
            className="min-w-[12rem] flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          />
          <button
            type="button"
            onClick={copyEditLink}
            style={{ backgroundColor: accentColor }}
            className="inline-flex grow items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white sm:grow-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t("copied") : t("copyEditLink")}
          </button>
        </div>

        <p
          className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-sm ${
            sent
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
          role="status"
        >
          {sent ? <Check size={16} className="mt-0.5 shrink-0" aria-hidden /> : null}
          {sent === "whatsapp" ? t("sentWhatsapp") : sent === "sms" ? t("sentSms") : t("notSent")}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={whatsappUrl(message, digits || undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white"
          >
            <MessageCircle size={14} aria-hidden />
            {t("sendWhatsapp")}
          </a>
          <a
            // "?&body=" works on both iOS and Android SMS apps.
            href={`sms:${digits ? `+${digits}` : ""}?&body=${encodeURIComponent(message)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2.5 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
          >
            <MessageSquare size={14} aria-hidden />
            {t("sendSms")}
          </a>
        </div>

        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">{t("expiryNote")}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            href={`/rsvps/${slug}?token=${editToken}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: accentColor }}
          >
            <Users size={15} aria-hidden />
            {t("viewRsvps")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            {t("done")}
          </button>
        </div>
      </div>
    </div>
  );
}

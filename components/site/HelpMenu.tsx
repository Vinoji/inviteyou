"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, LifeBuoy, Mail, MessageCircle, MessageSquare, Phone, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { SITE, formatPhone } from "@/lib/site";
import { supportMailUrl, supportSmsUrl, supportWhatsAppUrl, telUrl } from "@/lib/support";
import { isSitePage } from "./SiteHeader";

/**
 * "Need help?" — every way to reach us, one tap away: WhatsApp, call,
 * email, SMS, or the full support form. A floating button on the site's
 * own pages (`floating`), a small icon in the editor / guest-list toolbar
 * (`toolbar`). Never on a couple's invitation — guests aren't our
 * customers there.
 */
export default function HelpMenu({ variant = "floating" }: { variant?: "floating" | "toolbar" }) {
  const t = useTranslations("site.help");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "floating" && !isSitePage(pathname)) return null;

  const hello = t("hello", { brand: SITE.name });
  const item =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-800 transition hover:bg-amber-50 dark:text-neutral-100 dark:hover:bg-amber-950/40";
  const icon = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full";

  const panel = (
    <div
      role="dialog"
      aria-label={t("title")}
      className={`absolute z-[85] w-72 rounded-2xl border border-[#e8b04a]/40 bg-[#fffaf2] p-3 shadow-2xl shadow-black/25 motion-safe:animate-[settingsIn_.16s_ease-out] dark:bg-[#1c1220] ${
        variant === "floating" ? "right-0 bottom-full mb-3 origin-bottom-right" : "top-full right-0 mt-2 origin-top-right"
      }`}
    >
      <p className="px-3 pt-1 font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">{t("title")}</p>
      <p className="px-3 pb-2 text-xs text-neutral-500 dark:text-neutral-400">{t("subtitle")}</p>
      <a href={supportWhatsAppUrl(hello)} target="_blank" rel="noopener noreferrer" className={item}>
        <span className={`${icon} bg-[#25d366] text-white`}>
          <MessageCircle size={16} aria-hidden />
        </span>
        <span>
          <span className="block font-semibold">{t("whatsapp")}</span>
          <span className="block text-xs text-neutral-500">{formatPhone(SITE.contact.whatsapp)}</span>
        </span>
      </a>
      {SITE.contact.phones.map((p) => (
        <a key={p} href={telUrl(p)} className={item}>
          <span className={`${icon} bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300`}>
            <Phone size={15} aria-hidden />
          </span>
          <span>
            <span className="block font-semibold">{t("call")}</span>
            <span className="block text-xs text-neutral-500">{formatPhone(p)}</span>
          </span>
        </a>
      ))}
      <a href={supportMailUrl(t("mailSubject", { brand: SITE.name }), hello)} className={item}>
        <span className={`${icon} bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300`}>
          <Mail size={15} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{t("email")}</span>
          <span className="block truncate text-xs text-neutral-500">{SITE.contact.email}</span>
        </span>
      </a>
      <a href={supportSmsUrl(hello)} className={item}>
        <span className={`${icon} bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300`}>
          <MessageSquare size={15} aria-hidden />
        </span>
        <span className="block font-semibold">{t("sms")}</span>
      </a>
      <Link
        href="/support#contact"
        onClick={() => setOpen(false)}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 dark:bg-neutral-100 dark:text-neutral-900"
      >
        <LifeBuoy size={15} aria-hidden />
        {t("form")}
      </Link>
    </div>
  );

  if (variant === "toolbar") {
    return (
      <div ref={boxRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={t("title")}
          title={t("title")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8b04a]/60 bg-[#ffe9b8]/10 text-[#ffe9b8] transition hover:bg-[#ffe9b8]/20"
        >
          <HelpCircle size={17} aria-hidden />
        </button>
        {open && panel}
      </div>
    );
  }

  return (
    <div ref={boxRef} className="fixed right-4 bottom-4 z-[60] sm:right-6 sm:bottom-6">
      {open && panel}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? t("close") : t("title")}
        className="flex h-13 items-center gap-2 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:brightness-110 active:scale-95"
      >
        {open ? <X size={18} aria-hidden /> : <MessageCircle size={18} aria-hidden />}
        <span className="hidden sm:inline">{open ? t("close") : t("fab")}</span>
      </button>
    </div>
  );
}

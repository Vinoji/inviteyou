"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, Sparkles, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import ThemeToggle from "../ThemeToggle";
import LanguageSwitcher from "../LanguageSwitcher";
import AppToolbar from "../AppToolbar";
import useSafeReducedMotion from "../invite/useSafeReducedMotion";
import s from "./site.module.css";

/** Pages that get the full site header and footer (not the editor or invites). */
export function isSitePage(pathname: string) {
  return !pathname.startsWith("/invite/") && !pathname.startsWith("/create/") && !pathname.startsWith("/rsvps/");
}

const NAV = [
  { href: "/#templates", key: "templates", match: (p: string) => p === "/" },
  { href: "/demo", key: "demos", match: (p: string) => p.startsWith("/demo") },
  { href: "/support", key: "support", match: (p: string) => p.startsWith("/support") },
] as const;

/** The animated marigold mark: petals turn slowly, the centre glows. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className={s.mark}>
      <defs>
        <radialGradient id="nv-petal" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffd35c" />
          <stop offset="100%" stopColor="#e8862a" />
        </radialGradient>
      </defs>
      <g className={s.petals}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="20"
            cy="9.5"
            rx="4.6"
            ry="8"
            fill="url(#nv-petal)"
            opacity={i % 2 ? 0.8 : 1}
            transform={`rotate(${i * 45} 20 20)`}
          />
        ))}
      </g>
      <circle cx="20" cy="20" r="5.2" fill="#b3261e" className={s.core} />
      <circle cx="20" cy="20" r="2" fill="#ffe7a8" />
    </svg>
  );
}

/**
 * Site header for the marketing pages: sticky, turns to frosted glass and
 * tightens once the page scrolls, marigold logo with a shimmering
 * wordmark, an underline that glides to the current page, and a
 * slide-down menu on phones. The editor keeps its compact toolbar and
 * invitation pages stay chrome-free (see isSitePage).
 */
export default function SiteHeader() {
  const t = useTranslations("site");
  const pathname = usePathname();
  const reduce = useSafeReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [openFor, setOpenFor] = useState<string | null>(null);
  // The menu belongs to the page it was opened on — navigating closes it.
  const open = openFor === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/invite/")) return null;
  if (!isSitePage(pathname)) return <AppToolbar />;

  return (
    <header className={`${s.header} ${scrolled || open ? s.scrolled : ""}`}>
      <div className={`mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6 ${s.bar}`}>
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={t("home")}>
          <LogoMark />
          <span className={`font-serif text-lg font-bold sm:text-xl ${s.wordmark}`}>
            {t("brand")}
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label={t("mainNav")}>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-amber-100/80 dark:bg-amber-500/15"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link href="/#templates" className={s.cta}>
            <Sparkles size={15} aria-hidden />
            {t("nav.create")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpenFor(open ? null : pathname)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 md:hidden dark:border-neutral-700 dark:text-neutral-200"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? t("closeMenu") : t("openMenu")}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 pt-2 pb-5" aria-label={t("mainNav")}>
              {NAV.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={reduce ? false : { x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpenFor(null)}
                    className={`block rounded-xl px-4 py-3 text-base font-medium ${
                      item.match(pathname)
                        ? "bg-amber-100/80 text-neutral-900 dark:bg-amber-500/15 dark:text-white"
                        : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-2 flex items-center justify-between gap-3 px-1">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <Link href="/#templates" onClick={() => setOpenFor(null)} className={`${s.cta} mt-3 justify-center`}>
                <Sparkles size={15} aria-hidden />
                {t("nav.create")}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

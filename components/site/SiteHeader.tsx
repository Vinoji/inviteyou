"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, Sparkles, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import SettingsMenu from "./SettingsMenu";
import AppToolbar from "../AppToolbar";
import useSafeReducedMotion from "../invite/useSafeReducedMotion";
import s from "./site.module.css";

/** Pages that get the full site header and footer (not the editor or invites). */
export function isSitePage(pathname: string) {
  return !pathname.startsWith("/invite/") && !pathname.startsWith("/create/") && !pathname.startsWith("/rsvps/");
}

/** Pages that open with a dark FestiveBanner / hero under the header. */
const DARK_TOP = new Set(["/", "/demo", "/support", "/privacy", "/terms"]);

/** Home-page sections the nav points into, top to bottom. */
type HomeSection = "templates" | "pricing";

const NAV = [
  { href: "/#templates", key: "templates", match: (p: string, sec: HomeSection) => p === "/" && sec === "templates" },
  { href: "/#pricing", key: "pricing", match: (p: string, sec: HomeSection) => p === "/" && sec === "pricing" },
  { href: "/demo", key: "demos", match: (p: string) => p.startsWith("/demo") },
  { href: "/support", key: "support", match: (p: string) => p.startsWith("/support") },
] as const;

/** Which home section the reader is in: the last one whose top has passed
 * a line a third of the way down the screen (Templates above them all). */
function currentHomeSection(): HomeSection {
  const line = window.innerHeight / 3;
  const pricing = document.getElementById("pricing");
  return pricing && pricing.getBoundingClientRect().top <= line ? "pricing" : "templates";
}

/** Three marigold tassels dangling from one end of the header capsule. */
function Tassels({ side }: { side: "L" | "R" }) {
  return (
    <div className={`${s.tassels} ${side === "L" ? s.tasselsL : s.tasselsR}`} aria-hidden>
      {[12, 20, 9].map((len, i) => (
        <span key={i} className={s.tassel} style={{ ["--len" as string]: `${len}px`, animationDelay: `${i * -0.7}s` }}>
          <i />
          <i />
        </span>
      ))}
    </div>
  );
}

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
 * Site header for the marketing pages: transparent over a page's dusk
 * banner, then a floating glass capsule in warm plum-to-rose with a gold
 * hairline and a few marigold tassels dangling from its ends. Marigold logo with a
 * shimmering wordmark, a gold pill that glides to the current page, and a
 * slide-down menu on phones. The editor keeps its compact toolbar and
 * invitation pages stay chrome-free (see isSitePage).
 */
export default function SiteHeader() {
  const t = useTranslations("site");
  const pathname = usePathname();
  const reduce = useSafeReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  // On the home page the active dot follows the section in view.
  const [section, setSection] = useState<HomeSection>("templates");
  // After a nav click, the smooth scroll passes other sections on its way;
  // hold the clicked one until it has arrived.
  const held = useRef<number | null>(null);
  const [openFor, setOpenFor] = useState<string | null>(null);
  // The menu belongs to the page it was opened on — navigating closes it.
  const open = openFor === pathname;

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      // Once per frame at most; React skips the render when nothing changed.
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 12);
        if (pathname === "/" && held.current === null) setSection(currentHomeSection());
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  /** A home-section link moves the dot at once, not after the smooth scroll. */
  function onNavClick(key: string) {
    if (key !== "templates" && key !== "pricing") return;
    setSection(key);
    if (held.current !== null) window.clearTimeout(held.current);
    held.current = window.setTimeout(() => {
      held.current = null;
    }, 1200);
  }

  // Transparent over a page's dusk banner at the top; the plum-and-gold bar
  // (with its hanging garland) everywhere else.
  const solid = scrolled || open || !DARK_TOP.has(pathname);

  if (pathname.startsWith("/invite/")) return null;
  if (!isSitePage(pathname)) return <AppToolbar />;

  return (
    <header className={`${s.header} ${solid ? s.headerFloating : ""}`}>
      <div className={`${s.capsule} ${solid ? s.capsuleSolid : ""} ${open ? s.capsuleOpen : ""}`}>
      <div className={`flex items-center gap-4 px-4 sm:px-5 ${s.bar}`}>
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={t("home")}>
          <LogoMark />
          <span className={`font-serif text-lg font-bold sm:text-xl ${s.wordmark} ${s.wordmarkLight}`}>
            {t("brand")}
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label={t("mainNav")}>
          {NAV.map((item) => {
            const active = item.match(pathname, section);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => onNavClick(item.key)}
                className={`${s.navLink} ${active ? s.navActive : ""} relative rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active ? "text-[#ffe9b8]" : "text-[#fff6e6]/80 hover:text-white"
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <SettingsMenu />
          <Link href="/#templates" className={s.cta}>
            <Sparkles size={15} aria-hidden />
            {t("nav.create")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpenFor(open ? null : pathname)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#e8b04a]/50 text-[#ffe9b8] md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? t("closeMenu") : t("openMenu")}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {solid && !open && (
        <>
          <Tassels side="L" />
          <Tassels side="R" />
        </>
      )}

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
            <nav className="flex flex-col gap-1 px-4 pt-2 pb-8" aria-label={t("mainNav")}>
              {NAV.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={reduce ? false : { x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      onNavClick(item.key);
                      setOpenFor(null);
                    }}
                    className={`block rounded-xl px-4 py-3 text-base font-medium ${
                      item.match(pathname, section) ? `${s.navPill} text-[#ffe9b8]` : "text-[#fff6e6]/80"
                    }`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 rounded-2xl bg-[#fffaf2] p-4 dark:bg-[#1c1220]">
                <SettingsMenu inline />
              </div>
              <Link href="/#templates" onClick={() => setOpenFor(null)} className={`${s.cta} mt-3 justify-center`}>
                <Sparkles size={15} aria-hidden />
                {t("nav.create")}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </header>
  );
}

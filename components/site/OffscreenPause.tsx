"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/** What gets watched: every page section, the footer, and anything marked
 * data-pause-offscreen. Nested sections are covered by their parent. */
const TARGETS = "section, footer, [data-pause-offscreen]";

/**
 * Pauses CSS animations that are off screen. The pages run a lot of looping
 * decoration (stars, petals, garlands, kolams, marquees, whole invitation
 * intros); browsers keep ticking all of it even when it's far out of view,
 * which on phones meant hundreds of animations at once — lag and frozen
 * frames. Each watched element gets `data-offscreen` while it's out of view
 * and globals.css pauses every animation inside it; it resumes, from where
 * it stopped, as it scrolls back in. Framer Motion animations are untouched
 * (they already only run in view).
 */
export default function OffscreenPause() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.removeAttribute("data-offscreen");
          else e.target.setAttribute("data-offscreen", "");
        }
      },
      // A little early, so nothing is caught paused as it scrolls in.
      { rootMargin: "200px 0px" }
    );
    const watched = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(TARGETS).forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    };
    scan();
    // Sections that mount later (client pages, steps, intros finishing).
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = window.setTimeout(() => {
        pending = 0;
        scan();
      }, 250);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(pending);
      document.querySelectorAll("[data-offscreen]").forEach((el) => el.removeAttribute("data-offscreen"));
    };
  }, [pathname]);

  return null;
}

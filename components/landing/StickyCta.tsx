"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";

/**
 * Phones: once the visitor has scrolled past the design gallery (reading
 * how it works, features, pricing), a slim bar keeps the next step one tap
 * away — back to the designs. Hidden while the gallery, the final call to
 * action or the footer is on screen, and on wider screens.
 */
export default function StickyCta({ price }: { price: number }) {
  const t = useTranslations("landing.sticky");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const gallery = document.getElementById("templates");
      const footer = document.querySelector("footer");
      const past = gallery ? gallery.getBoundingClientRect().bottom < 0 : false;
      const footerIn = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      setShow(past && !footerIn);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={`fixed right-20 bottom-4 left-3 z-50 transition duration-300 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      aria-hidden={!show}
    >
      <div className="flex items-center gap-3 rounded-full border border-[#e8b04a]/50 bg-gradient-to-r from-[#3d1236] to-[#22091f] py-1.5 pr-1.5 pl-4 shadow-[0_14px_30px_-12px_rgba(34,9,31,0.9)]">
        <p className="min-w-0 flex-1 text-[11px] leading-tight font-semibold text-[#ffe9b8]">
          {t("line", { price })
            .split(" · ")
            .map((part) => (
              <span key={part} className="block truncate">
                {part}
              </span>
            ))}
        </p>
        <button
          type="button"
          tabIndex={show ? 0 : -1}
          onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-[#ffe08a] via-[#f2c45a] to-[#c98f3a] px-4 text-sm font-bold text-[#2a0c27]"
        >
          <ArrowUp size={15} aria-hidden />
          {t("cta")}
        </button>
      </div>
    </div>
  );
}

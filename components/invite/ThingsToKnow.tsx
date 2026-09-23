"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getFontPairing } from "@/lib/fontPairings";
import { getThemeClasses } from "./theme";
import SectionDivider from "./SectionDivider";
import type { FaqItem } from "@/lib/types";

function AccordionRow({
  item,
  open,
  onToggle,
  accentColor,
  fontPairing,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
  accentColor: string;
  fontPairing: string;
}) {
  const font = getFontPairing(fontPairing);
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span
          className="text-base font-semibold text-neutral-900"
          style={{ fontFamily: font.headingVar }}
        >
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
          style={{ color: accentColor }}
        >
          <ChevronDown size={18} aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p
              className="pb-4 text-sm leading-relaxed text-neutral-600"
              style={{ fontFamily: font.bodyVar }}
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ThingsToKnow({
  faq,
  accentColor,
  fontPairing,
  templateId,
}: {
  faq: FaqItem[];
  accentColor: string;
  fontPairing: string;
  templateId: string;
}) {
  const items = faq.filter((f) => f.question.trim() && f.answer.trim());
  const [openIndex, setOpenIndex] = useState<number | null>(items.length > 0 ? 0 : null);
  const theme = getThemeClasses(templateId);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
      <div className="text-center">
        <h2
          className="text-sm font-semibold tracking-[0.3em] uppercase"
          style={{ color: accentColor }}
        >
          Things to Know
        </h2>
        <div className="mt-3">
          <SectionDivider templateId={templateId} accent={accentColor} />
        </div>
      </div>
      <div className={`mt-8 px-6 py-2 sm:px-8 ${theme.card}`} style={{ borderColor: `${accentColor}33` }}>
        {items.map((item, i) => (
          <AccordionRow
            key={i}
            item={item}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            accentColor={accentColor}
            fontPairing={fontPairing}
          />
        ))}
      </div>
    </section>
  );
}

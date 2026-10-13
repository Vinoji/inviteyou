"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Names that always fit. Every design sizes the couple's names as
 * `calc(… * var(--name-fit) * var(--name-size) * var(--name-auto))`:
 *   --name-fit   rough shrink for long names (lib/monogram nameFitScale)
 *   --name-size  the couple's own choice in the editor (data.nameSize)
 *   --name-auto  set here: after layout, each name's longest word is
 *                measured at its real font and, if it wouldn't fit its
 *                line, the name is scaled down until it does — so
 *                "ELAIYABHARATHY" shrinks instead of breaking mid-word.
 * Wraps the whole invitation (intros included) with display: contents.
 */
export default function NameFit({
  names,
  size = 1,
  children,
}: {
  names: string[];
  /** The couple's size choice, 1 = the design's own size. */
  size?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const key = names.map((n) => n.trim()).join("\u0001");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const wanted = key.split("\u0001").filter((n) => n.length > 1);
    if (!wanted.length) return;
    const canvas = document.createElement("canvas").getContext("2d");
    const touched = new Set<HTMLElement>();
    let frame = 0;

    const fit = () => {
      frame = 0;
      if (!canvas) return;
      for (const el of touched) el.style.removeProperty("--name-auto");
      touched.clear();
      // Per element that sets the names' font size: the smallest ratio of
      // room to longest word among the names inside it.
      const ratios = new Map<HTMLElement, number>();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent?.trim() ?? "";
        if (!wanted.includes(text)) continue;
        const host = node.parentElement;
        if (!host || !host.getClientRects().length) continue;
        const cs = getComputedStyle(host);
        // Where the size is declared: climb while the parent has the same size.
        let decl: HTMLElement = host;
        while (decl.parentElement && decl.parentElement !== root && getComputedStyle(decl.parentElement).fontSize === cs.fontSize) {
          decl = decl.parentElement;
        }
        // The line it has to fit: the nearest block box's content width.
        let box: HTMLElement | null = host;
        while (box && getComputedStyle(box).display.startsWith("inline")) box = box.parentElement;
        if (!box) continue;
        const bs = getComputedStyle(box);
        const room = box.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
        if (room <= 0) continue;
        canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const spacing = parseFloat(cs.letterSpacing) || 0;
        const shown = cs.textTransform === "uppercase" ? text.toUpperCase() : text;
        const widest = Math.max(
          ...shown.split(/\s+/).map((w) => canvas.measureText(w).width + spacing * [...w].length)
        );
        // The fitted size, then the couple's choice: smaller stays smaller,
        // bigger stops where the line is full.
        const fitAt = room / widest;
        const ratio = Math.min(1, fitAt * 0.97, fitAt * size);
        if (ratio < 1) ratios.set(decl, Math.min(ratios.get(decl) ?? 1, ratio));
      }
      for (const [el, ratio] of ratios) {
        el.style.setProperty("--name-auto", String(Math.max(0.3, Math.floor(ratio * 100) / 100)));
        touched.add(el);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };

    schedule();
    void document.fonts?.ready.then(schedule);
    window.addEventListener("resize", schedule);
    // Intros open, sections mount, the preview frame changes size…
    const mo = new MutationObserver(schedule);
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    const ro = new ResizeObserver(schedule);
    for (const child of Array.from(root.children)) ro.observe(child);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
      ro.disconnect();
      for (const el of touched) el.style.removeProperty("--name-auto");
    };
  }, [key, size]);

  return (
    <div ref={ref} style={{ display: "contents", ["--name-size" as string]: size }}>
      {children}
    </div>
  );
}

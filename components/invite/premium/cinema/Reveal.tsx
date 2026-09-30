"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import c from "./cinema.module.css";

/** Children rise out of a blur into focus the first time they scroll into view. */
export default function Reveal({
  as = "div",
  delay = 0,
  className = "",
  style,
  children,
}: {
  as?: "div" | "p" | "h2" | "span";
  /** Seconds, for staggering lines. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  // One element type for the ref; the tag only changes the markup.
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`${c.reveal} ${shown ? c.revealed : ""} ${className}`}
      style={{ ...style, ["--d" as string]: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}

"use client";

import { useEffect, useState } from "react";

/**
 * True while a phone's on-screen keyboard is up — detected from the visual
 * viewport shrinking well below the layout viewport. Used to hide sticky
 * bottom bars so they don't sit on top of the field being typed in.
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const check = () => setOpen(window.innerHeight - vv.height > 150);
    vv.addEventListener("resize", check);
    return () => vv.removeEventListener("resize", check);
  }, []);
  return open;
}

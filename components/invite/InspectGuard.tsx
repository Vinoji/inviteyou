"use client";

import { useEffect } from "react";

// Blocks the usual ways into browser dev tools (F12, Ctrl/Cmd+Shift+I/J/C,
// Ctrl/Cmd+U, right-click) on the invitation views, unless the URL has
// ?debug=1. A deterrent only: the page source is still delivered to the
// browser, so it can't keep a determined person out.
export default function InspectGuard() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("debug") === "1") return;
    const onKey = (e: KeyboardEvent) => {
      // Browser autofill fires keydown events that carry no key.
      const k = (e.key ?? "").toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (
        e.key === "F12" ||
        (mod && e.shiftKey && ["i", "j", "c"].includes(k)) ||
        (e.metaKey && e.altKey && ["i", "j", "c"].includes(k)) ||
        (mod && k === "u")
      ) {
        e.preventDefault();
      }
    };
    const onMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onMenu);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onMenu);
    };
  }, []);
  return null;
}

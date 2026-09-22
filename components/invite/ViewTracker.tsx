"use client";

import { useEffect } from "react";

/**
 * Fires a single view-count beacon per browser session (per slug), so a
 * page refresh within the same tab session doesn't inflate the count. The
 * server route applies its own short IP-based de-dup on top of this.
 */
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable (private mode etc) — fall through and
      // still send the beacon; server-side de-dup covers this case.
    }
    fetch(`/api/view/${slug}`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);

  return null;
}

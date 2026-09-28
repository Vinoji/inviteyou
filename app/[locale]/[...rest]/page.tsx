import { notFound } from "next/navigation";

/**
 * Any unknown address inside a locale (e.g. /ta/no-such-page) renders the
 * localised, festive app/[locale]/not-found.tsx — inside the site layout —
 * instead of falling through to the bare root fallback.
 */
export default function CatchAllNotFound() {
  notFound();
}

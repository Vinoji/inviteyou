"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { isSitePage } from "./SiteHeader";

/** Renders the (server-built) footer only on the marketing pages. */
export default function FooterGate({ children }: { children: ReactNode }) {
  return isSitePage(usePathname()) ? children : null;
}

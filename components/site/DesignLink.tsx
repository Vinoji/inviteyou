"use client";

import type { ComponentProps } from "react";
import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";

/**
 * A link that opens a design in the editor (/create/<id>). The editor page
 * is ~85 KB, so it isn't prefetched for every card that scrolls into view
 * (a page of designs would cost a phone megabytes); it starts loading when
 * the visitor shows intent — hover, touch or keyboard focus — which is
 * usually enough of a head start. If the tap still has to wait, a spinner
 * shows on the link at once, so it never looks like nothing happened.
 */
export default function DesignLink({
  href,
  className,
  children,
  onPointerEnter,
  onTouchStart,
  onFocus,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const warm = () => router.prefetch(href);
  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      className={`relative ${className ?? ""}`}
      onPointerEnter={(e) => {
        warm();
        onPointerEnter?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
    >
      {children}
      <Opening />
    </Link>
  );
}

/** While the editor is on its way: a veil and a spinner over the link. */
function Opening() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span aria-hidden className="absolute inset-0 flex items-center justify-end rounded-[inherit] bg-white/50 pr-3 dark:bg-black/40">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2c45a] text-[#2a0c27] shadow-md">
        <Loader2 size={16} className="animate-spin" />
      </span>
    </span>
  );
}

import "server-only";
import type { NextRequest } from "next/server";

/** Absolute links for messages sent to the owner (guest link + private
 * edit link), in the owner's language. Uses NEXT_PUBLIC_SITE_URL when set
 * so links in a text message never point at an internal host. */
export function ownerLinks(
  req: NextRequest,
  opts: { slug: string; templateId: string; editToken: string; locale: "en" | "ta" }
) {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/+$/, "");
  const prefix = opts.locale === "ta" ? "/ta" : "";
  return {
    invite: `${origin}/invite/${opts.slug}`,
    edit: `${origin}${prefix}/create/${opts.templateId}?edit=${opts.slug}&token=${opts.editToken}`,
  };
}

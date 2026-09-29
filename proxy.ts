import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skips the API, Next internals, files (anything with a dot), the
  // generated icons (no extension: app/apple-icon.tsx) and link-preview
  // images. Those are linked as /en/.../opengraph-image; letting the
  // middleware drop the "/en" meant a redirect that WhatsApp and other
  // preview fetchers don't always follow — so no preview picture.
  matcher: ["/((?!api|_next|apple-icon|icon|.*opengraph-image|.*\\..*).*)"],
};

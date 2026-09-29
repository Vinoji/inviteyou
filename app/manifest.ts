import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Web app manifest — name, colours and icons for "Add to home screen". */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — animated invitations`,
    short_name: SITE.name,
    description: "Animated online invitations for weddings and every celebration, in Tamil and English.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf2",
    theme_color: "#3d1236",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

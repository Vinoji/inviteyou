export interface ThemeClasses {
  page: string;
  card: string;
  heroOverlay: string;
}

export function getThemeClasses(templateId: string): ThemeClasses {
  switch (templateId) {
    case "traditional-gold":
      return {
        page: "bg-gradient-to-b from-red-50 via-amber-50 to-white",
        card: "border-2 rounded-none",
        heroOverlay:
          "bg-gradient-to-t from-red-950/85 via-red-900/35 to-transparent",
      };
    case "floral-pastel":
      return {
        page: "bg-gradient-to-b from-rose-50 via-white to-emerald-50",
        card: "border rounded-3xl",
        heroOverlay:
          "bg-gradient-to-t from-rose-950/65 via-rose-900/25 to-transparent",
      };
    case "elegant-bw":
      return {
        page: "bg-white",
        card: "border rounded-none",
        heroOverlay: "bg-gradient-to-t from-black/85 via-black/35 to-transparent",
      };
    case "beach-boho":
      return {
        page: "bg-gradient-to-b from-orange-50 via-amber-50 to-teal-50",
        card: "border rounded-3xl",
        heroOverlay:
          "bg-gradient-to-t from-orange-950/75 via-orange-900/25 to-transparent",
      };
    case "anniversary-emerald":
      return {
        page: "bg-gradient-to-b from-emerald-50 via-white to-amber-50",
        card: "border-2 rounded-none",
        heroOverlay:
          "bg-gradient-to-t from-emerald-950/85 via-emerald-900/35 to-transparent",
      };
    case "valentine-blush":
      return {
        page: "bg-gradient-to-b from-rose-50 via-white to-rose-50",
        card: "border rounded-3xl",
        heroOverlay:
          "bg-gradient-to-t from-rose-950/75 via-rose-800/30 to-transparent",
      };
    case "proposal-starlit":
      return {
        page: "bg-gradient-to-b from-indigo-50 via-white to-amber-50",
        card: "border rounded-2xl",
        heroOverlay:
          "bg-gradient-to-t from-indigo-950/90 via-indigo-900/45 to-transparent",
      };
    case "birthday-confetti":
      return {
        page: "bg-gradient-to-b from-fuchsia-50 via-white to-sky-50",
        card: "border rounded-3xl",
        heroOverlay:
          "bg-gradient-to-t from-fuchsia-950/70 via-fuchsia-800/30 to-transparent",
      };
    case "housewarming-terracotta":
      return {
        page: "bg-gradient-to-b from-orange-50 via-white to-lime-50",
        card: "border rounded-2xl",
        heroOverlay:
          "bg-gradient-to-t from-orange-950/80 via-orange-900/30 to-transparent",
      };
    case "minimal-modern":
    default:
      return {
        page: "bg-white",
        card: "border rounded-2xl",
        heroOverlay:
          "bg-gradient-to-t from-neutral-950/75 via-neutral-900/25 to-transparent",
      };
  }
}

import dynamic from "next/dynamic";
import type { PremiumProps } from "./types";

/**
 * Templates with a page of their own — composition, materials and art made
 * for that one design, not a recolour of a shared layout. Each is its own
 * chunk. Every other template uses the royal or section layout.
 */
const Pathirikai = dynamic(() => import("./pathirikai/PathirikaiInvitation"));
const Editorial = dynamic(() => import("./editorial/EditorialInvitation"));
// Cinematic photo templates (./cinema): real photographs with motion.
const Party = dynamic(() => import("./cinema/PartyInvitation"));
const Candlelight = dynamic(() => import("./cinema/CandlelightInvitation"));
const Fresh = dynamic(() => import("./cinema/FreshInvitation"));
// Real photos that move in 3D (./living): depth-map parallax.
const LivingTemple = dynamic(() => import("./living/LivingTempleInvitation"));
// Trending, simple and elegant.
const LilacSeal = dynamic(() => import("./lilac/LilacSealInvitation"));
const PastelPalace = dynamic(() => import("./pastel/PastelPalaceInvitation"));
const MaduraiMeenakshi = dynamic(() => import("./meenakshi/MaduraiMeenakshiInvitation"));
const PrintedCard = dynamic(() => import("./printed/PrintedCardInvitation"));
const CinematicFilm = dynamic(() => import("./film/CinematicFilmInvitation"));
// A photo-led scrapbook album with interactive pieces (./album).
const Album = dynamic(() => import("./album/AlbumInvitation"));
// A scroll journey through a painted temple (./journey).
const Journey = dynamic(() => import("./journey/JourneyInvitation"));

const PREMIUM_IDS = new Set([
  "temple-gopuram",
  "luxe-editorial",
  "birthday-balloon-party",
  "anniversary-wine-roses",
  "baby-shower-balloons",
  "living-temple",
  "lilac-seal",
  "pastel-palace",
  "madurai-meenakshi",
  "cinematic-film",
  "telugu-subhalekha",
  "bengali-alpana",
  "marathi-paithani",
  "kerala-muslim-nikah",
  "letterpress-ivory",
  "art-deco-noir",
  "kolam-pathirikai",
  "paisley-silk-vivah",
  "jaali-velvet-nikah",
  "kerala-christian-kasavu",
  "blush-lace",
  "lilac-seal-proposal",
  "cinematic-film-proposal",
  "lilac-seal-valentine",
  "pastel-palace-valentine",
  "cinematic-film-housewarming",
  "house-blessing-card",
  "corporate-formal-card",
  "milestone-birthday-card",
  "nichayathartham-pathirikai",
  "meenakshi-nichayathartham",
  "lilac-seal-engagement",
  "griha-pravesam-pathirikai",
  "namakaranam-card",
  "valaikaappu-card",
  "pastel-palace-baby-shower",
  "shashtiabdapoorthi-card",
  "lilac-seal-anniversary",
  "cinematic-film-anniversary",
  "first-birthday-card",
  "pastel-palace-birthday",
  "cinematic-film-birthday",
  "cinematic-film-launch",
  "kalyanam-rituals",
  "kerala-sadya",
  "manjal-pathirikai",
  "maroon-pathirikai",
  "kerala-sumuhurtham",
  "emerald-nikah",
  "ivory-nikah",
  "ivory-holy-matrimony",
  "royal-blue-matrimony",
  "anand-karaj-ivory",
  "phulkari-anand-karaj",
  "jain-namokar-maroon",
  "jain-kesar-ivory",
  "photo-story",
  "temple-photo-story",
  "pearl-curtain",
  "temple-journey",
]);

export function hasPremiumLayout(templateId: string): boolean {
  return PREMIUM_IDS.has(templateId);
}

export default function PremiumInvitation(props: PremiumProps) {
  switch (props.data.templateId) {
    case "temple-gopuram":
      return <Pathirikai {...props} />;
    case "luxe-editorial":
      return <Editorial {...props} />;
    case "birthday-balloon-party":
      return <Party {...props} />;
    case "anniversary-wine-roses":
      return <Candlelight {...props} />;
    case "baby-shower-balloons":
      return <Fresh {...props} />;
    case "pastel-palace":
    case "pastel-palace-baby-shower":
    case "pastel-palace-birthday":
    case "pastel-palace-valentine":
      return <PastelPalace {...props} />;
    case "madurai-meenakshi":
    case "meenakshi-nichayathartham":
      return <MaduraiMeenakshi {...props} />;
    case "cinematic-film":
    case "cinematic-film-anniversary":
    case "cinematic-film-birthday":
    case "cinematic-film-launch":
    case "cinematic-film-proposal":
    case "cinematic-film-housewarming":
      return <CinematicFilm {...props} />;
    case "kalyanam-rituals":
    case "kerala-sadya":
    case "manjal-pathirikai":
    case "maroon-pathirikai":
    case "kerala-sumuhurtham":
    case "emerald-nikah":
    case "ivory-nikah":
    case "ivory-holy-matrimony":
    case "royal-blue-matrimony":
    case "anand-karaj-ivory":
    case "phulkari-anand-karaj":
    case "jain-namokar-maroon":
    case "jain-kesar-ivory":
    case "nichayathartham-pathirikai":
    case "griha-pravesam-pathirikai":
    case "namakaranam-card":
    case "valaikaappu-card":
    case "shashtiabdapoorthi-card":
    case "first-birthday-card":
    case "house-blessing-card":
    case "corporate-formal-card":
    case "milestone-birthday-card":
    case "letterpress-ivory":
    case "art-deco-noir":
    case "kolam-pathirikai":
    case "paisley-silk-vivah":
    case "jaali-velvet-nikah":
    case "kerala-christian-kasavu":
    case "blush-lace":
    case "telugu-subhalekha":
    case "bengali-alpana":
    case "marathi-paithani":
    case "kerala-muslim-nikah":
      return <PrintedCard {...props} />;
    case "lilac-seal":
    case "lilac-seal-engagement":
    case "lilac-seal-anniversary":
    case "lilac-seal-proposal":
    case "lilac-seal-valentine":
      return <LilacSeal {...props} />;
    case "living-temple":
      return <LivingTemple {...props} />;
    case "photo-story":
    case "temple-photo-story":
    case "pearl-curtain":
      return <Album {...props} />;
    case "temple-journey":
      return <Journey {...props} />;
    default:
      return null;
  }
}

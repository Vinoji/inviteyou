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

const PREMIUM_IDS = new Set([
  "temple-gopuram",
  "luxe-editorial",
  "birthday-balloon-party",
  "anniversary-wine-roses",
  "baby-shower-balloons",
  "living-temple",
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
    case "living-temple":
      return <LivingTemple {...props} />;
    default:
      return null;
  }
}

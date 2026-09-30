import dynamic from "next/dynamic";
import type { PremiumProps } from "./types";

/**
 * Templates with a page of their own — composition, materials and art made
 * for that one design, not a recolour of a shared layout. Each is its own
 * chunk. Every other template uses the royal or section layout.
 */
const Pathirikai = dynamic(() => import("./pathirikai/PathirikaiInvitation"));
const Editorial = dynamic(() => import("./editorial/EditorialInvitation"));

const PREMIUM_IDS = new Set(["temple-gopuram", "luxe-editorial"]);

export function hasPremiumLayout(templateId: string): boolean {
  return PREMIUM_IDS.has(templateId);
}

export default function PremiumInvitation(props: PremiumProps) {
  switch (props.data.templateId) {
    case "temple-gopuram":
      return <Pathirikai {...props} />;
    case "luxe-editorial":
      return <Editorial {...props} />;
    default:
      return null;
  }
}

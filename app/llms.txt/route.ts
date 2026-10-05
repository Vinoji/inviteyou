import { SITE } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";
import { LIST_PRICE_INR, OFFER_ENDS_AT, offerActive, standardPriceInr } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/categories";
import en from "@/messages/en.json";

/**
 * /llms.txt — a plain-language summary for AI assistants and answer
 * engines (the llmstxt.org convention): what InviteForYou is, what it
 * costs, and the pages worth reading (the occasion pages at
 * /invitations/<category>).
 */
export const dynamic = "force-static";
// Rebuilt daily so the price follows the launch offer.
export const revalidate = 86400;

export function GET() {
  const pages = en.seoPages as unknown as Record<string, { metaTitle: string; metaDescription: string }>;
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${en.seo.orgDescription}`,
    "",
    `${SITE.name} (${SITE_URL}) is an Indian online invitation maker. People pick an animated or 3D design, add names, dates, venues, family, story, photos and music in English or Tamil, then share one link on WhatsApp. Each invitation includes RSVP with a guest list, a countdown, Google Maps directions, add-to-calendar, a photo gallery, background music and guest photo sharing.`,
    "",
    `Pricing: free to design and preview; ₹${standardPriceInr()} to publish one invitation${
      offerActive() ? ` (launch offer until ${new Date(OFFER_ENDS_AT).toISOString().slice(0, 10)}, then ₹${LIST_PRICE_INR})` : ""
    } — premium 3D designs cost more — paid once, no subscription. Invitations stay live until 10 days after the event date.`,
    "",
    "## Invitations by occasion",
    "",
    ...CATEGORIES.filter((c) => pages[c.id]).map(
      (c) => `- [${pages[c.id].metaTitle}](${SITE_URL}/invitations/${c.id}): ${pages[c.id].metaDescription}`
    ),
    "",
    "## More",
    "",
    `- [Home](${SITE_URL}/): designs, features and pricing`,
    `- [Live demos](${SITE_URL}/demo): every design's opening animation`,
    `- [Support and FAQ](${SITE_URL}/support)`,
    `- [Tamil version](${SITE_URL}/ta)`,
    `- Contact: ${SITE.contact.email}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}

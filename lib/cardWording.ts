/**
 * The printed cards' own wording (messages `premium.printed.<wording>`),
 * which the couple can reword line by line: InvitationData.cardWording.
 * An empty line keeps the design's own.
 */
export const CARD_WORDING_KEYS = [
  "invocation",
  "invocationSub",
  "title",
  "lead",
  "groomLabel",
  "brideLabel",
  "joiner",
  "after",
  "timeLabel",
  "closing",
  "hostsLabel",
] as const;

export type CardWordingKey = (typeof CARD_WORDING_KEYS)[number];
export type CardWording = Partial<Record<CardWordingKey, string>>;

/** The paragraphs get room; the rest are single lines. */
export const CARD_WORDING_MAX: Record<CardWordingKey, number> = {
  invocation: 80,
  invocationSub: 80,
  title: 60,
  lead: 280,
  groomLabel: 30,
  brideLabel: 30,
  joiner: 30,
  after: 120,
  timeLabel: 30,
  closing: 280,
  hostsLabel: 80,
};

export function sanitizeCardWording(v: unknown): CardWording | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const obj = v as Record<string, unknown>;
  const out: CardWording = {};
  for (const k of CARD_WORDING_KEYS) {
    const s = obj[k];
    if (typeof s === "string" && s.trim()) out[k] = s.trim().slice(0, CARD_WORDING_MAX[k]);
  }
  return out;
}

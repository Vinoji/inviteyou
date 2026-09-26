import type { BurstOptions } from "../particles/ParticleField";

/**
 * What every intro receives from IntroHost. An intro only draws its own
 * scene and animation, filling its container (`absolute inset-0`); the host
 * owns everything around it — fixed vs. editor-pane framing, scroll lock,
 * the "already opened this session" skip, replay, and the particle canvas.
 *
 * Intros read their own labels with useTranslations (namespace
 * `invite.intros.<id>` or an existing one), so the host doesn't need to know
 * each intro's strings.
 */
export interface IntroProps {
  names: { a: string; b?: string };
  /** ISO yyyy-mm-dd, for intros that format the date themselves. */
  weddingDate: string;
  /** Engraved-style date, e.g. "24 · 01 · 2027", or "" if unset. */
  dateLabel?: string;
  /** Font stacks from the invitation's font pairing. */
  fonts: { display: string; script: string; caps: string };
  accent: string;
  templateId: string;
  /** The guest acted (tapped / pulled). Call once, at the moment of the gesture. */
  onOpen: () => void;
  /** The intro has fully finished and can be removed. */
  onDone: () => void;
  /** Fire a particle burst on the host's canvas (it outlives the intro). */
  burst: (opts: BurstOptions) => void;
  /** Rendering inside the editor's preview pane: no audio, no scroll lock. */
  preview?: boolean;
}

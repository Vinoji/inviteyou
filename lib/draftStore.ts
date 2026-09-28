import type { ContentLocale, InvitationData } from "./types";

/**
 * Unpublished editor drafts, autosaved to this browser's localStorage —
 * one per occasion category, so a half-made wedding invite and a birthday
 * one don't overwrite each other.
 *
 * Only the fields the user actually changed from the template's sample
 * content are stored. That's what lets a draft move to another template
 * of the same category: whatever the couple typed comes along, anything
 * still at the old template's sample is replaced by the new one's.
 */

const VERSION = 1;
const key = (category: string) => `namma:draft:${category}`;

export interface StoredDraft {
  v: number;
  templateId: string;
  draftId: string;
  contentLocale: ContentLocale;
  storyPreset: string | null;
  savedAt: number;
  fields: Partial<InvitationData>;
}

/** Styling that belongs to a template; dropped when a draft changes template. */
export const TEMPLATE_STYLE_KEYS = ["accentColor", "fontPairing"] as const;

export function changedFields(data: InvitationData, seed: InvitationData): Partial<InvitationData> {
  const out: Partial<InvitationData> = {};
  for (const k of Object.keys(data) as (keyof InvitationData)[]) {
    if (k === "templateId" || k === "contentLocale") continue;
    if (JSON.stringify(data[k]) !== JSON.stringify(seed[k])) {
      Object.assign(out, { [k]: data[k] });
    }
  }
  return out;
}

export function loadDraft(category: string): StoredDraft | null {
  try {
    const raw = localStorage.getItem(key(category));
    if (!raw) return null;
    const draft = JSON.parse(raw) as StoredDraft;
    if (draft?.v !== VERSION || typeof draft.templateId !== "string" || !draft.fields) return null;
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(category: string, draft: Omit<StoredDraft, "v" | "savedAt">) {
  try {
    if (Object.keys(draft.fields).length === 0) {
      localStorage.removeItem(key(category));
      return;
    }
    localStorage.setItem(key(category), JSON.stringify({ ...draft, v: VERSION, savedAt: Date.now() }));
  } catch {
    // Storage full or blocked (private mode) — autosave is a convenience only.
  }
}

export function clearDraft(category: string) {
  try {
    localStorage.removeItem(key(category));
  } catch {
    // Ignore.
  }
}

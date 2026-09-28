"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Monitor, Plus, RotateCcw, Smartphone, Tablet, Trash2 } from "lucide-react";
import {
  NextIntlClientProvider,
  createTranslator,
  useLocale,
  useTimeZone,
  useTranslations,
  type AbstractIntlMessages,
} from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import Script from "next/script";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getTemplateMeta, getTemplatesByCategory } from "@/lib/i18n/templates";
import { TEMPLATE_STYLE_KEYS, changedFields, clearDraft, loadDraft, saveDraft } from "@/lib/draftStore";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { getDefaultInvitationData } from "@/lib/i18n/defaultContent";
import { FONT_PAIRINGS } from "@/lib/fontPairings";
import { SITE } from "@/lib/site";
import { waPhone } from "@/lib/share";
import { isDateAllowed, todayIso } from "@/lib/dates";
import { OWNER_PHONE_KEY } from "@/components/invite/WelcomeBanner";
import {
  EMPTY_MONOGRAM,
  EMPTY_TRAVEL,
  type ContentLocale,
  type FamilySide,
  type InvitationData,
} from "@/lib/types";
import { getFamily, legacyParentsLine } from "@/lib/family";
import { STORY_PRESETS } from "@/lib/storyPresets";
import { PRICE_INR } from "@/lib/pricing";
import { firstGrapheme, resolveMonogram, scriptLang } from "@/lib/monogram";
import InvitationView from "@/components/invite/InvitationView";
import { FormSection, Field, inputClass, SectionToggle } from "@/components/editor/FormFields";
import { AddPhotoTile, PhotoTile } from "@/components/editor/PhotoSlot";
import PhotoCropper from "@/components/editor/PhotoCropper";
import TravelFields from "@/components/editor/TravelFields";
import PlacesFields from "@/components/editor/PlacesFields";
import StoryPicker from "@/components/editor/StoryPicker";
import FamilyFields, { type FamilyUpdate } from "@/components/editor/FamilyFields";
import { REPLAY_INTRO_EVENT } from "@/components/invite/intros/events";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: () => void) => void;
}
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const ACCENT_PRESETS = [
  "#b8860b",
  "#18181b",
  "#d9738a",
  "#111111",
  "#c2703d",
  "#2563eb",
  "#15803d",
];

/** Translator over the invitation-language messages (not the UI's). */
function contentT(
  messages: Record<ContentLocale, AbstractIntlMessages>,
  locale: ContentLocale,
  namespace: string
): ContentT {
  // Untyped messages make createTranslator infer "no values allowed"; the
  // lib helpers (getDefaultInvitationData, story presets) take this shape.
  return createTranslator({ locale, messages: messages[locale], namespace }) as unknown as ContentT;
}
type ContentT = {
  (key: string, values?: Record<string, string | number>): string;
  raw: (key: string) => unknown;
};

/** Seed fields that follow the invitation language while untouched: switch
 * the language and any of these still equal to the old language's seed are
 * swapped for the new one; anything the couple typed stays as it is. */
const SEED_KEYS = [
  "brideName",
  "groomName",
  "story",
  "ceremonyVenue",
  "receptionVenue",
  "brideParents",
  "groomParents",
  "brideFamily",
  "groomFamily",
  "faq",
  "travel",
  "places",
] as const satisfies readonly (keyof InvitationData)[];

/** "<time>-<random>" in lowercase base36 — the shape storage.rules expects. */
function uniqueSuffix() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8) || "0"}`;
}

function generateDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Editor({
  templateId,
  editSlug,
  editToken,
  contentMessages,
}: {
  templateId: string;
  editSlug: string | null;
  editToken: string | null;
  /** Invitation-language messages for both locales (see page.tsx). */
  contentMessages: Record<ContentLocale, AbstractIntlMessages>;
}) {
  const router = useRouter();
  const t = useTranslations("editor");
  const tTemplates = useTranslations("templates");
  const tCategories = useTranslations("categories");
  const uiLocale: ContentLocale = useLocale() === "ta" ? "ta" : "en";
  const timeZone = useTimeZone();
  const template = getTemplateMeta(templateId, tTemplates);
  const category = getCategoryMeta(template.category, tCategories);
  const isEditMode = Boolean(editSlug && editToken);

  const [draftId, setDraftId] = useState(() => generateDraftId());
  const [data, setData] = useState<InvitationData>(() => ({
    ...getDefaultInvitationData(templateId, contentT(contentMessages, uiLocale, "defaultContent")),
    contentLocale: uiLocale,
  }));
  // Older published docs have no contentLocale; they rendered in the page's language.
  const contentLocale: ContentLocale = data.contentLocale ?? uiLocale;
  const tPresets = useMemo(
    () => contentT(contentMessages, contentLocale, "storyPresets"),
    [contentMessages, contentLocale]
  );
  const tCommon = useMemo(
    () => contentT(contentMessages, contentLocale, "common"),
    [contentMessages, contentLocale]
  );
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [razorpayReady, setRazorpayReady] = useState(false);
  // Which ready-made story (if any) is in the story box, and the seed story a
  // fresh editor starts with — both count as "not the user's own words", so
  // replacing them needs no confirmation.
  const [storyPreset, setStoryPreset] = useState<string | null>(null);
  // The template's sample content in the invitation language — what the
  // autosave diffs against, and what "Start fresh" goes back to.
  const seed = useMemo(
    () => ({
      ...getDefaultInvitationData(templateId, contentT(contentMessages, contentLocale, "defaultContent")),
      contentLocale,
    }),
    [templateId, contentMessages, contentLocale]
  );
  const seedStory = seed.story;
  // Autosave only starts once any saved draft has been read back in, so an
  // untouched first render can't overwrite it.
  const [draftReady, setDraftReady] = useState(false);
  const [draftNotice, setDraftNotice] = useState<
    { kind: "restored" } | { kind: "carried"; from: string } | null
  >(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  // The buyer's own number: their edit link is sent there after payment.
  const [ownerPhone, setOwnerPhone] = useState("");
  const ownerPhoneOk = Boolean(waPhone(ownerPhone));
  const [phoneTouched, setPhoneTouched] = useState(false);
  // No past event dates (lib/dates.ts). "Today" is read after mount, from
  // the visitor's clock, so server and client render the same HTML.
  const [today, setToday] = useState("");
  const [savedDate, setSavedDate] = useState<string | undefined>(undefined);
  const dateRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const showPhoneError = (phoneTouched || Boolean(ownerPhone)) && !ownerPhoneOk;
  // Edit mode: whether the invitation has expired (lib/expiry.ts).
  const [expiry, setExpiry] = useState<{ expiresAt: number | null; expired: boolean } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const sameCategoryTemplates = getTemplatesByCategory(template.category, tTemplates);
  const storyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditMode || !editSlug || !editToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/invitation/${editSlug}?token=${encodeURIComponent(editToken)}`
        );
        if (!res.ok) throw new Error(t("errEditLinkInvalid"));
        const json = await res.json();
        if (cancelled) return;
        const loaded = json.invitation as InvitationData;
        setSavedDate(loaded.weddingDate);
        setExpiry(json.expiry ?? null);
        if (loaded.templateId !== templateId) {
          // Opened through the design switcher: keep the content, take the
          // new template's colours and fonts.
          const next = getTemplateMeta(templateId, tTemplates);
          setDraftNotice({ kind: "carried", from: getTemplateMeta(loaded.templateId, tTemplates).name });
          setData({ ...loaded, templateId, accentColor: next.defaultAccent, fontPairing: next.defaultFont });
        } else {
          setData(loaded);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : t("errLoadFailed"));
        }
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editSlug, editToken]);

  useEffect(() => {
    const id = setTimeout(() => setToday(todayIso()), 0);
    return () => clearTimeout(id);
  }, []);

  // New invitations: read back this device's draft for the category, from
  // this template or (after a design switch) another one.
  useEffect(() => {
    if (isEditMode) return;
    const id = setTimeout(() => {
      const draft = loadDraft(template.category);
      if (draft && sameCategoryTemplates.some((tpl) => tpl.id === draft.templateId)) {
        const base = {
          ...getDefaultInvitationData(templateId, contentT(contentMessages, draft.contentLocale, "defaultContent")),
          contentLocale: draft.contentLocale,
        };
        const fields = { ...draft.fields };
        if (draft.templateId !== templateId) {
          for (const k of TEMPLATE_STYLE_KEYS) delete fields[k];
        }
        setData({ ...base, ...fields, templateId });
        setDraftId(draft.draftId);
        setStoryPreset(draft.storyPreset);
        setDraftNotice(
          draft.templateId === templateId
            ? { kind: "restored" }
            : { kind: "carried", from: getTemplateMeta(draft.templateId, tTemplates).name }
        );
      }
      setDraftReady(true);
    }, 0);
    return () => clearTimeout(id);
    // Once per editor load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistDraft() {
    if (isEditMode || !draftReady) return;
    saveDraft(template.category, {
      templateId,
      draftId,
      contentLocale,
      storyPreset,
      fields: changedFields(data, seed),
    });
  }
  const persistRef = useRef(persistDraft);
  useEffect(() => {
    persistRef.current = persistDraft;
  });
  useEffect(() => {
    if (isEditMode || !draftReady) return;
    const id = setTimeout(() => persistRef.current(), 500);
    return () => clearTimeout(id);
  }, [data, storyPreset, draftReady, isEditMode]);
  // Don't lose the last half-second of typing when the tab closes.
  useEffect(() => {
    const flush = () => persistRef.current();
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  function startFresh() {
    if (!window.confirm(t("startFreshConfirm"))) return;
    clearDraft(template.category);
    setData({ ...seed, contentLocale: uiLocale });
    setStoryPreset(null);
    setDraftId(generateDraftId());
    setDraftNotice(null);
  }

  function update<K extends keyof InvitationData>(key: K, value: InvitationData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function fillStoryWith(tp: ContentT, tc: ContentT, id: string, a: string, b: string) {
    return tp(`${template.category}.${id}.text`, {
      a: a.trim() || (category.singlePerson ? tc("youFallback") : tc("brideFallback")),
      b: b.trim() || tc("groomFallback"),
    });
  }
  function fillStory(id: string, a: string, b: string) {
    return fillStoryWith(tPresets, tCommon, id, a, b);
  }

  function switchContentLocale(next: ContentLocale) {
    if (next === contentLocale) return;
    const oldSeed = getDefaultInvitationData(
      templateId,
      contentT(contentMessages, contentLocale, "defaultContent")
    );
    const newSeed = getDefaultInvitationData(
      templateId,
      contentT(contentMessages, next, "defaultContent")
    );
    const nextPresets = contentT(contentMessages, next, "storyPresets");
    const nextCommon = contentT(contentMessages, next, "common");
    setData((d) => {
      const out: InvitationData = { ...d, contentLocale: next };
      for (const key of SEED_KEYS) {
        if (JSON.stringify(d[key]) === JSON.stringify(oldSeed[key])) {
          Object.assign(out, { [key]: newSeed[key] });
        }
      }
      if (storyPreset && d.story === fillStory(storyPreset, d.brideName, d.groomName)) {
        out.story = fillStoryWith(nextPresets, nextCommon, storyPreset, out.brideName, out.groomName);
      }
      return out;
    });
  }

  /** A name edit also re-fills an untouched ready-made story, so picking a
   * story before typing the names still ends up with the right names in it. */
  function updateName(key: "brideName" | "groomName", value: string) {
    setData((d) => {
      const next = { ...d, [key]: value };
      if (storyPreset && d.story === fillStory(storyPreset, d.brideName, d.groomName)) {
        next.story = fillStory(storyPreset, next.brideName, next.groomName);
      }
      return next;
    });
  }

  function storyIsOwnWords() {
    const current = data.story.trim();
    if (!current || data.story === seedStory) return false;
    return !(storyPreset && data.story === fillStory(storyPreset, data.brideName, data.groomName));
  }

  function chooseStory(id: string) {
    const title = tPresets(`${template.category}.${id}.title`);
    if (storyIsOwnWords() && !window.confirm(t("storyReplaceConfirm", { title }))) return;
    setStoryPreset(id);
    update("story", fillStory(id, data.brideName, data.groomName));
  }

  function writeOwnStory() {
    if (storyIsOwnWords() && !window.confirm(t("storyClearConfirm"))) return;
    setStoryPreset(null);
    update("story", "");
    storyRef.current?.focus();
  }

  /** Keeps the legacy one-line parents field in step with the structured
   * list, for anything still reading brideParents/groomParents. */
  function updateFamily(side: FamilySide, update: FamilyUpdate) {
    setData((d) => {
      const prev = (side === "bride" ? d.brideFamily : d.groomFamily) ?? getFamily(d, side);
      const members = update(prev);
      return side === "bride"
        ? { ...d, brideFamily: members, brideParents: legacyParentsLine(members) }
        : { ...d, groomFamily: members, groomParents: legacyParentsLine(members) };
    });
  }

  function updateMonogram(key: "a" | "b", value: string) {
    setData((d) => ({ ...d, monogram: { ...(d.monogram ?? EMPTY_MONOGRAM), [key]: value } }));
  }
  function updateVenue(
    which: "ceremonyVenue" | "receptionVenue",
    field: "name" | "address" | "mapsLink",
    value: string
  ) {
    setData((d) => ({ ...d, [which]: { ...d[which], [field]: value } }));
  }
  function updateSection(key: keyof InvitationData["sections"], value: boolean) {
    setData((d) => ({ ...d, sections: { ...d.sections, [key]: value } }));
  }
  function updateFaq(index: number, field: "question" | "answer", value: string) {
    setData((d) => {
      const faq = [...d.faq];
      faq[index] = { ...faq[index], [field]: value };
      return { ...d, faq };
    });
  }
  function addFaqItem() {
    setData((d) =>
      d.faq.length >= 4 ? d : { ...d, faq: [...d.faq, { question: "", answer: "" }] }
    );
  }
  function removeFaqItem(index: number) {
    setData((d) => ({ ...d, faq: d.faq.filter((_, i) => i !== index) }));
  }

  /** A picked photo goes through the cropper first (see uploadPhoto). */
  function pickPhoto(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(t("errImageFile"));
      return;
    }
    setCropFile(file);
  }

  async function uploadPhoto(blob: Blob) {
    setCropFile(null);
    // Cropped output is a small JPEG; only an undecodable original (sent
    // as-is) can still be over the storage limit.
    if (blob.size > 8 * 1024 * 1024) {
      alert(t("errImageSize"));
      return;
    }
    const index = data.photos.length;
    setUploadingIndex(index);
    try {
      // A unique name per upload: slots move around when photos are
      // reordered or removed, so an index-based name could overwrite a
      // photo that's still in use.
      const name = `photo-${uniqueSuffix()}.jpg`;
      const storageRef = ref(storage, `invitations/${draftId}/${name}`);
      await uploadBytes(storageRef, blob, { contentType: blob.type || "image/jpeg" });
      const url = await getDownloadURL(storageRef);
      setData((d) => (d.photos.length >= 6 ? d : { ...d, photos: [...d.photos.filter(Boolean), url] }));
    } catch (err) {
      console.error(err);
      alert(t("errPhotoUpload"));
    } finally {
      setUploadingIndex(null);
    }
  }

  // Files stay in Storage (the rules don't allow client deletes); the
  // photo just leaves the invitation.
  function removePhoto(index: number) {
    setData((d) => ({ ...d, photos: d.photos.filter((_, i) => i !== index) }));
  }

  function movePhoto(index: number, by: -1 | 1) {
    setData((d) => {
      const to = index + by;
      if (to < 0 || to >= d.photos.length) return d;
      const photos = [...d.photos];
      [photos[index], photos[to]] = [photos[to], photos[index]];
      return { ...d, photos };
    });
  }

  async function handleMusicChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      alert(t("errAudioFile"));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert(t("errAudioSize"));
      return;
    }
    setUploadingMusic(true);
    try {
      // Unique per upload, like photos: storage rules only allow creating files.
      const storageRef = ref(storage, `invitations/${draftId}/music-${uniqueSuffix()}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      update("backgroundMusic", url);
    } catch (err) {
      console.error(err);
      alert(t("errAudioUpload"));
    } finally {
      setUploadingMusic(false);
    }
  }

  // The file stays in Storage (clients can't delete); the invitation just
  // stops using it.
  function removeMusic() {
    update("backgroundMusic", "");
  }

  const initials = resolveMonogram(data.brideName, data.groomName, data.monogram, false);
  const monogramText = [initials.a, initials.b].filter(Boolean).join(" & ");

  const dateOk =
    !today ||
    isDateAllowed(data.weddingDate, {
      allowPast: category.allowPastDate,
      earliest: today,
      saved: savedDate,
    });

  const canSubmit =
    Boolean(data.brideName.trim() && (category.singlePerson || data.groomName.trim())) &&
    !publishing;

  async function handleSaveEdit() {
    if (!editSlug || !editToken) return;
    if (!dateOk) {
      // The message is already shown under the date field; take them there.
      dateRef.current?.focus();
      return;
    }
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/invitation/${editSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token: editToken }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? t("errSaveFailed"));
      }
      router.push(`/invite/${editSlug}`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : t("errSaveFailed"));
      setPublishing(false);
    }
  }

  /** Pays ₹50 to bring an expired invitation back for 30 more days. */
  async function handleRestore() {
    if (!editSlug || !editToken) return;
    setRestoring(true);
    setPublishError(null);
    try {
      const orderRes = await fetch("/api/restore-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editSlug, token: editToken }),
      });
      if (!orderRes.ok) {
        const j = await orderRes.json().catch(() => ({}));
        throw new Error(j.error ?? t("errPaymentStart"));
      }
      const order = await orderRes.json();
      if (!window.Razorpay) throw new Error(t("errPaymentLibrary"));
      const rz = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: SITE.name,
        description: t("restoreCheckoutDescription"),
        theme: { color: data.accentColor },
        handler: async (response) => {
          try {
            const res = await fetch("/api/verify-restore", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug: editSlug, token: editToken, ...response }),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              throw new Error(j.error ?? t("errPaymentVerifyFailed"));
            }
            const { expiresAt } = await res.json();
            setExpiry({ expiresAt, expired: false });
          } catch (err) {
            setPublishError(err instanceof Error ? err.message : t("errPaymentVerifyFailed"));
          } finally {
            setRestoring(false);
          }
        },
        modal: { ondismiss: () => setRestoring(false) },
      });
      rz.on("payment.failed", () => {
        setPublishError(t("errPaymentFailed"));
        setRestoring(false);
      });
      rz.open();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : t("errGeneric"));
      setRestoring(false);
    }
  }

  /** Checks what Publish needs and says what's missing, instead of a
   * silently disabled button. */
  function tryPublish() {
    setPublishError(null);
    if (!data.brideName.trim() || (!category.singlePerson && !data.groomName.trim())) {
      setPublishError(t("errNamesRequired"));
      return;
    }
    if (!dateOk) {
      // The message is already shown under the date field; take them there.
      dateRef.current?.focus();
      return;
    }
    if (!ownerPhoneOk) {
      setPhoneTouched(true);
      phoneRef.current?.focus();
      return;
    }
    if (!razorpayReady || !window.Razorpay) {
      setPublishError(t("errPaymentLoading"));
      return;
    }
    handlePublish();
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const draftRes = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId, ...data, ownerPhone, ownerLocale: uiLocale }),
      });
      if (!draftRes.ok) {
        const j = await draftRes.json().catch(() => ({}));
        throw new Error(j.error ?? t("errDraftSaveFailed"));
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      if (!orderRes.ok) {
        const j = await orderRes.json().catch(() => ({}));
        throw new Error(j.error ?? t("errPaymentStart"));
      }
      const order = await orderRes.json();

      if (!window.Razorpay) {
        throw new Error(t("errPaymentLibrary"));
      }

      const rz = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: SITE.name,
        description: category.singlePerson
          ? `${data.brideName} — ${template.name}`
          : `${data.brideName} & ${data.groomName} — ${template.name}`,
        theme: { color: data.accentColor },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ draftId, ...response }),
            });
            if (!verifyRes.ok) {
              const j = await verifyRes.json().catch(() => ({}));
              throw new Error(j.error ?? t("errPaymentVerifyFailed"));
            }
            const { slug, editToken: newToken, sent } = await verifyRes.json();
            clearDraft(template.category);
            try {
              // For the popup's "send to myself" buttons; never put in the URL.
              sessionStorage.setItem(OWNER_PHONE_KEY, ownerPhone);
            } catch {
              // Not critical — the buttons just open without a number.
            }
            router.push(
              `/invite/${slug}?welcome=1&editToken=${encodeURIComponent(newToken)}&templateId=${encodeURIComponent(templateId)}${sent ? `&sent=${sent}` : ""}`
            );
          } catch (err) {
            setPublishError(err instanceof Error ? err.message : t("errPaymentVerifyFailed"));
            setPublishing(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the checkout without paying — stay on the editor.
            setPublishing(false);
          },
        },
      });
      rz.on("payment.failed", () => {
        setPublishError(t("errPaymentFailed"));
        setPublishing(false);
      });
      rz.open();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : t("errGeneric"));
      setPublishing(false);
    }
  }

  return (
    <div className="flex h-dvh flex-col lg:flex-row">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        // onReady, not onLoad: onLoad fires only the first time the script
        // loads, so coming back to the editor (client-side navigation) left
        // the Pay button waiting forever. onReady also runs on every mount.
        onReady={() => setRazorpayReady(true)}
      />

      {/* Form panel */}
      <div
        className={`flex-1 flex-col overflow-hidden lg:flex lg:w-[440px] lg:flex-none lg:border-r lg:border-neutral-200 dark:lg:border-neutral-800 ${
          mobileView === "preview" ? "hidden lg:flex" : "flex"
        }`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase">
              {template.name}
            </p>
            <h1 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {isEditMode ? t("editHeading") : t("createHeading")}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {isEditMode && editSlug && editToken && (
              <Link
                href={`/rsvps/${editSlug}?token=${editToken}`}
                className="text-xs font-semibold hover:underline"
                style={{ color: data.accentColor }}
              >
                {t("viewRsvps")}
              </Link>
            )}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 [&::-webkit-details-marker]:hidden">
                {t("switchTemplate")}
                <ChevronDown size={13} className="transition group-open:rotate-180" aria-hidden />
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                <p className="px-2 pt-1 pb-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {t("switchTemplateHint")}
                </p>
                <ul className="max-h-72 overflow-y-auto">
                  {sameCategoryTemplates.map((tpl) => (
                    <li key={tpl.id}>
                      {tpl.id === templateId ? (
                        <span className="flex items-center justify-between rounded-lg bg-neutral-100 px-2 py-1.5 text-sm font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
                          {tpl.name}
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-500 uppercase">
                            <Check size={12} aria-hidden />
                            {t("currentTemplate")}
                          </span>
                        </span>
                      ) : (
                        <Link
                          href={
                            isEditMode
                              ? `/create/${tpl.id}?edit=${editSlug}&token=${editToken}`
                              : `/create/${tpl.id}`
                          }
                          onClick={() => persistDraft()}
                          className="block rounded-lg px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                          {tpl.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/"
                  className="mt-1 block border-t border-neutral-100 px-2 pt-2 text-xs text-neutral-400 hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                  {t("changeTemplate")}
                </Link>
              </div>
            </details>
          </div>
        </header>

        {loadingExisting ? (
          <div className="p-6 text-sm text-neutral-500">{t("loading")}</div>
        ) : loadError ? (
          <div className="p-6 text-sm text-red-600">{loadError}</div>
        ) : (
          <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
            {draftNotice && (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                <p>
                  {draftNotice.kind === "restored"
                    ? t("draftRestored")
                    : t("draftCarried", { template: draftNotice.from })}
                </p>
                {!isEditMode && (
                  <button type="button" onClick={startFresh} className="shrink-0 font-semibold underline">
                    {t("startFresh")}
                  </button>
                )}
              </div>
            )}
            <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t("contentLocaleTitle")}
                </span>
                <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-900">
                  {(["en", "ta"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      lang={l}
                      onClick={() => switchContentLocale(l)}
                      aria-pressed={contentLocale === l}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                        contentLocale === l
                          ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
                          : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      }`}
                    >
                      {l === "en" ? "English" : "தமிழ்"}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("contentLocaleHint")}</p>
              {contentLocale === "ta" && !data.fontPairing.startsWith("tamil") && (
                <button
                  type="button"
                  onClick={() => update("fontPairing", "tamil-classic")}
                  className="text-xs font-semibold text-amber-700 hover:underline dark:text-amber-500"
                >
                  {t("useTamilFont")}
                </button>
              )}
            </div>

            <FormSection title={category.singlePerson ? t("sectionAboutYou") : t("sectionCouple")}>
              <Field label={category.personALabel}>
                <input
                  className={inputClass}
                  value={data.brideName}
                  onChange={(e) => updateName("brideName", e.target.value)}
                  placeholder={t("namePlaceholderA")}
                />
              </Field>
              {!category.singlePerson && (
                <Field label={category.personBLabel}>
                  <input
                    className={inputClass}
                    value={data.groomName}
                    onChange={(e) => updateName("groomName", e.target.value)}
                    placeholder={t("namePlaceholderB")}
                  />
                </Field>
              )}
              {template.category === "wedding" && (
                <div className="space-y-2 rounded-lg border border-dashed border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {t("monogramTitle")}
                    </span>
                    <span
                      className="rounded-md bg-neutral-900 px-2.5 py-1 text-sm text-amber-200 dark:bg-neutral-800"
                      style={{ fontFamily: FONT_PAIRINGS.find((f) => f.id === data.fontPairing)?.headingVar }}
                      title={t("monogramPreview")}
                      lang={scriptLang(monogramText)}
                    >
                      {monogramText}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 items-end gap-3">
                    <Field label={t("monogramFirst")}>
                      <input
                        className={inputClass}
                        value={data.monogram?.a ?? ""}
                        maxLength={8}
                        onChange={(e) => updateMonogram("a", e.target.value)}
                        placeholder={firstGrapheme(data.brideName)}
                      />
                    </Field>
                    <Field label={t("monogramSecond")}>
                      <input
                        className={inputClass}
                        value={data.monogram?.b ?? ""}
                        maxLength={8}
                        onChange={(e) => updateMonogram("b", e.target.value)}
                        placeholder={firstGrapheme(data.groomName)}
                      />
                    </Field>
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("monogramHint")}</p>
                </div>
              )}
            </FormSection>

            <FormSection title={category.dateLabel}>
              <Field label={t("dateFieldLabel")}>
                <input
                  ref={dateRef}
                  type="date"
                  className={`${inputClass} ${dateOk ? "" : "border-red-400 dark:border-red-500"}`}
                  value={data.weddingDate}
                  // The picker won't offer past days (a proposal's date may be past).
                  min={category.allowPastDate || !today ? undefined : today}
                  onChange={(e) => update("weddingDate", e.target.value)}
                  aria-invalid={!dateOk}
                  aria-describedby={dateOk ? undefined : "date-error"}
                />
              </Field>
              {!dateOk && (
                <p id="date-error" className="text-xs text-red-600 dark:text-red-400">
                  {t("errDatePast")}
                </p>
              )}
            </FormSection>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                  {t("eventSchedule")}
                </h2>
                <SectionToggle
                  enabled={data.sections.schedule}
                  onChange={(v) => updateSection("schedule", v)}
                />
              </div>
              <div
                className={`space-y-8 transition-opacity ${!data.sections.schedule ? "opacity-45" : ""}`}
              >
                <FormSection title={category.eventALabel}>
                  <Field label={t("timeLabel")}>
                    <input
                      className={inputClass}
                      value={data.ceremonyTime}
                      onChange={(e) => update("ceremonyTime", e.target.value)}
                      placeholder={t("ceremonyPlaceholderTime")}
                    />
                  </Field>
                  <Field label={t("venueNameLabel")}>
                    <input
                      className={inputClass}
                      value={data.ceremonyVenue.name}
                      onChange={(e) => updateVenue("ceremonyVenue", "name", e.target.value)}
                      placeholder={t("ceremonyPlaceholderVenue")}
                    />
                  </Field>
                  <Field label={t("addressLabel")}>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={data.ceremonyVenue.address}
                      onChange={(e) => updateVenue("ceremonyVenue", "address", e.target.value)}
                      placeholder={t("ceremonyPlaceholderAddress")}
                    />
                  </Field>
                  <Field label={t("mapsLinkLabel")}>
                    <input
                      type="url"
                      className={inputClass}
                      value={data.ceremonyVenue.mapsLink ?? ""}
                      onChange={(e) => updateVenue("ceremonyVenue", "mapsLink", e.target.value)}
                      placeholder={t("mapsPlaceholder")}
                    />
                  </Field>
                </FormSection>

                {category.eventBLabel && (
                  <FormSection title={category.eventBLabel}>
                    <Field label={t("timeLabel")}>
                      <input
                        className={inputClass}
                        value={data.receptionTime}
                        onChange={(e) => update("receptionTime", e.target.value)}
                        placeholder={t("receptionPlaceholderTime")}
                      />
                    </Field>
                    <Field label={t("venueNameLabel")}>
                      <input
                        className={inputClass}
                        value={data.receptionVenue.name}
                        onChange={(e) => updateVenue("receptionVenue", "name", e.target.value)}
                        placeholder={t("receptionPlaceholderVenue")}
                      />
                    </Field>
                    <Field label={t("addressLabel")}>
                      <textarea
                        className={inputClass}
                        rows={2}
                        value={data.receptionVenue.address}
                        onChange={(e) => updateVenue("receptionVenue", "address", e.target.value)}
                        placeholder={t("receptionPlaceholderAddress")}
                      />
                    </Field>
                    <Field label={t("mapsLinkLabel")}>
                      <input
                        type="url"
                        className={inputClass}
                        value={data.receptionVenue.mapsLink ?? ""}
                        onChange={(e) =>
                          updateVenue("receptionVenue", "mapsLink", e.target.value)
                        }
                        placeholder={t("mapsPlaceholder")}
                      />
                    </Field>
                  </FormSection>
                )}
              </div>
            </div>

            <FormSection
              title={category.storyTitle}
              toggle={{ enabled: data.sections.story, onChange: (v) => updateSection("story", v) }}
            >
              <StoryPicker
                options={(STORY_PRESETS[template.category] ?? []).map((id) => ({
                  id,
                  title: tPresets(`${template.category}.${id}.title`),
                  tag: tPresets(`${template.category}.${id}.tag`),
                  preview: fillStory(id, data.brideName, data.groomName),
                }))}
                selectedId={
                  storyPreset && data.story === fillStory(storyPreset, data.brideName, data.groomName)
                    ? storyPreset
                    : null
                }
                onChoose={chooseStory}
                onWriteOwn={writeOwnStory}
              />
              <textarea
                ref={storyRef}
                className={inputClass}
                rows={6}
                lang={scriptLang(data.story)}
                value={data.story}
                onChange={(e) => update("story", e.target.value)}
                placeholder={t("storyPlaceholder")}
              />
            </FormSection>

            {category.familyTitle && (
              <FormSection
                title={category.familyTitle}
                toggle={{
                  enabled: data.sections.family,
                  onChange: (v) => updateSection("family", v),
                }}
              >
                <FamilyFields
                  brideHeading={t("familySideOf", {
                    name: data.brideName.trim() || category.personALabel,
                  })}
                  groomHeading={t("familySideOf", {
                    name: data.groomName.trim() || category.personBLabel,
                  })}
                  brideMembers={data.brideFamily ?? getFamily(data, "bride")}
                  groomMembers={data.groomFamily ?? getFamily(data, "groom")}
                  onChange={updateFamily}
                />
              </FormSection>
            )}

            <FormSection
              title={t("photoGallery")}
              toggle={{
                enabled: data.sections.gallery,
                onChange: (v) => updateSection("gallery", v),
              }}
            >
              <div className="grid grid-cols-3 gap-3">
                {data.photos.filter(Boolean).map((url, i, all) => (
                  <PhotoTile
                    key={url}
                    index={i}
                    count={all.length}
                    url={url}
                    onRemove={removePhoto}
                    onMove={movePhoto}
                  />
                ))}
                {data.photos.filter(Boolean).length < 6 && (
                  <AddPhotoTile
                    index={data.photos.filter(Boolean).length}
                    uploading={uploadingIndex !== null}
                    onPick={pickPhoto}
                  />
                )}
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("photoGalleryHint")}</p>
              {data.photos.filter(Boolean).length > 1 && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("photoOrderHint")}</p>
              )}
              {cropFile && (
                <PhotoCropper file={cropFile} onCancel={() => setCropFile(null)} onApply={uploadPhoto} />
              )}
            </FormSection>

            <FormSection
              title={t("guestPhotosTitle")}
              toggle={{
                enabled: data.sections.guestPhotos,
                onChange: (v) => updateSection("guestPhotos", v),
              }}
            >
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("guestPhotosHint")}</p>
            </FormSection>

            <FormSection
              title={t("thingsToKnowTitle")}
              toggle={{ enabled: data.sections.faq, onChange: (v) => updateSection("faq", v) }}
            >
              <div className="space-y-4">
                {data.faq.map((item, i) => (
                  <div key={i} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                        {t("questionLabel", { n: i + 1 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaqItem(i)}
                        className="text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400"
                        aria-label={t("removeQuestion")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      className={`${inputClass} mb-2`}
                      value={item.question}
                      onChange={(e) => updateFaq(i, "question", e.target.value)}
                      placeholder={t("questionPlaceholder")}
                    />
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={item.answer}
                      onChange={(e) => updateFaq(i, "answer", e.target.value)}
                      placeholder={t("answerPlaceholder")}
                    />
                  </div>
                ))}
              </div>
              {data.faq.length < 4 && (
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  <Plus size={14} />
                  {t("addQuestion", { count: data.faq.length })}
                </button>
              )}
            </FormSection>

            {/* Only the wedding (royal palace) layout renders these sections. */}
            {template.category === "wedding" && (
              <>
                <FormSection
                  title={t("travelTitle")}
                  toggle={{ enabled: data.sections.travel, onChange: (v) => updateSection("travel", v) }}
                >
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("travelHint")}</p>
                  <TravelFields
                    value={data.travel ?? EMPTY_TRAVEL}
                    onChange={(v) => update("travel", v)}
                  />
                </FormSection>

                <FormSection
                  title={t("placesTitle")}
                  toggle={{ enabled: data.sections.places, onChange: (v) => updateSection("places", v) }}
                >
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("placesHint")}</p>
                  <PlacesFields value={data.places ?? []} onChange={(v) => update("places", v)} />
                </FormSection>
              </>
            )}

            <FormSection
              title={t("guestRsvpTitle")}
              toggle={{ enabled: data.sections.rsvp, onChange: (v) => updateSection("rsvp", v) }}
            >
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("guestRsvpHint")}</p>
            </FormSection>

            <FormSection title={t("musicTitle")}>
              {data.backgroundMusic ? (
                <div className="space-y-2">
                  <audio controls src={data.backgroundMusic} className="w-full" />
                  <button
                    type="button"
                    onClick={removeMusic}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    {t("removeTrack")}
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500 hover:border-neutral-400">
                  {uploadingMusic ? t("uploading") : t("uploadAudio")}
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={uploadingMusic}
                    onChange={(e) => handleMusicChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("musicHint")}</p>
            </FormSection>

            <FormSection title={t("accentColorTitle")}>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update("accentColor", c)}
                    className="h-8 w-8 rounded-full border-2"
                    style={{
                      backgroundColor: c,
                      borderColor: data.accentColor === c ? "#0a0a0a" : "transparent",
                    }}
                    aria-label={t("accentColorAria", { color: c })}
                  />
                ))}
                <input
                  type="color"
                  value={data.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-neutral-300 bg-transparent p-0"
                  aria-label={t("customAccentAria")}
                />
              </div>
            </FormSection>

            <FormSection title={t("fontPairingTitle")}>
              <div className="grid grid-cols-2 gap-2">
                {FONT_PAIRINGS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => update("fontPairing", f.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      data.fontPairing === f.id
                        ? "border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-800"
                        : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                    }`}
                  >
                    <span style={{ fontFamily: f.headingVar }} className="block text-base">
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            </FormSection>
          </div>
        )}

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          {isEditMode && expiry?.expired && (
            <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="font-semibold">{t("expiredBannerTitle")}</p>
              <p className="mt-1 text-xs">{t("expiredBannerBody")}</p>
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring || !razorpayReady}
                className="mt-2 w-full rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
              >
                {restoring ? t("processing") : t("restoreCta")}
              </button>
            </div>
          )}
          {isEditMode && expiry && !expiry.expired && expiry.expiresAt && (
            <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t("liveUntil", {
                date: new Intl.DateTimeFormat(uiLocale === "ta" ? "ta-IN" : "en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                }).format(expiry.expiresAt),
              })}
            </p>
          )}
          {!isEditMode && (
            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("ownerPhoneLabel")}
              </span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                ref={phoneRef}
                className={`${inputClass} ${showPhoneError ? "border-red-400 dark:border-red-500" : ""}`}
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                onBlur={() => ownerPhone && setPhoneTouched(true)}
                placeholder={t("ownerPhonePlaceholder")}
                aria-invalid={showPhoneError}
                aria-describedby="owner-phone-hint"
              />
              <span
                id="owner-phone-hint"
                className={`mt-1 block text-xs ${
                  showPhoneError ? "text-red-600 dark:text-red-400" : "text-neutral-400 dark:text-neutral-500"
                }`}
              >
                {showPhoneError
                  ? ownerPhone
                    ? t("ownerPhoneInvalid")
                    : t("ownerPhoneRequired")
                  : t("ownerPhoneHint")}
              </span>
            </label>
          )}
          {publishError && <p className="mb-2 text-sm text-red-600">{publishError}</p>}
          {isEditMode ? (
            <button
              onClick={handleSaveEdit}
              disabled={!canSubmit}
              style={{ backgroundColor: data.accentColor }}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {publishing ? t("saving") : t("saveChanges")}
            </button>
          ) : (
            <button
              onClick={tryPublish}
              disabled={publishing}
              style={{ backgroundColor: data.accentColor }}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {publishing ? t("processing") : t("publishCta", { price: PRICE_INR })}
            </button>
          )}
        </div>
      </div>

      {/* Live preview panel */}
      <div
        className={`flex-1 flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-950 ${
          mobileView === "edit" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="hidden items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-2 backdrop-blur lg:flex dark:border-neutral-800 dark:bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
              {t("previewLabel")}
            </p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <RotateCcw size={13} aria-hidden />
              {t("replayIntro")}
            </button>
          </div>
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
            {[
              { id: "desktop", label: t("desktop"), icon: Monitor },
              { id: "tablet", label: t("tablet"), icon: Tablet },
              { id: "mobile", label: t("mobile"), icon: Smartphone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreviewDevice(id as typeof previewDevice)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition ${
                  previewDevice === id
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
                aria-pressed={previewDevice === id}
              >
                <Icon size={14} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div
            className={`mx-auto min-h-full bg-white shadow-sm transition-[max-width] duration-300 dark:bg-neutral-900 ${
              previewDevice === "mobile"
                ? "max-w-[390px]"
                : previewDevice === "tablet"
                  ? "max-w-[768px]"
                  : "max-w-none"
            }`}
          >
            <NextIntlClientProvider
              locale={contentLocale}
              messages={contentMessages[contentLocale]}
              timeZone={timeZone}
            >
              <div lang={contentLocale}>
                <InvitationView data={data} slug={editSlug ?? "preview"} mode="preview" />
              </div>
            </NextIntlClientProvider>
          </div>
        </div>
      </div>

      {/* Mobile edit/preview toggle */}
      <div className="flex border-t border-neutral-200 bg-white lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-3 text-sm font-semibold ${
            mobileView === "edit" ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-400 dark:text-neutral-600"
          }`}
        >
          {t("editTab")}
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-sm font-semibold ${
            mobileView === "preview" ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-400 dark:text-neutral-600"
          }`}
        >
          {t("previewTab")}
        </button>
      </div>
    </div>
  );
}

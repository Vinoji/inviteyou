"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookHeart,
  CalendarCheck,
  Camera,
  HelpCircle,
  Images,
  Landmark,
  MapPin,
  Monitor,
  Music,
  Palette,
  Plane,
  RotateCcw,
  Smartphone,
  Sparkles,
  Tablet,
  UsersRound,
} from "lucide-react";
import {
  NextIntlClientProvider,
  createTranslator,
  useLocale,
  useTimeZone,
  useTranslations,
  type AbstractIntlMessages,
} from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getTemplateMeta, getTemplatesByCategory } from "@/lib/i18n/templates";
import { TEMPLATE_STYLE_KEYS, changedFields, clearDraft, loadDraft, saveDraft } from "@/lib/draftStore";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { getDefaultInvitationData } from "@/lib/i18n/defaultContent";
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
import type { NearbySuggestion as NearbyResult } from "@/lib/geo";
import { getFamily, legacyParentsLine } from "@/lib/family";
import { STORY_PRESETS } from "@/lib/storyPresets";
import { templatePriceInr } from "@/lib/pricing";
import { firstGrapheme, resolveMonogram, scriptLang } from "@/lib/monogram";
import InvitationView from "@/components/invite/InvitationView";
import { FormSection, Field, inputClass, SectionToggle } from "@/components/editor/FormFields";
import { StepNav, StepHeader, StepFooter, type EditorStep } from "@/components/editor/StepNav";
import {
  ColorPicker,
  FontPicker,
  LanguagePicker,
  TemplatePicker,
  type DesignOption,
} from "@/components/editor/DesignPickers";
import ExtraCard from "@/components/editor/ExtraCard";
import EventFields from "@/components/editor/EventFields";
import FaqFields from "@/components/editor/FaqFields";
import VenueSearch, { type VenueHit } from "@/components/editor/VenueSearch";
import NearbyFill, { type NearbyState } from "@/components/editor/NearbyFill";
import PublishOverlay, { type PublishPhase } from "@/components/editor/PublishOverlay";
import { pinUrl } from "@/lib/maps";
import { forceFullMotion, primeFullMotion, useSavedReducedMotion } from "@/lib/motionPref";
import { AddPhotoTile, PhotoTile } from "@/components/editor/PhotoSlot";
import PhotoCropper from "@/components/editor/PhotoCropper";
import TravelFields from "@/components/editor/TravelFields";
import PlacesFields from "@/components/editor/PlacesFields";
import StoryPicker from "@/components/editor/StoryPicker";
import FamilyFields, { type FamilyUpdate } from "@/components/editor/FamilyFields";
import { REPLAY_INTRO_EVENT } from "@/components/invite/intros/events";
import { Thoranam } from "@/components/site/festive";
import festive from "@/components/landing/landing.module.css";

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

/** Progress steps for saving edits and for renewing an expired invitation
 * (publishing uses PublishOverlay's full list). */
const SAVE_STEPS: PublishPhase[] = ["saving", "opening"];
const RESTORE_STEPS: PublishPhase[] = ["checkout", "verifying"];

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
  designs,
}: {
  templateId: string;
  editSlug: string | null;
  editToken: string | null;
  /** Invitation-language messages for both locales (see page.tsx). */
  contentMessages: Record<ContentLocale, AbstractIntlMessages>;
  /** This occasion's designs, for the design picker. */
  designs: DesignOption[];
}) {
  const router = useRouter();
  const t = useTranslations("editor");
  // The preview and design cards always play in full here (lib/motionPref).
  // Switched on during the first render, before the preview reads it, so
  // it never starts out frozen.
  useState(() => {
    if (typeof window !== "undefined") primeFullMotion();
  });
  useEffect(() => {
    forceFullMotion(true);
    return () => forceFullMotion(false);
  }, []);
  const motionReducedElsewhere = useSavedReducedMotion();
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
  // The full-screen progress for publish / save / restore (PublishOverlay).
  const [progress, setProgress] = useState<{ phase: PublishPhase; steps?: PublishPhase[] } | null>(null);
  const showProgress = (phase: PublishPhase, steps?: PublishPhase[]) => setProgress({ phase, steps });
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
  // Which part of the form is open. A design switch comes back to the
  // design step (?step=design); otherwise start with the names.
  const searchParams = useSearchParams();
  const [step, setStep] = useState(() => (searchParams.get("step") === "design" ? "design" : "names"));
  const formScrollRef = useRef<HTMLDivElement>(null);
  function goTo(id: string) {
    setStep(id);
    formScrollRef.current?.scrollTo({ top: 0 });
  }

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
  /** A venue picked on the map: its name, address and pin. */
  function pinVenue(which: "ceremonyVenue" | "receptionVenue", hit: VenueHit) {
    setData((d) => ({
      ...d,
      [which]: { name: hit.name, address: hit.address, mapsLink: pinUrl(hit.lat, hit.lng), lat: hit.lat, lng: hit.lng },
    }));
  }
  function unpinVenue(which: "ceremonyVenue" | "receptionVenue") {
    setData((d) => {
      // The map link came from the pin, so it goes with it.
      const { lat, lng, ...rest } = d[which];
      const fromPin = lat !== undefined && lng !== undefined && rest.mapsLink === pinUrl(lat, lng);
      return { ...d, [which]: { ...rest, mapsLink: fromPin ? "" : rest.mapsLink } };
    });
  }
  function mapSearchFor(which: "ceremonyVenue" | "receptionVenue") {
    const v = data[which];
    return (
      <VenueSearch
        key={`${which}-${v.lat ?? "none"}`}
        // "Venue, Town" — the last part of the address is usually the town.
        initialQuery={[v.name, v.address.split(",").at(-1)?.trim()].filter(Boolean).join(", ")}
        locale={contentLocale}
        pinned={typeof v.lat === "number" && typeof v.lng === "number" ? { lat: v.lat, lng: v.lng } : null}
        onPick={(hit) => pinVenue(which, hit)}
        onUnpin={() => unpinVenue(which)}
      />
    );
  }

  // Travel / Places suggestions from the venue's pin (app/api/geo/nearby).
  const [nearbyState, setNearbyState] = useState<Record<"travel" | "places", NearbyState>>({
    travel: "idle",
    places: "idle",
  });
  const nearbyCache = useRef<{ key: string; value: NearbyResult } | null>(null);
  async function fillFromVenue(what: "travel" | "places") {
    const pinned = [data.ceremonyVenue, data.receptionVenue].find(
      (v) => typeof v.lat === "number" && typeof v.lng === "number"
    );
    const set = (state: NearbyState) => setNearbyState((s) => ({ ...s, [what]: state }));
    if (!pinned) return set("nopin");
    // Replacing the sample content needs no asking; replacing theirs does.
    const current = what === "travel" ? data.travel : data.places;
    const own = JSON.stringify(current) !== JSON.stringify(seed[what]) &&
      (what === "travel" ? Boolean(data.travel?.city || data.travel?.airports.length) : Boolean(data.places?.length));
    if (own && !window.confirm(t("nearbyReplaceConfirm"))) return;
    set("loading");
    try {
      const key = `${pinned.lat},${pinned.lng},${contentLocale}`;
      let result = nearbyCache.current?.key === key ? nearbyCache.current.value : null;
      if (!result) {
        const res = await fetch(
          `/api/geo/nearby?${new URLSearchParams({ lat: String(pinned.lat), lng: String(pinned.lng), locale: contentLocale })}`
        );
        if (!res.ok) throw new Error();
        result = (await res.json()) as NearbyResult;
        nearbyCache.current = { key, value: result };
      }
      const tRoyal = contentT(contentMessages, contentLocale, "invite.royal");
      const km = (n: number) => tRoyal("travel.km", { km: n });
      if (what === "travel") {
        setData((d) => ({
          ...d,
          travel: {
            ...(d.travel ?? EMPTY_TRAVEL),
            city: result.city || d.travel?.city || "",
            cityCode: result.cityCode,
            airports: result.airports.map((a) => ({ code: a.code, name: a.name, distance: km(a.km) })),
            stations: result.stations.map((st) => ({ code: st.code, name: st.name, distance: km(st.km) })),
            // The template's example trains are for its sample city; keep
            // only trains the couple added themselves.
            routes:
              JSON.stringify(d.travel?.routes) === JSON.stringify(seed.travel?.routes) ? [] : (d.travel?.routes ?? []),
          },
          sections: { ...d.sections, travel: true },
        }));
      } else {
        if (result.places.length === 0) return set("error");
        setData((d) => ({
          ...d,
          places: result.places.map((pl) => ({
            title: pl.title,
            description: pl.description,
            distance: tRoyal("places.kmFromVenue", { km: pl.km }),
            scene: pl.scene,
          })),
          sections: { ...d.sections, places: true },
        }));
      }
      set("done");
    } catch {
      set("error");
    }
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
  const photos = data.photos.filter(Boolean);
  const fontSample = category.singlePerson
    ? data.brideName.trim() || template.name
    : [data.brideName.trim(), data.groomName.trim()].filter(Boolean).join(" & ") || template.name;

  const dateOk =
    !today ||
    isDateAllowed(data.weddingDate, {
      allowPast: category.allowPastDate,
      earliest: today,
      saved: savedDate,
    });

  const steps: EditorStep[] = [
    { id: "design", icon: Palette, done: true, ...stepText("design") },
    {
      id: "names",
      icon: UsersRound,
      done: Boolean(data.brideName.trim() && (category.singlePerson || data.groomName.trim()) && data.weddingDate && dateOk),
      ...stepText("names"),
    },
    {
      id: "events",
      icon: MapPin,
      done: Boolean(data.ceremonyTime.trim() || data.ceremonyVenue.name.trim()),
      ...stepText("events"),
    },
    {
      id: "story",
      icon: BookHeart,
      done: Boolean(data.story.trim()),
      ...stepText("story"),
      ...(category.familyTitle ? {} : { title: category.storyTitle }),
    },
    { id: "photos", icon: Images, done: photos.length > 0, ...stepText("photos") },
  ];
  function stepText(id: string) {
    return { label: t(`steps.${id}.label`), title: t(`steps.${id}.title`), hint: t(`steps.${id}.hint`) };
  }
  const stepIndex = Math.max(0, steps.findIndex((s) => s.id === step));
  const currentStep = steps[stepIndex];

  /** Opens the names step and focuses a field there once it has rendered. */
  function showNamesField(el: () => HTMLElement | null) {
    goTo("names");
    setMobileView("edit");
    setTimeout(() => el()?.focus(), 50);
  }

  const canSubmit =
    Boolean(data.brideName.trim() && (category.singlePerson || data.groomName.trim())) &&
    !publishing;

  async function handleSaveEdit() {
    if (!editSlug || !editToken) return;
    if (!dateOk) {
      // The message is already shown under the date field; take them there.
      showNamesField(() => dateRef.current);
      return;
    }
    setPublishing(true);
    setPublishError(null);
    showProgress("saving", SAVE_STEPS);
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
      showProgress("opening", SAVE_STEPS);
      router.push(`/invite/${editSlug}`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : t("errSaveFailed"));
      setPublishing(false);
      setProgress(null);
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
          showProgress("verifying", RESTORE_STEPS);
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
            setProgress(null);
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
      goTo("names");
      return;
    }
    if (!dateOk) {
      // The message is already shown under the date field; take them there.
      showNamesField(() => dateRef.current);
      return;
    }
    if (!ownerPhoneOk) {
      setPhoneTouched(true);
      setMobileView("edit");
      setTimeout(() => phoneRef.current?.focus(), 50);
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
    showProgress("saving");
    const stop = (message: string) => {
      setPublishError(message);
      setPublishing(false);
      setProgress(null);
    };
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
          // Paid: confirming it also publishes and sends the edit link,
          // which can take a few seconds.
          showProgress("verifying");
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
            // Stays up until the invitation page replaces the editor.
            showProgress("opening");
            router.push(
              `/invite/${slug}?welcome=1&editToken=${encodeURIComponent(newToken)}&templateId=${encodeURIComponent(templateId)}${sent ? `&sent=${sent}` : ""}`
            );
          } catch (err) {
            stop(err instanceof Error ? err.message : t("errPaymentVerifyFailed"));
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the checkout without paying — stay on the editor.
            setPublishing(false);
            setProgress(null);
          },
        },
      });
      rz.on("payment.failed", () => stop(t("errPaymentFailed")));
      // Razorpay's own window takes over the screen from here.
      showProgress("checkout");
      rz.open();
    } catch (err) {
      stop(err instanceof Error ? err.message : t("errGeneric"));
    }
  }

  return (
    // The screen below the 44px (h-11) app toolbar, so the publish bar and
    // the phone's Edit / Preview tabs stay in view.
    <div className="flex h-[calc(100dvh-2.75rem)] flex-col lg:flex-row">
      <PublishOverlay phase={progress?.phase ?? null} steps={progress?.steps} accent={data.accentColor} />
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
        className={`flex-1 flex-col overflow-hidden lg:flex lg:w-[440px] lg:flex-none lg:border-r lg:border-neutral-200 dark:lg:border-neutral-800 ${festive.formPaper} ${
          mobileView === "preview" ? "hidden lg:flex" : "flex"
        }`}
      >
        <Thoranam compact />
        <header className="-mt-3 flex items-center justify-between gap-3 px-5 pt-1 pb-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-widest text-amber-700 uppercase">
              {template.name}
            </p>
            <h1 className="font-serif text-base leading-tight font-bold sm:text-lg text-neutral-900 dark:text-neutral-50">
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
            {step !== "design" && (
              <button
                type="button"
                onClick={() => goTo("design")}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
              >
                <Palette size={13} aria-hidden />
                {t("switchTemplate")}
              </button>
            )}
          </div>
        </header>

        {!loadingExisting && !loadError && <StepNav steps={steps} current={step} onSelect={goTo} />}

        {loadingExisting ? (
          <div className="p-6 text-sm text-neutral-500">{t("loading")}</div>
        ) : loadError ? (
          <div className="p-6 text-sm text-red-600">{loadError}</div>
        ) : (
          <div ref={formScrollRef} className="flex-1 overflow-y-auto px-5 py-5">
            {draftNotice && (
              <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
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

            <StepHeader step={currentStep} n={stepIndex + 1} total={steps.length} />

            {step === "design" && (
              <div className="space-y-7">
                <TemplatePicker
                  designs={designs}
                  currentId={templateId}
                  hrefFor={(id) =>
                    isEditMode
                      ? `/create/${id}?edit=${editSlug}&token=${editToken}&step=design`
                      : `/create/${id}?step=design`
                  }
                  onLeave={persistDraft}
                />
                <ColorPicker
                  value={data.accentColor}
                  designColor={template.defaultAccent}
                  onChange={(c) => update("accentColor", c)}
                />
                <FontPicker
                  value={data.fontPairing}
                  sample={fontSample}
                  accent={data.accentColor}
                  onChange={(id) => update("fontPairing", id)}
                />
                <LanguagePicker
                  value={contentLocale}
                  onChange={switchContentLocale}
                  showTamilFontTip={contentLocale === "ta" && !data.fontPairing.startsWith("tamil")}
                  onUseTamilFont={() => update("fontPairing", "tamil-classic")}
                />
              </div>
            )}

            {step === "names" && (
              <div className="space-y-6">
                <div className={category.singlePerson ? "" : "grid gap-3 sm:grid-cols-2"}>
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
                </div>

                <Field label={category.dateLabel}>
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
                  <p id="date-error" className="-mt-4 text-xs text-red-600 dark:text-red-400">
                    {t("errDatePast")}
                  </p>
                )}

                {template.category === "wedding" && (
                  <ExtraCard icon={Sparkles} title={t("monogramTitle")} summary={monogramText}>
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
                  </ExtraCard>
                )}
              </div>
            )}

            {step === "events" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50/70 px-3 py-2 dark:bg-amber-950/30">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t("eventSchedule")}</span>
                  <SectionToggle enabled={data.sections.schedule} onChange={(v) => updateSection("schedule", v)} />
                </div>
                <div className={`space-y-4 transition-opacity ${!data.sections.schedule ? "opacity-45" : ""}`}>
                  <EventFields
                    title={category.eventALabel}
                    time={data.ceremonyTime}
                    venue={data.ceremonyVenue}
                    placeholders={{
                      time: t("ceremonyPlaceholderTime"),
                      venue: t("ceremonyPlaceholderVenue"),
                      address: t("ceremonyPlaceholderAddress"),
                    }}
                    onTime={(v) => update("ceremonyTime", v)}
                    onVenue={(f, v) => updateVenue("ceremonyVenue", f, v)}
                    mapSearch={mapSearchFor("ceremonyVenue")}
                  />
                  {category.eventBLabel && (
                    <EventFields
                      title={category.eventBLabel}
                      time={data.receptionTime}
                      venue={data.receptionVenue}
                      placeholders={{
                        time: t("receptionPlaceholderTime"),
                        venue: t("receptionPlaceholderVenue"),
                        address: t("receptionPlaceholderAddress"),
                      }}
                      onTime={(v) => update("receptionTime", v)}
                      onVenue={(f, v) => updateVenue("receptionVenue", f, v)}
                      mapSearch={mapSearchFor("receptionVenue")}
                    />
                  )}
                </div>
              </div>
            )}

            {step === "story" && (
              <div className="space-y-8">
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
              </div>
            )}

            {step === "photos" && (
              <div className="space-y-8">
                <FormSection
                  title={t("photoGallery")}
                  toggle={{
                    enabled: data.sections.gallery,
                    onChange: (v) => updateSection("gallery", v),
                  }}
                >
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((url, i, all) => (
                      <PhotoTile
                        key={url}
                        index={i}
                        count={all.length}
                        url={url}
                        onRemove={removePhoto}
                        onMove={movePhoto}
                      />
                    ))}
                    {photos.length < 6 && (
                      <AddPhotoTile index={photos.length} uploading={uploadingIndex !== null} onPick={pickPhoto} />
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {photos.length > 1 ? t("photoOrderHint") : t("photoGalleryHint")}
                  </p>
                  {cropFile && (
                    <PhotoCropper file={cropFile} onCancel={() => setCropFile(null)} onApply={uploadPhoto} />
                  )}
                </FormSection>

                <div>
                  <h3 className="mb-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">{t("extrasTitle")}</h3>
                  <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">{t("extrasHint")}</p>
                  <div className="space-y-2.5">
                    <ExtraCard
                      icon={Music}
                      title={t("musicTitle")}
                      summary={data.backgroundMusic ? t("musicAdded") : t("musicHint")}
                    >
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
                        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500 hover:border-amber-400 dark:border-neutral-700">
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
                    </ExtraCard>

                    <ExtraCard
                      icon={CalendarCheck}
                      title={t("guestRsvpTitle")}
                      summary={t("guestRsvpHint")}
                      toggle={{ enabled: data.sections.rsvp, onChange: (v) => updateSection("rsvp", v) }}
                    />

                    <ExtraCard
                      icon={HelpCircle}
                      title={t("thingsToKnowTitle")}
                      summary={t("questionCount", { count: data.faq.length })}
                      toggle={{ enabled: data.sections.faq, onChange: (v) => updateSection("faq", v) }}
                    >
                      <FaqFields
                        items={data.faq}
                        onChange={updateFaq}
                        onAdd={addFaqItem}
                        onRemove={removeFaqItem}
                      />
                    </ExtraCard>

                    <ExtraCard
                      icon={Camera}
                      title={t("guestPhotosTitle")}
                      summary={t("guestPhotosHint")}
                      toggle={{
                        enabled: data.sections.guestPhotos,
                        onChange: (v) => updateSection("guestPhotos", v),
                      }}
                    />

                    {/* Only the wedding (royal palace) layout renders these sections. */}
                    {template.category === "wedding" && (
                      <>
                        <ExtraCard
                          icon={Plane}
                          title={t("travelTitle")}
                          summary={t("travelHint")}
                          toggle={{ enabled: data.sections.travel, onChange: (v) => updateSection("travel", v) }}
                        >
                          <NearbyFill
                            label={t("nearbyFillTravel")}
                            state={nearbyState.travel}
                            onFill={() => fillFromVenue("travel")}
                            onFindVenue={() => goTo("events")}
                          />
                          <TravelFields
                            value={data.travel ?? EMPTY_TRAVEL}
                            onChange={(v) => update("travel", v)}
                          />
                        </ExtraCard>
                        <ExtraCard
                          icon={Landmark}
                          title={t("placesTitle")}
                          summary={t("placesHint")}
                          toggle={{ enabled: data.sections.places, onChange: (v) => updateSection("places", v) }}
                        >
                          <NearbyFill
                            label={t("nearbyFillPlaces")}
                            state={nearbyState.places}
                            onFill={() => fillFromVenue("places")}
                            onFindVenue={() => goTo("events")}
                          />
                          <PlacesFields value={data.places ?? []} onChange={(v) => update("places", v)} />
                        </ExtraCard>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <StepFooter prev={steps[stepIndex - 1]} next={steps[stepIndex + 1]} onSelect={goTo} />
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
          {/* Asked for on the last step (or when Publish needs it), so the
              bar stays small while filling in the rest. */}
          {!isEditMode && (stepIndex === steps.length - 1 || phoneTouched || ownerPhone) && (
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
              className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${festive.shine}`}
            >
              {publishing ? t("saving") : t("saveChanges")}
            </button>
          ) : (
            <button
              onClick={tryPublish}
              disabled={publishing}
              style={{ backgroundColor: data.accentColor }}
              className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${festive.shine}`}
            >
              {publishing ? t("processing") : t("publishCta", { price: templatePriceInr(templateId) })}
            </button>
          )}
        </div>
      </div>

      {/* Live preview panel */}
      <div
        className={`flex-1 flex-col overflow-hidden ${festive.previewStage} ${
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
            {motionReducedElsewhere && (
              <span
                className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                title={t("motionForcedHint")}
              >
                {t("motionForced")}
              </span>
            )}
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

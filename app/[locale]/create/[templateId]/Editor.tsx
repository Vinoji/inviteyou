"use client";

import { useEffect, useState } from "react";
import { Monitor, Plus, RotateCcw, Smartphone, Tablet, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import Script from "next/script";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getTemplateMeta } from "@/lib/i18n/templates";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { getDefaultInvitationData } from "@/lib/i18n/defaultContent";
import { FONT_PAIRINGS } from "@/lib/fontPairings";
import { EMPTY_TRAVEL, type InvitationData } from "@/lib/types";
import InvitationView from "@/components/invite/InvitationView";
import { FormSection, Field, inputClass, SectionToggle } from "@/components/editor/FormFields";
import PhotoSlot from "@/components/editor/PhotoSlot";
import TravelFields from "@/components/editor/TravelFields";
import PlacesFields from "@/components/editor/PlacesFields";
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
}: {
  templateId: string;
  editSlug: string | null;
  editToken: string | null;
}) {
  const router = useRouter();
  const t = useTranslations("editor");
  const tTemplates = useTranslations("templates");
  const tCategories = useTranslations("categories");
  const tDefaultContent = useTranslations("defaultContent");
  const template = getTemplateMeta(templateId, tTemplates);
  const category = getCategoryMeta(template.category, tCategories);
  const isEditMode = Boolean(editSlug && editToken);

  const [draftId] = useState(() => generateDraftId());
  const [data, setData] = useState<InvitationData>(() =>
    getDefaultInvitationData(templateId, tDefaultContent)
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
        if (!cancelled) setData(json.invitation);
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

  function update<K extends keyof InvitationData>(key: K, value: InvitationData[K]) {
    setData((d) => ({ ...d, [key]: value }));
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

  async function handlePhotoChange(index: number, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(t("errImageFile"));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert(t("errImageSize"));
      return;
    }
    setUploadingIndex(index);
    try {
      const path = `invitations/${draftId}/photo-${index}.jpg`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setData((d) => {
        const photos = [...d.photos];
        photos[index] = url;
        return { ...d, photos };
      });
    } catch (err) {
      console.error(err);
      alert(t("errPhotoUpload"));
    } finally {
      setUploadingIndex(null);
    }
  }

  async function removePhoto(index: number) {
    setData((d) => {
      const photos = [...d.photos];
      photos.splice(index, 1);
      return { ...d, photos };
    });
    try {
      const path = `invitations/${draftId}/photo-${index}.jpg`;
      await deleteObject(ref(storage, path));
    } catch {
      // Best-effort cleanup; safe to ignore (e.g. slot was never uploaded).
    }
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
      const path = `invitations/${draftId}/background-music`;
      const storageRef = ref(storage, path);
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

  async function removeMusic() {
    update("backgroundMusic", "");
    try {
      await deleteObject(ref(storage, `invitations/${draftId}/background-music`));
    } catch {
      // Best-effort cleanup; safe to ignore.
    }
  }

  const canSubmit =
    Boolean(data.brideName.trim() && (category.singlePerson || data.groomName.trim())) &&
    !publishing;

  async function handleSaveEdit() {
    if (!editSlug || !editToken) return;
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

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const draftRes = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId, ...data }),
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
        name: "Namma Vivaham",
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
            const { slug, editToken: newToken } = await verifyRes.json();
            router.push(
              `/invite/${slug}?welcome=1&editToken=${encodeURIComponent(newToken)}&templateId=${encodeURIComponent(templateId)}`
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
        onLoad={() => setRazorpayReady(true)}
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
            <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300">
              {t("changeTemplate")}
            </Link>
          </div>
        </header>

        {loadingExisting ? (
          <div className="p-6 text-sm text-neutral-500">{t("loading")}</div>
        ) : loadError ? (
          <div className="p-6 text-sm text-red-600">{loadError}</div>
        ) : (
          <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
            <FormSection title={category.singlePerson ? t("sectionAboutYou") : t("sectionCouple")}>
              <Field label={category.personALabel}>
                <input
                  className={inputClass}
                  value={data.brideName}
                  onChange={(e) => update("brideName", e.target.value)}
                  placeholder={t("namePlaceholderA")}
                />
              </Field>
              {!category.singlePerson && (
                <Field label={category.personBLabel}>
                  <input
                    className={inputClass}
                    value={data.groomName}
                    onChange={(e) => update("groomName", e.target.value)}
                    placeholder={t("namePlaceholderB")}
                  />
                </Field>
              )}
            </FormSection>

            <FormSection title={category.dateLabel}>
              <Field label={t("dateFieldLabel")}>
                <input
                  type="date"
                  className={inputClass}
                  value={data.weddingDate}
                  onChange={(e) => update("weddingDate", e.target.value)}
                />
              </Field>
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
              <textarea
                className={inputClass}
                rows={5}
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
                <Field label={t("groomParentsLabel")}>
                  <input
                    className={inputClass}
                    value={data.groomParents}
                    onChange={(e) => update("groomParents", e.target.value)}
                    placeholder={t("groomParentsPlaceholder")}
                  />
                </Field>
                <Field label={t("brideParentsLabel")}>
                  <input
                    className={inputClass}
                    value={data.brideParents}
                    onChange={(e) => update("brideParents", e.target.value)}
                    placeholder={t("brideParentsPlaceholder")}
                  />
                </Field>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("familyHint")}</p>
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
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <PhotoSlot
                    key={i}
                    index={i}
                    url={data.photos[i]}
                    uploading={uploadingIndex === i}
                    onChange={handlePhotoChange}
                    onRemove={removePhoto}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("photoGalleryHint")}</p>
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
              onClick={handlePublish}
              disabled={!canSubmit || !razorpayReady}
              style={{ backgroundColor: data.accentColor }}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {publishing ? t("processing") : t("publishCta")}
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
            <InvitationView data={data} slug={editSlug ?? "preview"} mode="preview" />
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

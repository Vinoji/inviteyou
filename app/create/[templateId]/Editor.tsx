"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getTemplate } from "@/lib/templates";
import { FONT_PAIRINGS } from "@/lib/fontPairings";
import { getDefaultInvitationData } from "@/lib/defaultContent";
import type { InvitationData } from "@/lib/types";
import InvitationView from "@/components/invite/InvitationView";
import { FormSection, Field, inputClass } from "@/components/editor/FormFields";
import PhotoSlot from "@/components/editor/PhotoSlot";

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
  const template = getTemplate(templateId);
  const isEditMode = Boolean(editSlug && editToken);

  const [draftId] = useState(() => generateDraftId());
  const [data, setData] = useState<InvitationData>(() => getDefaultInvitationData(templateId));
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    if (!isEditMode || !editSlug || !editToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/invitation/${editSlug}?token=${encodeURIComponent(editToken)}`
        );
        if (!res.ok) throw new Error("This edit link is invalid or has expired.");
        const json = await res.json();
        if (!cancelled) setData(json.invitation);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load invitation."
          );
        }
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  async function handlePhotoChange(index: number, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB.");
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
      alert("Photo upload failed. Please try again.");
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
      alert("Please choose an audio file (MP3, WAV, etc.).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Audio file must be under 15MB.");
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
      alert("Audio upload failed. Please try again.");
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

  const canSubmit = Boolean(data.groomName.trim() && data.brideName.trim()) && !publishing;

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
        throw new Error(j.error ?? "Failed to save changes.");
      }
      router.push(`/invite/${editSlug}`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Failed to save changes.");
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
        throw new Error(j.error ?? "Could not save your details. Please try again.");
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      if (!orderRes.ok) {
        const j = await orderRes.json().catch(() => ({}));
        throw new Error(j.error ?? "Could not start payment. Please try again.");
      }
      const order = await orderRes.json();

      if (!window.Razorpay) {
        throw new Error("Payment library failed to load. Please refresh and try again.");
      }

      const rz = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Namma Vivaham",
        description: `${data.brideName} & ${data.groomName} — Wedding Invitation`,
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
              throw new Error(j.error ?? "Payment verification failed. Please contact support.");
            }
            const { slug, editToken: newToken } = await verifyRes.json();
            router.push(
              `/invite/${slug}?welcome=1&editToken=${encodeURIComponent(newToken)}&templateId=${encodeURIComponent(templateId)}`
            );
          } catch (err) {
            setPublishError(
              err instanceof Error ? err.message : "Payment verification failed."
            );
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
        setPublishError("Payment failed. Please try again.");
        setPublishing(false);
      });
      rz.open();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Something went wrong.");
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
        className={`flex-1 flex-col overflow-hidden lg:flex lg:w-[440px] lg:flex-none lg:border-r lg:border-neutral-200 ${
          mobileView === "preview" ? "hidden lg:flex" : "flex"
        }`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase">
              {template.name}
            </p>
            <h1 className="font-serif text-lg font-bold text-neutral-900">
              {isEditMode ? "Edit your invitation" : "Create your invitation"}
            </h1>
          </div>
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-700">
            Change template
          </Link>
        </header>

        {loadingExisting ? (
          <div className="p-6 text-sm text-neutral-500">Loading your invitation…</div>
        ) : loadError ? (
          <div className="p-6 text-sm text-red-600">{loadError}</div>
        ) : (
          <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
            <FormSection title="The couple">
              <Field label="Bride's name">
                <input
                  className={inputClass}
                  value={data.brideName}
                  onChange={(e) => update("brideName", e.target.value)}
                  placeholder="Priya"
                />
              </Field>
              <Field label="Groom's name">
                <input
                  className={inputClass}
                  value={data.groomName}
                  onChange={(e) => update("groomName", e.target.value)}
                  placeholder="Arjun"
                />
              </Field>
            </FormSection>

            <FormSection title="Wedding date">
              <Field label="Date">
                <input
                  type="date"
                  className={inputClass}
                  value={data.weddingDate}
                  onChange={(e) => update("weddingDate", e.target.value)}
                />
              </Field>
            </FormSection>

            <FormSection title="Ceremony">
              <Field label="Time">
                <input
                  className={inputClass}
                  value={data.ceremonyTime}
                  onChange={(e) => update("ceremonyTime", e.target.value)}
                  placeholder="10:00 AM"
                />
              </Field>
              <Field label="Venue name">
                <input
                  className={inputClass}
                  value={data.ceremonyVenue.name}
                  onChange={(e) => updateVenue("ceremonyVenue", "name", e.target.value)}
                  placeholder="Sri Kalyana Mandapam"
                />
              </Field>
              <Field label="Address">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={data.ceremonyVenue.address}
                  onChange={(e) => updateVenue("ceremonyVenue", "address", e.target.value)}
                  placeholder="123 Temple Street, Chennai"
                />
              </Field>
              <Field label="Google Maps link (optional)">
                <input
                  type="url"
                  className={inputClass}
                  value={data.ceremonyVenue.mapsLink ?? ""}
                  onChange={(e) => updateVenue("ceremonyVenue", "mapsLink", e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </Field>
            </FormSection>

            <FormSection title="Reception">
              <Field label="Time">
                <input
                  className={inputClass}
                  value={data.receptionTime}
                  onChange={(e) => update("receptionTime", e.target.value)}
                  placeholder="7:00 PM"
                />
              </Field>
              <Field label="Venue name">
                <input
                  className={inputClass}
                  value={data.receptionVenue.name}
                  onChange={(e) => updateVenue("receptionVenue", "name", e.target.value)}
                  placeholder="Grand Ballroom, Taj Hotel"
                />
              </Field>
              <Field label="Address">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={data.receptionVenue.address}
                  onChange={(e) => updateVenue("receptionVenue", "address", e.target.value)}
                  placeholder="456 Beach Road, Chennai"
                />
              </Field>
              <Field label="Google Maps link (optional)">
                <input
                  type="url"
                  className={inputClass}
                  value={data.receptionVenue.mapsLink ?? ""}
                  onChange={(e) => updateVenue("receptionVenue", "mapsLink", e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </Field>
            </FormSection>

            <FormSection title="Our story">
              <textarea
                className={inputClass}
                rows={5}
                value={data.story}
                onChange={(e) => update("story", e.target.value)}
                placeholder="Tell your guests how you met, your journey together, and what this day means to you..."
              />
            </FormSection>

            <FormSection title="Family (optional)">
              <Field label="Groom's parents">
                <input
                  className={inputClass}
                  value={data.groomParents}
                  onChange={(e) => update("groomParents", e.target.value)}
                  placeholder="Mr. & Mrs. Rajendran Kumar"
                />
              </Field>
              <Field label="Bride's parents">
                <input
                  className={inputClass}
                  value={data.brideParents}
                  onChange={(e) => update("brideParents", e.target.value)}
                  placeholder="Mr. & Mrs. Suresh Rao"
                />
              </Field>
              <p className="text-xs text-neutral-400">
                Leave both blank to hide the Family &amp; Blessings section.
              </p>
            </FormSection>

            <FormSection title="Photos (up to 6)">
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
              <p className="text-xs text-neutral-400">
                The first photo becomes your hero background.
              </p>
            </FormSection>

            <FormSection title="Background music (optional)">
              {data.backgroundMusic ? (
                <div className="space-y-2">
                  <audio controls src={data.backgroundMusic} className="w-full" />
                  <button
                    type="button"
                    onClick={removeMusic}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove track
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500 hover:border-neutral-400">
                  {uploadingMusic ? "Uploading…" : "Upload an audio file (MP3, WAV)"}
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={uploadingMusic}
                    onChange={(e) => handleMusicChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
              <p className="text-xs text-neutral-400">
                Plays only if a guest taps the music button — never
                auto-plays with sound.
              </p>
            </FormSection>

            <FormSection title="Accent color">
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
                    aria-label={`Use accent color ${c}`}
                  />
                ))}
                <input
                  type="color"
                  value={data.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-neutral-300 bg-transparent p-0"
                  aria-label="Custom accent color"
                />
              </div>
            </FormSection>

            <FormSection title="Font pairing">
              <div className="grid grid-cols-2 gap-2">
                {FONT_PAIRINGS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => update("fontPairing", f.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      data.fontPairing === f.id
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-300"
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

        <div className="border-t border-neutral-200 p-4">
          {publishError && <p className="mb-2 text-sm text-red-600">{publishError}</p>}
          {isEditMode ? (
            <button
              onClick={handleSaveEdit}
              disabled={!canSubmit}
              style={{ backgroundColor: data.accentColor }}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {publishing ? "Saving…" : "Save changes"}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={!canSubmit || !razorpayReady}
              style={{ backgroundColor: data.accentColor }}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {publishing ? "Processing…" : "Publish & Get Your Link — ₹199"}
            </button>
          )}
        </div>
      </div>

      {/* Live preview panel */}
      <div
        className={`flex-1 overflow-y-auto bg-neutral-100 ${
          mobileView === "edit" ? "hidden lg:block" : "block"
        }`}
      >
        <InvitationView data={data} slug={editSlug ?? "preview"} mode="preview" />
      </div>

      {/* Mobile edit/preview toggle */}
      <div className="flex border-t border-neutral-200 bg-white lg:hidden">
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-3 text-sm font-semibold ${
            mobileView === "edit" ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-sm font-semibold ${
            mobileView === "preview" ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          Preview
        </button>
      </div>
    </div>
  );
}

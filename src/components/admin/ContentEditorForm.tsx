"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { CheckCircle2, ImageIcon, Loader2 } from "lucide-react";
import { updateSiteContent } from "@/app/admin/actions";
import { uploadMediaFile } from "@/lib/supabase/upload";
import type { SiteContent } from "@/lib/content/site-content";

const FIELDS: Array<{
  key: keyof SiteContent;
  label: string;
  multiline?: boolean;
}> = [
  { key: "hero_title", label: "Homepage Hero Title" },
  { key: "hero_description", label: "Homepage Hero Description", multiline: true },
  { key: "about_description", label: "About Page Description", multiline: true },
  { key: "about_bio", label: "Founder Bio Quote", multiline: true },
  { key: "contact_phone", label: "Contact Phone (also used for WhatsApp)" },
  { key: "contact_email", label: "Contact Email" },
  { key: "contact_address", label: "Contact Address / Location" },
  {
    key: "order_notification_email",
    label:
      "Store Order Notification Email(s) -- separate multiple with commas (must match the Resend account's own email until a domain is verified)",
  },
];

export function ContentEditorForm({ content }: { content: SiteContent }) {
  const [values, setValues] = useState<SiteContent>(content);
  const [isSaving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploadingImage, startUploadingImage] = useTransition();
  const [imageError, setImageError] = useState<string | null>(null);

  function handleChange(key: keyof SiteContent, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      try {
        await updateSiteContent(values);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes.");
      }
    });
  }

  function handleImageSelected(file: File | null) {
    if (!file) return;
    setImageError(null);

    startUploadingImage(async () => {
      try {
        const extension = file.name.split(".").pop() ?? "jpg";
        const imageUrl = await uploadMediaFile(file, `hero/${Date.now()}.${extension}`);
        await updateSiteContent({ hero_image_url: imageUrl });
        setValues((prev) => ({ ...prev, hero_image_url: imageUrl }));
      } catch (err) {
        setImageError(err instanceof Error ? err.message : "Failed to upload image.");
      }
    });
  }

  function handleRemoveImage() {
    setImageError(null);
    startUploadingImage(async () => {
      try {
        await updateSiteContent({ hero_image_url: "" });
        setValues((prev) => ({ ...prev, hero_image_url: "" }));
      } catch (err) {
        setImageError(err instanceof Error ? err.message : "Failed to remove image.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">
          Homepage Main Picture
        </h3>
        <p className="mt-1 text-xs text-navy-400">
          Shown beside the hero text at the top of the homepage. Leave unset to use the
          default photo.
        </p>

        <div className="mt-4 flex items-center gap-4">
          {values.hero_image_url ? (
            <div className="relative h-24 w-20 overflow-hidden rounded-lg border border-navy-100">
              <Image
                src={values.hero_image_url}
                alt="Homepage main picture"
                fill
                className="object-cover"
              />
            </div>
          ) : null}

          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-navy-300 px-4 py-3 text-sm text-navy-600 hover:border-gold">
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {values.hero_image_url ? "Replace picture" : "Upload a picture"}
            <input
              type="file"
              accept="image/*"
              disabled={isUploadingImage}
              className="hidden"
              onChange={(e) => handleImageSelected(e.target.files?.[0] ?? null)}
            />
          </label>

          {values.hero_image_url ? (
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={handleRemoveImage}
              className="text-sm font-medium text-navy-500 hover:text-red-600 disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>

        {imageError ? <p className="mt-3 text-sm text-red-600">{imageError}</p> : null}
      </div>

      {FIELDS.map(({ key, label, multiline }) => (
        <div key={key}>
          <label htmlFor={key} className="block text-sm font-medium text-navy-800">
            {label}
          </label>
          {multiline ? (
            <textarea
              id={key}
              rows={3}
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          ) : (
            <input
              id={key}
              type="text"
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          )}
        </div>
      ))}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="btn-gold disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Changes
        </button>
        {saved && !isSaving ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        ) : null}
      </div>
    </div>
  );
}

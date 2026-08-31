"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateSiteContent } from "@/app/admin/actions";
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
    label: "Store Order Notification Email (must match the Resend account's own email until a domain is verified)",
  },
];

export function ContentEditorForm({ content }: { content: SiteContent }) {
  const [values, setValues] = useState<SiteContent>(content);
  const [isSaving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-5">
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

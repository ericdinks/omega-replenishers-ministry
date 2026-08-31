"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateSiteContent } from "@/app/admin/actions";
import { MAX_TEACHINGS_VIDEO_LIMIT } from "@/lib/content/site-content";

export function VideoLimitSetting({ currentLimit }: { currentLimit: number }) {
  const [value, setValue] = useState(String(currentLimit));
  const [isSaving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 1 || numeric > MAX_TEACHINGS_VIDEO_LIMIT) {
      setError(`Enter a number between 1 and ${MAX_TEACHINGS_VIDEO_LIMIT}.`);
      return;
    }
    setError(null);
    startSaving(async () => {
      try {
        await updateSiteContent({ teachings_video_limit: String(numeric) });
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-5">
      <h3 className="font-display text-sm font-bold text-navy-900">Videos to Fetch</h3>
      <p className="mt-1 text-xs text-navy-500">
        How many of the channel&apos;s other videos to pull in for tagging and for the
        /teachings page. YouTube&apos;s API caps this at {MAX_TEACHINGS_VIDEO_LIMIT} per
        request -- for more than that, ask for pagination support to be added.
      </p>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="number"
          min="1"
          max={MAX_TEACHINGS_VIDEO_LIMIT}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          className="w-24 rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-900 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Save
        </button>
        {saved && !isSaving ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </span>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

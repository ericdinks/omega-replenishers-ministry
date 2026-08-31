"use client";

import { useState, useTransition } from "react";
import { Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
  setAnnouncementActive,
} from "@/app/admin/actions";
import { uploadMediaFile } from "@/lib/supabase/upload";
import type { AnnouncementRow } from "@/lib/types/database";

export function AnnouncementsManager({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const activeCount = announcements.filter((a) => a.is_active).length;

  function handleCreate() {
    if (!title.trim()) {
      setError("Give the announcement a title.");
      return;
    }
    setError(null);

    startCreating(async () => {
      try {
        let imageUrl: string | undefined;
        if (imageFile) {
          const extension = imageFile.name.split(".").pop() ?? "jpg";
          imageUrl = await uploadMediaFile(imageFile, `posters/${Date.now()}.${extension}`);
        }

        await createAnnouncement({
          title: title.trim(),
          body: body.trim(),
          image_url: imageUrl,
          is_active: true,
        });

        setTitle("");
        setBody("");
        setImageFile(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create announcement.");
      }
    });
  }

  async function handleToggle(id: string, next: boolean) {
    setPendingId(id);
    try {
      await setAnnouncementActive(id, next);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    setPendingId(id);
    try {
      await deleteAnnouncement(id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">New Announcement</h3>
        {activeCount >= 2 ? (
          <p className="mt-1 text-xs text-amber-600">
            The homepage shows at most 2 active announcements at once. Creating
            another will still save, but deactivate an older one to make room.
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Details (optional)"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-navy-300 px-4 py-3 text-sm text-navy-600 hover:border-gold">
            <ImageIcon className="h-4 w-4" />
            {imageFile ? imageFile.name : "Attach an image (optional)"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            disabled={isCreating}
            onClick={handleCreate}
            className="btn-gold disabled:opacity-60"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Publish Announcement
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <p className="text-sm text-navy-400">No announcements yet.</p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-navy-100 bg-white p-4"
            >
              <div>
                <p className="font-medium text-navy-900">{announcement.title}</p>
                {announcement.body ? (
                  <p className="mt-1 text-sm text-navy-500">{announcement.body}</p>
                ) : null}
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    announcement.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-navy-100 text-navy-500"
                  }`}
                >
                  {announcement.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <button
                  type="button"
                  disabled={pendingId === announcement.id}
                  onClick={() => handleToggle(announcement.id, !announcement.is_active)}
                  className="text-sm font-medium text-navy-600 hover:text-gold-700 disabled:opacity-60"
                >
                  {announcement.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  disabled={pendingId === announcement.id}
                  onClick={() => handleDelete(announcement.id)}
                  className="text-red-600 hover:text-red-700 disabled:opacity-60"
                  aria-label="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

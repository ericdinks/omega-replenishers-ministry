"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  createVideoCategory,
  deleteVideoCategory,
  renameVideoCategory,
  setVideoCategoryAssignment,
} from "@/app/admin/actions";
import type { PlaylistVideo } from "@/lib/youtube/playlist";
import type { VideoCategoryAssignments } from "@/lib/content/video-categories";
import type { VideoCategoryRow } from "@/lib/types/database";

function CategoryChip({ category }: { category: VideoCategoryRow }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(category.label);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  function handleSave() {
    if (!label.trim()) return;
    setError(null);
    startSaving(async () => {
      try {
        await renameVideoCategory(category.id, label.trim());
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to rename.");
      }
    });
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-gold bg-white px-2 py-1">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-28 border-none p-0 text-sm text-navy-900 focus:outline-none focus:ring-0"
          autoFocus
        />
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="text-xs font-semibold text-gold-700 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setLabel(category.label);
          }}
          className="text-navy-400 hover:text-navy-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-sm text-navy-700">
      {category.label}
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-navy-400 hover:text-gold-700"
        aria-label={`Rename ${category.label}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => startDeleting(async () => deleteVideoCategory(category.id))}
        className="text-navy-400 hover:text-red-600 disabled:opacity-50"
        aria-label={`Delete ${category.label}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function VideoTagRow({
  video,
  categories,
  assignedCategoryIds,
}: {
  video: PlaylistVideo;
  categories: VideoCategoryRow[];
  assignedCategoryIds: string[];
}) {
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

  async function handleToggle(categoryId: string, isAssigned: boolean) {
    setPendingCategoryId(categoryId);
    try {
      await setVideoCategoryAssignment(video.videoId, categoryId, !isAssigned);
    } finally {
      setPendingCategoryId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-navy-100 bg-white p-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:w-72 sm:flex-shrink-0">
        <span className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md bg-navy-100">
          {video.thumbnailUrl ? (
            <Image src={video.thumbnailUrl} alt={video.title} fill sizes="80px" className="object-cover" />
          ) : null}
        </span>
        <p className="line-clamp-2 text-sm font-medium text-navy-800">{video.title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => {
          const isAssigned = assignedCategoryIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              disabled={pendingCategoryId === category.id}
              onClick={() => handleToggle(category.id, isAssigned)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                isAssigned
                  ? "border-gold bg-gold text-navy-900"
                  : "border-navy-200 text-navy-500 hover:border-gold"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VideoCategoriesManager({
  videos,
  categories,
  assignments,
}: {
  videos: PlaylistVideo[];
  categories: VideoCategoryRow[];
  assignments: VideoCategoryAssignments;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [search, setSearch] = useState("");

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const query = search.trim().toLowerCase();
    return videos.filter((video) => video.title.toLowerCase().includes(query));
  }, [videos, search]);

  function handleCreate() {
    if (!newLabel.trim()) return;
    setError(null);
    startCreating(async () => {
      try {
        await createVideoCategory(newLabel.trim());
        setNewLabel("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create category.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">Categories</h3>
        <p className="mt-1 text-xs text-navy-500">
          Create your own topic tags. These appear as filter buttons on /teachings.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <CategoryChip key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <button
            type="button"
            disabled={isCreating || !newLabel.trim()}
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy-900 disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-navy-900">
            Tag Videos ({videos.length} total)
          </h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-56 rounded-md border border-navy-200 px-3 py-1.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-navy-400">Create a category above before tagging videos.</p>
        ) : videos.length === 0 ? (
          <p className="mt-4 text-sm text-navy-400">
            No videos found. Confirm YOUTUBE_API_KEY and NEXT_PUBLIC_YOUTUBE_CHANNEL_ID are set.
          </p>
        ) : (
          <div className="mt-4 max-h-[600px] space-y-2 overflow-y-auto pr-1">
            {filteredVideos.map((video) => (
              <VideoTagRow
                key={video.videoId}
                video={video}
                categories={categories}
                assignedCategoryIds={assignments[video.videoId] ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { VideoLibrary } from "@/components/media/VideoLibrary";
import type { PlaylistVideo } from "@/lib/youtube/playlist";
import type { VideoCategoryAssignments } from "@/lib/content/video-categories";
import type { VideoCategoryRow } from "@/lib/types/database";

interface TeachingsLibraryProps {
  videos: PlaylistVideo[];
  categories: VideoCategoryRow[];
  assignments: VideoCategoryAssignments;
}

export function TeachingsLibrary({ videos, categories, assignments }: TeachingsLibraryProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    if (!activeCategoryId) return videos;
    return videos.filter((video) => assignments[video.videoId]?.includes(activeCategoryId));
  }, [videos, assignments, activeCategoryId]);

  return (
    <div>
      {categories.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategoryId === null
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-navy-200 text-navy-600 hover:border-navy-900"
            }`}
          >
            All Videos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategoryId(category.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategoryId === category.id
                  ? "border-gold bg-gold text-navy-900"
                  : "border-navy-200 text-navy-600 hover:border-gold"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        <VideoLibrary
          videos={filteredVideos}
          playerTitle="Teaching"
          emptyMessage={
            activeCategoryId
              ? "No videos tagged with this category yet."
              : "No teachings found yet."
          }
        />
      </div>
    </div>
  );
}

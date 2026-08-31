"use client";

import { useState } from "react";
import { TeachingsLibrary } from "@/components/teachings/TeachingsLibrary";
import { ShortsGrid } from "@/components/teachings/ShortsGrid";
import type { PlaylistVideo } from "@/lib/youtube/playlist";
import type { VideoCategoryAssignments } from "@/lib/content/video-categories";
import type { VideoCategoryRow } from "@/lib/types/database";

interface TeachingsTabsProps {
  longFormVideos: PlaylistVideo[];
  shorts: PlaylistVideo[];
  categories: VideoCategoryRow[];
  assignments: VideoCategoryAssignments;
}

export function TeachingsTabs({ longFormVideos, shorts, categories, assignments }: TeachingsTabsProps) {
  const [activeTab, setActiveTab] = useState<"teachings" | "shorts">("teachings");

  return (
    <div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("teachings")}
          className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === "teachings"
              ? "border-navy-900 bg-navy-900 text-white"
              : "border-navy-200 text-navy-600 hover:border-navy-900"
          }`}
        >
          Teachings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shorts")}
          className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === "shorts"
              ? "border-navy-900 bg-navy-900 text-white"
              : "border-navy-200 text-navy-600 hover:border-navy-900"
          }`}
        >
          Shorts {shorts.length > 0 ? `(${shorts.length})` : ""}
        </button>
      </div>

      <div className="mt-10">
        {activeTab === "teachings" ? (
          <TeachingsLibrary videos={longFormVideos} categories={categories} assignments={assignments} />
        ) : (
          <ShortsGrid videos={shorts} />
        )}
      </div>
    </div>
  );
}

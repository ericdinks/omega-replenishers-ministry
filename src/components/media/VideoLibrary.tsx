"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayCircle } from "lucide-react";
import type { PlaylistVideo } from "@/lib/youtube/playlist";

interface VideoLibraryProps {
  videos: PlaylistVideo[];
  playerTitle: string;
  emptyMessage: string;
  /** Optional fallback playlist embed shown when no single video is selected yet. */
  playlistId?: string;
}

/**
 * Main video embed plus a scrollable, click-to-play list. Shared by the
 * School of the Prophets page (a single standalone playlist, no filtering)
 * and the Teachings library (the rest of the channel's videos, filterable
 * by admin-created category tags).
 */
export function VideoLibrary({ videos, playerTitle, emptyMessage, playlistId }: VideoLibraryProps) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(
    videos[0]?.videoId ?? null
  );

  const activeVideoId =
    selectedVideoId && videos.some((v) => v.videoId === selectedVideoId)
      ? selectedVideoId
      : videos[0]?.videoId ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="overflow-hidden rounded-xl border border-navy-100 shadow-xl">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              key={activeVideoId ?? playlistId ?? "empty"}
              className="absolute inset-0 h-full w-full"
              src={
                activeVideoId
                  ? `https://www.youtube.com/embed/${activeVideoId}?rel=0`
                  : playlistId
                    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0`
                    : "about:blank"
              }
              title={playerTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1 lg:col-span-1">
        {videos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-navy-200 p-6 text-center text-sm text-navy-500">
            {emptyMessage}
          </p>
        ) : (
          videos.map((video) => {
            const isActive = video.videoId === activeVideoId;
            return (
              <button
                key={video.videoId}
                type="button"
                onClick={() => setSelectedVideoId(video.videoId)}
                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  isActive ? "border-gold bg-gold/10" : "border-navy-100 hover:border-gold/50"
                }`}
              >
                <span className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md bg-navy-100">
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : null}
                  <span className="absolute inset-0 flex items-center justify-center bg-navy-900/20">
                    <PlayCircle className="h-6 w-6 text-white drop-shadow" />
                  </span>
                </span>
                <span className="line-clamp-2 text-sm font-medium text-navy-800">
                  {video.title}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

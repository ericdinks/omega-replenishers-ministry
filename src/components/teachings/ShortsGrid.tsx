"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayCircle } from "lucide-react";
import type { PlaylistVideo } from "@/lib/youtube/playlist";

function ShortCard({ video }: { video: PlaylistVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-black shadow-sm">
      <div className="relative aspect-[9/16] w-full">
        {isPlaying ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${video.videoId}?rel=0&autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 h-full w-full"
          >
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            ) : null}
            <span className="absolute inset-0 flex items-center justify-center bg-navy-900/30 transition-colors group-hover:bg-navy-900/40">
              <PlayCircle className="h-12 w-12 text-white drop-shadow" />
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left">
              <span className="line-clamp-2 text-xs font-medium text-white">{video.title}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ShortsGrid({ videos }: { videos: PlaylistVideo[] }) {
  if (videos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-navy-200 p-10 text-center text-sm text-navy-500">
        No short clips found yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {videos.map((video) => (
        <ShortCard key={video.videoId} video={video} />
      ))}
    </div>
  );
}

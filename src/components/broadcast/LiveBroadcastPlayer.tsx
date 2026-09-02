"use client";

import { useEffect, useState } from "react";

interface LiveStatusResponse {
  configured: boolean;
  isLive: boolean;
  videoId: string | null;
}

/**
 * Optimized 16:9 responsive embed of the ministry's YouTube broadcast.
 * Shows the live broadcast while one is running, and the channel's
 * actual most recent upload otherwise -- both fetched fresh from
 * /api/youtube/live-status, so the player never reverts to a stale
 * fixed video once a broadcast ends.
 */
export function LiveBroadcastPlayer() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/youtube/live-status", {
          cache: "no-store",
        });
        const data = (await response.json()) as LiveStatusResponse;
        if (!cancelled) {
          setIsLive(data.isLive);
          setVideoId(data.videoId);
        }
      } catch {
        // Leaves videoId null; the "not configured" state below covers it.
      }
    }

    loadStatus();
  }, []);

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-navy-100 bg-navy-50 text-center">
        <p className="max-w-sm px-6 text-sm text-navy-500">
          The broadcast player is not configured yet. Set
          NEXT_PUBLIC_YOUTUBE_CHANNEL_ID and YOUTUBE_API_KEY in your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 shadow-xl">
      <div className="relative aspect-video w-full bg-black">
        <iframe
          key={videoId}
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0${
            isLive ? "&autoplay=1&mute=1" : ""
          }`}
          title="Omega Replenishers International Ministry Live Broadcast"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
        <span className="text-sm font-medium">
          {isLive ? "Streaming Live Now" : "Most Recent Broadcast"}
        </span>
        {isLive ? (
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-red-400">
            <span className="h-2 w-2 animate-pulse-live rounded-full bg-red-500" />
            Live
          </span>
        ) : null}
      </div>
    </div>
  );
}

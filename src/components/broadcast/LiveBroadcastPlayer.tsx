"use client";

import { useEffect, useState } from "react";
import { youtubeConfig } from "@/lib/config/site";

interface LiveStatusResponse {
  configured: boolean;
  isLive: boolean;
  liveVideoId?: string | null;
}

/**
 * Optimized 16:9 responsive embed of the ministry's YouTube broadcast.
 * Prefers the currently-live video id (detected via the YouTube Data API)
 * and falls back to the configured NEXT_PUBLIC_YOUTUBE_LIVE_VIDEO_ID so
 * visitors always see the most recent broadcast even when the channel is
 * offline.
 */
export function LiveBroadcastPlayer() {
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
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
          if (data.isLive && data.liveVideoId) {
            setLiveVideoId(data.liveVideoId);
          }
        }
      } catch {
        // Falls back silently to the configured video id below.
      }
    }

    loadStatus();
  }, []);

  const videoId = liveVideoId ?? youtubeConfig.liveVideoId;

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-navy-100 bg-navy-50 text-center">
        <p className="max-w-sm px-6 text-sm text-navy-500">
          The broadcast player is not configured yet. Set
          NEXT_PUBLIC_YOUTUBE_LIVE_VIDEO_ID in your environment variables.
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

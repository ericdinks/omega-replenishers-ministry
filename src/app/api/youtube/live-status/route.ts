import { NextResponse } from "next/server";
import { youtubeConfig } from "@/lib/config/site";
import { fetchPlaylistVideos, getUploadsPlaylistId } from "@/lib/youtube/playlist";

/**
 * Caches this route's own JSON response for 30 seconds (Next.js route
 * segment config), so a burst of concurrent visitors -- exactly what
 * happens during an actual live service -- shares one upstream call
 * instead of each visitor triggering their own. This used to be set to
 * `0` (meaning "never cache"), which silently forced every fetch inside
 * this handler to skip caching too and made the route hammer YouTube's
 * search.list quota (a tight 100-call/day bucket) under real traffic --
 * exactly the failure mode this endpoint most needs to survive.
 */
export const revalidate = 30;

interface YouTubeSearchResponse {
  items?: Array<{ id?: { videoId?: string } }>;
}

/**
 * Reports whether the ministry's YouTube channel currently has an active
 * live broadcast, and always includes a `videoId` to actually embed:
 * the live broadcast's id while live, or the channel's most recent
 * upload once it ends -- fetched fresh each time rather than a fixed
 * env var, so the player never goes stale after a broadcast finishes.
 *
 * Requires YOUTUBE_API_KEY and NEXT_PUBLIC_YOUTUBE_CHANNEL_ID. If either
 * is missing, the endpoint reports `configured: false` so the UI can fall
 * back to a static "broadcast schedule" state instead of claiming a live
 * status it cannot verify.
 */
export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = youtubeConfig.channelId;

  if (!apiKey || !channelId) {
    return NextResponse.json({ configured: false, isLive: false, videoId: null });
  }

  const uploadsPlaylistId = getUploadsPlaylistId(channelId);

  /** Last-resort so the player always has something to play even if the live check itself fails. */
  async function mostRecentUpload(): Promise<string | null> {
    try {
      const [mostRecent] = await fetchPlaylistVideos(uploadsPlaylistId, 1);
      return mostRecent?.videoId ?? null;
    } catch {
      return null;
    }
  }

  const params = new URLSearchParams({
    part: "id",
    channelId,
    eventType: "live",
    type: "video",
    key: apiKey,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      return NextResponse.json({
        configured: true,
        isLive: false,
        videoId: await mostRecentUpload(),
        error: "youtube_api_error",
      });
    }

    const data = (await response.json()) as YouTubeSearchResponse;
    const liveVideoId = data.items?.[0]?.id?.videoId ?? null;

    if (liveVideoId) {
      return NextResponse.json({ configured: true, isLive: true, videoId: liveVideoId });
    }

    // Not live -- show the channel's actual most recent upload instead of
    // a fixed fallback, so the player always reflects what's really there.
    return NextResponse.json({
      configured: true,
      isLive: false,
      videoId: await mostRecentUpload(),
    });
  } catch {
    return NextResponse.json({
      configured: true,
      isLive: false,
      videoId: await mostRecentUpload(),
      error: "network_error",
    });
  }
}

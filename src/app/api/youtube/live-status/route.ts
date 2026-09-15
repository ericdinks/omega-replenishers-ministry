import { NextResponse } from "next/server";
import { youtubeConfig } from "@/lib/config/site";
import { fetchPlaylistVideos, getUploadsPlaylistId } from "@/lib/youtube/playlist";

/** Forces this route to actually run on every request rather than being treated as statically cacheable. */
export const dynamic = "force-dynamic";

interface YouTubeVideosResponse {
  items?: Array<{ snippet?: { liveBroadcastContent?: string } }>;
}

/**
 * Reports whether the ministry's YouTube channel currently has an active
 * live broadcast, and always includes a `videoId` to actually embed:
 * the live broadcast's id while live, or the channel's most recent
 * upload once it ends -- fetched fresh each time rather than a fixed
 * env var, so the player never goes stale after a broadcast finishes.
 *
 * Deliberately avoids YouTube's `search.list` endpoint for this -- it
 * carries its own strict 100-calls-PER-DAY quota (separate from, and far
 * tighter than, the general 10,000-unit project budget), which a real
 * live service with concurrent viewers exhausts within minutes no matter
 * how aggressively the response is cached (confirmed live in production:
 * a genuine `RESOURCE_EXHAUSTED` / `defaultSearchListPerDayPerProject`
 * error, not a caching bug). Instead, this checks whether the channel's
 * most recent upload (via the already-cheap `playlistItems.list` call
 * used elsewhere in this app) is itself currently live via `videos.list`
 * (1 unit, part of the generous general budget) -- correct for the
 * normal case where a live stream becomes the channel's newest video the
 * moment it starts.
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

  try {
    const uploadsPlaylistId = getUploadsPlaylistId(channelId);
    const [mostRecent] = await fetchPlaylistVideos(uploadsPlaylistId, 1);

    if (!mostRecent) {
      return NextResponse.json({ configured: true, isLive: false, videoId: null });
    }

    const params = new URLSearchParams({
      part: "snippet",
      id: mostRecent.videoId,
      key: apiKey,
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      // Still show the video -- just can't confirm live status right now.
      return NextResponse.json({
        configured: true,
        isLive: false,
        videoId: mostRecent.videoId,
        error: "youtube_api_error",
      });
    }

    const data = (await response.json()) as YouTubeVideosResponse;
    const isLive = data.items?.[0]?.snippet?.liveBroadcastContent === "live";

    return NextResponse.json({ configured: true, isLive, videoId: mostRecent.videoId });
  } catch {
    return NextResponse.json({ configured: true, isLive: false, videoId: null, error: "network_error" });
  }
}

import { NextResponse } from "next/server";
import { youtubeConfig } from "@/lib/config/site";

export const revalidate = 0;

interface YouTubeSearchResponse {
  items?: Array<{ id?: { videoId?: string } }>;
}

/**
 * Reports whether the ministry's YouTube channel currently has an active
 * live broadcast. Backed by the YouTube Data API v3 `search.list` with
 * `eventType=live`, which is the documented way to detect a live stream
 * without polling the video endpoint directly.
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
    return NextResponse.json({ configured: false, isLive: false });
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
      return NextResponse.json(
        { configured: true, isLive: false, error: "youtube_api_error" },
        { status: 200 }
      );
    }

    const data = (await response.json()) as YouTubeSearchResponse;
    const liveVideoId = data.items?.[0]?.id?.videoId ?? null;

    return NextResponse.json({
      configured: true,
      isLive: Boolean(liveVideoId),
      liveVideoId,
    });
  } catch {
    return NextResponse.json(
      { configured: true, isLive: false, error: "network_error" },
      { status: 200 }
    );
  }
}

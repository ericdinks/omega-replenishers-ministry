import "server-only";

export interface PlaylistVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface YouTubePlaylistItemsResponse {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
      resourceId?: { videoId?: string };
    };
  }>;
}

/**
 * Fetches the live contents of a YouTube playlist via the Data API v3
 * so the School of the Prophets hub always mirrors the ministry's real
 * catalogue instead of hardcoded placeholder videos. Returns an empty
 * array (rather than throwing) when the API key or playlist id is
 * missing, so the page can render a clear "not configured" state.
 */
export async function fetchPlaylistVideos(
  playlistId: string,
  maxResults = 50
): Promise<PlaylistVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || !playlistId) return [];

  const params = new URLSearchParams({
    part: "snippet",
    playlistId,
    maxResults: String(Math.min(Math.max(maxResults, 1), 50)),
    key: apiKey,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return [];

    const data = (await response.json()) as YouTubePlaylistItemsResponse;

    return (data.items ?? [])
      .map((item): PlaylistVideo | null => {
        const videoId = item.snippet?.resourceId?.videoId;
        const title = item.snippet?.title;
        if (!videoId || !title) return null;

        return {
          videoId,
          title,
          description: item.snippet?.description ?? "",
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ??
            item.snippet?.thumbnails?.medium?.url ??
            item.snippet?.thumbnails?.default?.url ??
            "",
          publishedAt: item.snippet?.publishedAt ?? "",
        };
      })
      .filter((video): video is PlaylistVideo => video !== null);
  } catch {
    return [];
  }
}

/**
 * Every YouTube channel has an implicit "uploads" playlist whose id is the
 * channel id with the "UC" prefix swapped for "UU" -- this is the standard,
 * documented way to list a channel's full upload history via
 * `playlistItems.list` (1 quota unit) instead of `search.list` (100 units).
 */
export function getUploadsPlaylistId(channelId: string): string {
  return channelId.startsWith("UC") ? `UU${channelId.slice(2)}` : channelId;
}

/**
 * YouTube's Data API has no explicit "is this a Short" flag. The reliable,
 * documented signal is duration: Shorts are always 60 seconds or under,
 * which is the threshold YouTube itself uses to decide whether a video can
 * appear in the Shorts shelf/player.
 */
const SHORTS_MAX_DURATION_SECONDS = 60;

function parseIso8601DurationSeconds(duration: string): number {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const [, hours, minutes, seconds] = match;
  return Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
}

interface YouTubeVideosResponse {
  items?: Array<{
    id?: string;
    contentDetails?: { duration?: string };
  }>;
}

/** Fetches durations (in seconds) for up to 50 video ids per request (videos.list allows 50 ids/call). */
async function fetchVideoDurations(videoIds: string[]): Promise<Map<string, number>> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const durations = new Map<string, number>();
  if (!apiKey || videoIds.length === 0) return durations;

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "contentDetails",
      id: batch.join(","),
      key: apiKey,
    });

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`,
        { next: { revalidate: 300 } }
      );
      if (!response.ok) continue;

      const data = (await response.json()) as YouTubeVideosResponse;
      for (const item of data.items ?? []) {
        if (item.id && item.contentDetails?.duration) {
          durations.set(item.id, parseIso8601DurationSeconds(item.contentDetails.duration));
        }
      }
    } catch {
      // Skip this batch; videos with unknown duration are kept (not treated as Shorts).
    }
  }

  return durations;
}

/**
 * Fetches every video the channel has uploaded, excluding whatever is in
 * `excludePlaylistId` (the School of the Prophets playlist, which is kept
 * as its own standalone section rather than mixed into the general video
 * library) and excluding YouTube Shorts. Powers the /teachings page.
 */
export async function fetchOtherChannelVideos(
  channelId: string,
  excludePlaylistId: string,
  maxResults = 50
): Promise<PlaylistVideo[]> {
  if (!channelId) return [];

  const uploadsPlaylistId = getUploadsPlaylistId(channelId);
  const [allUploads, excluded] = await Promise.all([
    fetchPlaylistVideos(uploadsPlaylistId, maxResults),
    excludePlaylistId ? fetchPlaylistVideos(excludePlaylistId, maxResults) : Promise.resolve([]),
  ]);

  const excludedIds = new Set(excluded.map((video) => video.videoId));
  const candidates = allUploads.filter((video) => !excludedIds.has(video.videoId));

  const durations = await fetchVideoDurations(candidates.map((video) => video.videoId));
  return candidates.filter((video) => {
    const duration = durations.get(video.videoId);
    // Unknown duration (API/quota hiccup) -> keep the video rather than hide it.
    return duration === undefined || duration > SHORTS_MAX_DURATION_SECONDS;
  });
}

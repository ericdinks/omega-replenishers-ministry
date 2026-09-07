import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoLibrary } from "@/components/media/VideoLibrary";
import { fetchPlaylistVideos } from "@/lib/youtube/playlist";
import { youtubeConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "School of the Prophets",
  description:
    "Grow in prophetic ministry through structured teaching series from Prophet Shedrack A. O.",
  alternates: { canonical: "/school-of-the-prophets" },
};

export const revalidate = 300;

export default async function SchoolOfTheProphetsPage() {
  const playlistId = youtubeConfig.playlistId;
  const videos = playlistId ? await fetchPlaylistVideos(playlistId) : [];

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Grow In The Prophetic"
          title="School of the Prophets"
          description="A structured training series for those called to walk in the prophetic. Study at your own pace."
        />

        <div className="mt-12">
          {playlistId && videos.length > 0 ? (
            <VideoLibrary
              videos={videos}
              playlistId={playlistId}
              playerTitle="School of the Prophets Teaching"
              emptyMessage="No teachings found yet."
            />
          ) : (
            <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-navy-200 bg-navy-50 p-10 text-center">
              <p className="text-sm text-navy-500">
                {playlistId
                  ? "No teachings were found in the configured playlist yet. Check back soon."
                  : "The School of the Prophets playlist is not configured yet. Set NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID and YOUTUBE_API_KEY in your environment variables."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

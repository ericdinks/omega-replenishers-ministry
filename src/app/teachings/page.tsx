import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeachingsLibrary } from "@/components/teachings/TeachingsLibrary";
import { fetchOtherChannelVideos } from "@/lib/youtube/playlist";
import { youtubeConfig } from "@/lib/config/site";
import { getVideoCategories, getVideoCategoryAssignments } from "@/lib/content/video-categories";
import { getSiteContent, parseTeachingsVideoLimit } from "@/lib/content/site-content";

export const metadata: Metadata = {
  title: "Teachings",
  description:
    "Browse teachings from Omega Replenishers International Ministry, organized by topic.",
};

export const revalidate = 30;

export default async function TeachingsPage() {
  const content = await getSiteContent();
  const videoLimit = parseTeachingsVideoLimit(content.teachings_video_limit);

  const [videos, categories, assignments] = await Promise.all([
    fetchOtherChannelVideos(youtubeConfig.channelId, youtubeConfig.playlistId, videoLimit),
    getVideoCategories(),
    getVideoCategoryAssignments(),
  ]);

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Teachings"
          title="The Video Library"
          description="Every other message from the ministry, organized by topic. Filter by category or browse everything."
        />

        <div className="mt-12">
          {youtubeConfig.channelId && videos.length > 0 ? (
            <TeachingsLibrary videos={videos} categories={categories} assignments={assignments} />
          ) : (
            <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-navy-200 bg-navy-50 p-10 text-center">
              <p className="text-sm text-navy-500">
                {youtubeConfig.channelId
                  ? "No videos were found yet. Check back soon."
                  : "The YouTube channel is not configured yet. Set NEXT_PUBLIC_YOUTUBE_CHANNEL_ID and YOUTUBE_API_KEY in your environment variables."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

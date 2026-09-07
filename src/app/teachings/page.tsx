import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeachingsTabs } from "@/components/teachings/TeachingsTabs";
import { fetchOtherChannelVideosSplit } from "@/lib/youtube/playlist";
import { youtubeConfig } from "@/lib/config/site";
import { getVideoCategories, getVideoCategoryAssignments } from "@/lib/content/video-categories";
import { getSiteContent, parseTeachingsVideoLimit } from "@/lib/content/site-content";

export const metadata: Metadata = {
  title: "Teachings",
  description:
    "Browse teachings and short clips from Omega Replenishers International Ministry, organized by topic.",
  alternates: { canonical: "/teachings" },
};

export const revalidate = 30;

export default async function TeachingsPage() {
  const content = await getSiteContent();
  const videoLimit = parseTeachingsVideoLimit(content.teachings_video_limit);

  const [{ longForm, shorts }, categories, assignments] = await Promise.all([
    fetchOtherChannelVideosSplit(youtubeConfig.channelId, youtubeConfig.playlistId, videoLimit),
    getVideoCategories(),
    getVideoCategoryAssignments(),
  ]);

  const hasAnyVideos = longForm.length > 0 || shorts.length > 0;

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Teachings"
          title="The Video Library"
          description="Full teachings organized by topic, plus every short clip posted to the channel."
        />

        <div className="mt-12">
          {youtubeConfig.channelId && hasAnyVideos ? (
            <TeachingsTabs
              longFormVideos={longForm}
              shorts={shorts}
              categories={categories}
              assignments={assignments}
            />
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

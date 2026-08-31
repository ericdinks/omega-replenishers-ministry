import { Hero } from "@/components/home/Hero";
import { QuickLinks } from "@/components/home/QuickLinks";
import { GivingCta } from "@/components/home/GivingCta";
import { VideoMessageSection } from "@/components/home/VideoMessageSection";
import { AnnouncementsBanner } from "@/components/home/AnnouncementsBanner";
import { getSiteContent } from "@/lib/content/site-content";
import { getActiveVideoMessage } from "@/lib/content/video-message";
import { getActiveAnnouncements } from "@/lib/content/announcements";

export const revalidate = 30;

export default async function HomePage() {
  const [content, videoMessage, announcements] = await Promise.all([
    getSiteContent(),
    getActiveVideoMessage(),
    getActiveAnnouncements(),
  ]);

  return (
    <>
      <Hero title={content.hero_title} description={content.hero_description} />
      <AnnouncementsBanner announcements={announcements} />
      <QuickLinks />
      <VideoMessageSection message={videoMessage} />
      <GivingCta />
    </>
  );
}

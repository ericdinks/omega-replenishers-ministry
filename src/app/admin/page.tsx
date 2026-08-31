import type { Metadata } from "next";
import { LogOut, Settings2 } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PrayerRequestsTable } from "@/components/admin/PrayerRequestsTable";
import { ContentEditorForm } from "@/components/admin/ContentEditorForm";
import { VideoMessageManager } from "@/components/admin/VideoMessageManager";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { DonationTiersManager } from "@/components/admin/DonationTiersManager";
import { VideoCategoriesManager } from "@/components/admin/VideoCategoriesManager";
import { VideoLimitSetting } from "@/components/admin/VideoLimitSetting";
import { AdminUsersManager, type AdminUserSummary } from "@/components/admin/AdminUsersManager";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { signOutAdmin } from "@/app/admin/actions";
import { youtubeConfig } from "@/lib/config/site";
import { getSiteContent, parseTeachingsVideoLimit } from "@/lib/content/site-content";
import { fetchOtherChannelVideos } from "@/lib/youtube/playlist";
import { getVideoCategories, getVideoCategoryAssignments } from "@/lib/content/video-categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = createSupabaseAdminClient();
  const serverClient = createSupabaseServerClient();
  const content = await getSiteContent();
  const videoLimit = parseTeachingsVideoLimit(content.teachings_video_limit);

  const [
    { data: requests, error: requestsError },
    { data: videoMessages },
    { data: announcements },
    { data: testimonials },
    { data: donationTiers },
    otherVideos,
    videoCategories,
    videoCategoryAssignments,
    { data: authUsers },
    {
      data: { user: currentUser },
    },
  ] = await Promise.all([
    admin.from("prayer_requests").select("*").order("created_at", { ascending: false }),
    admin
      .from("video_messages")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1),
    admin.from("announcements").select("*").order("created_at", { ascending: false }),
    admin.from("testimonials").select("*").order("created_at", { ascending: false }),
    admin.from("donation_tiers").select("*").order("display_order", { ascending: true }),
    fetchOtherChannelVideos(youtubeConfig.channelId, youtubeConfig.playlistId, videoLimit),
    getVideoCategories(),
    getVideoCategoryAssignments(),
    admin.auth.admin.listUsers(),
    serverClient.auth.getUser(),
  ]);

  const allRequests = requests ?? [];
  const pendingCount = allRequests.filter((r) => r.status === "pending").length;
  const answeredCount = allRequests.filter((r) => r.status === "answered").length;
  const currentVideoMessage = videoMessages?.[0] ?? null;
  const allAnnouncements = announcements ?? [];
  const allTestimonials = testimonials ?? [];
  const allDonationTiers = donationTiers ?? [];
  const adminUsers: AdminUserSummary[] = (authUsers?.users ?? [])
    .map((user) => ({
      id: user.id,
      email: user.email ?? "(no email)",
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="section-eyebrow">Ministry Operations</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
              Admin Dashboard
            </h1>
          </div>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 transition-colors hover:border-navy-900"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-navy-100 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              Total Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-navy-900">
              {allRequests.length}
            </p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Pending
            </p>
            <p className="mt-2 text-3xl font-bold text-navy-900">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Answered
            </p>
            <p className="mt-2 text-3xl font-bold text-navy-900">{answeredCount}</p>
          </div>
        </div>

        <div className="mt-10">
          <AdminTabs
            tabs={[
              {
                id: "prayer-requests",
                label: "Prayer Requests",
                content: requestsError ? (
                  <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                    Failed to load prayer requests. Confirm SUPABASE_SERVICE_ROLE_KEY
                    is set correctly.
                  </p>
                ) : (
                  <PrayerRequestsTable requests={allRequests} />
                ),
              },
              {
                id: "content",
                label: "Homepage & About Text",
                content: <ContentEditorForm content={content} />,
              },
              {
                id: "video",
                label: "Video Message",
                content: <VideoMessageManager current={currentVideoMessage} />,
              },
              {
                id: "announcements",
                label: "Announcements",
                content: <AnnouncementsManager announcements={allAnnouncements} />,
              },
              {
                id: "testimonials",
                label: "Testimonials",
                content: <TestimonialsManager testimonials={allTestimonials} />,
              },
              {
                id: "giving",
                label: "Giving Tiers",
                content: <DonationTiersManager tiers={allDonationTiers} />,
              },
              {
                id: "teachings",
                label: "Teachings & Categories",
                content: (
                  <div className="space-y-8">
                    <VideoLimitSetting currentLimit={videoLimit} />
                    <VideoCategoriesManager
                      videos={otherVideos}
                      categories={videoCategories}
                      assignments={videoCategoryAssignments}
                    />
                  </div>
                ),
              },
              {
                id: "operators",
                label: "Operators",
                content: (
                  <AdminUsersManager users={adminUsers} currentUserId={currentUser?.id ?? ""} />
                ),
              },
              {
                id: "settings",
                label: "Settings",
                content: (
                  <div className="rounded-xl border border-navy-100 bg-white p-6">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-gold-700" />
                      <h2 className="font-display text-lg font-bold text-navy-900">
                        School of the Prophets Playlist
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-navy-500">
                      The active YouTube playlist is configured via the{" "}
                      <code className="rounded bg-navy-50 px-1.5 py-0.5 text-xs">
                        NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID
                      </code>{" "}
                      environment variable so it can be rotated instantly without a
                      code deploy. Update it in your Vercel Project Settings →
                      Environment Variables, then redeploy.
                    </p>
                    <p className="mt-3 text-sm">
                      Current playlist ID:{" "}
                      <span className="font-mono text-navy-700">
                        {youtubeConfig.playlistId || "not configured"}
                      </span>
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

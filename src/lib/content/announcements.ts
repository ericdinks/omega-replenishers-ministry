import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { AnnouncementRow } from "@/lib/types/database";

/** Homepage shows at most this many announcements at once. */
export const MAX_HOMEPAGE_ANNOUNCEMENTS = 2;

/**
 * Returns the active announcements for the homepage (most recently
 * ordered, capped at MAX_HOMEPAGE_ANNOUNCEMENTS). Empty if Supabase isn't
 * configured, none are active, or the fetch fails.
 */
export async function getActiveAnnouncements(): Promise<AnnouncementRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(MAX_HOMEPAGE_ANNOUNCEMENTS);

    return data ?? [];
  } catch {
    return [];
  }
}

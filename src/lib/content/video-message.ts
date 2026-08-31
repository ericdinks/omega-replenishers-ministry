import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { VideoMessageRow } from "@/lib/types/database";

/**
 * Returns the single active video message for the homepage, or null if
 * Supabase isn't configured, none is active, or the fetch fails.
 */
export async function getActiveVideoMessage(): Promise<VideoMessageRow | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("video_messages")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ?? null;
  } catch {
    return null;
  }
}

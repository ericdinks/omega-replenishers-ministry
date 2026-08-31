import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { VideoCategoryRow } from "@/lib/types/database";

export async function getVideoCategories(): Promise<VideoCategoryRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("video_categories")
      .select("*")
      .order("display_order", { ascending: true });

    return data ?? [];
  } catch {
    return [];
  }
}

/** Map of videoId -> array of category ids it's tagged with. */
export type VideoCategoryAssignments = Record<string, string[]>;

export async function getVideoCategoryAssignments(): Promise<VideoCategoryAssignments> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {};
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("video_category_assignments")
      .select("video_id, category_id");

    const assignments: VideoCategoryAssignments = {};
    for (const row of data ?? []) {
      (assignments[row.video_id] ??= []).push(row.category_id);
    }
    return assignments;
  } catch {
    return {};
  }
}

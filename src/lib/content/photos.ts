import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { PhotoRow } from "@/lib/types/database";

export type PhotoAlbum = {
  album: string;
  photos: PhotoRow[];
};

/**
 * Returns every gallery photo grouped into albums, most recently created
 * album first (by its newest photo). Empty if Supabase isn't configured,
 * no photos exist, or the fetch fails.
 */
export async function getPhotoAlbums(): Promise<PhotoAlbum[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    const photos = data ?? [];
    const albumOrder: string[] = [];
    const grouped = new Map<string, PhotoRow[]>();

    for (const photo of photos) {
      if (!grouped.has(photo.album)) {
        grouped.set(photo.album, []);
        albumOrder.push(photo.album);
      }
      grouped.get(photo.album)!.push(photo);
    }

    return albumOrder.map((album) => ({ album, photos: grouped.get(album)! }));
  } catch {
    return [];
  }
}

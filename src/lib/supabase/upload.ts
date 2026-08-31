"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Uploads a file to the public `media` Storage bucket from an
 * authenticated admin session and returns its public URL. Storage RLS
 * (see supabase/migrations/0002_content_and_media.sql) restricts writes
 * to authenticated sessions, so this only succeeds when called from a
 * logged-in /admin page.
 */
export async function uploadMediaFile(file: Blob, path: string): Promise<string> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(path);

  return publicUrl;
}

/**
 * Uploads a file to the PRIVATE `digital-products` Storage bucket (see
 * supabase/migrations/0005_digital_products.sql) and returns the storage
 * path -- not a public URL, since this bucket has no public read access.
 * The path is later exchanged for a short-lived signed URL server-side,
 * only after a purchase is confirmed.
 */
export async function uploadDigitalProductFile(file: Blob, path: string): Promise<string> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.storage.from("digital-products").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return path;
}

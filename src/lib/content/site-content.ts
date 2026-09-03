import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * Text fields ministry operators can edit from /admin without a deploy.
 * Keys must match the `key` column seeded in
 * supabase/migrations/0002_content_and_media.sql.
 */
export const SITE_CONTENT_KEYS = [
  "hero_title",
  "hero_description",
  "hero_image_url",
  "about_description",
  "about_bio",
  "contact_phone",
  "contact_email",
  "contact_address",
  "teachings_video_limit",
  "order_notification_email",
] as const;

/** Hard ceiling: YouTube's playlistItems.list API caps maxResults at 50 per request. */
export const MAX_TEACHINGS_VIDEO_LIMIT = 50;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

export type SiteContent = Record<SiteContentKey, string>;

/**
 * Fallback copy used if Supabase isn't configured yet, a key hasn't been
 * seeded, or the fetch fails -- so pages never show blank text.
 */
export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero_title: "Encounter the Prophetic Word That Changes Nations",
  hero_description:
    "A global ministry under Prophet Shedrack A. O., gathering people from every nation for continual intercession that replenishes the Earth. Join us live, grow through the School of the Prophets, and bring your prayer needs to the altar.",
  // Empty by default -- Hero falls back to pastorConfig.heroPhotoSrc (the
  // bundled static image) until an admin uploads a replacement.
  hero_image_url: "",
  about_description:
    "A global ministry under Prophet Shedrack A. O., gathering people from every nation for continual intercession that replenishes the Earth.",
  about_bio:
    "A bond servant of God with the mandate to gather people from all phases of the world and let them replenish the Earth with continual intercession.",
  contact_phone: "+234 806 610 1405",
  contact_email: "prophetshedrackaogboji@gmail.com",
  contact_address: "Abuja, Nigeria",
  teachings_video_limit: "50",
  // NOTE: this must stay the email that owns the Resend account/API key
  // until a custom domain is verified with Resend -- their sandbox sender
  // can only deliver to that one address. Change this the moment a
  // different Resend account (or a verified domain) is in place.
  order_notification_email: "ericdinks1@gmail.com",
};

/**
 * Parses the teachings_video_limit setting to a safe integer, clamped to
 * [1, MAX_TEACHINGS_VIDEO_LIMIT] since that's YouTube's own API ceiling.
 */
export function parseTeachingsVideoLimit(rawValue: string): number {
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 50;
  return Math.min(parsed, MAX_TEACHINGS_VIDEO_LIMIT);
}

/**
 * Reads all editable text fields from `site_content`, falling back to
 * DEFAULT_SITE_CONTENT for any key that's missing (or if Supabase isn't
 * reachable). Safe to call from any Server Component.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return DEFAULT_SITE_CONTENT;
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase.from("site_content").select("key, value");

    const content = { ...DEFAULT_SITE_CONTENT };
    for (const row of data ?? []) {
      if ((SITE_CONTENT_KEYS as readonly string[]).includes(row.key)) {
        content[row.key as SiteContentKey] = row.value;
      }
    }
    return content;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

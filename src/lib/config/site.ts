/**
 * Central site configuration. Values that differ between environments
 * (social links, YouTube IDs, PayPal link) are read from env vars so
 * ministry operators can update them in Vercel without a code change.
 */

export const siteConfig = {
  name: "Omega Replenishers International Ministry",
  shortName: "Omega Replenishers",
  description:
    "A global ministry under Prophet Shedrack A. O., gathering people from every nation for continual intercession that replenishes the Earth.",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "School of the Prophets", href: "/school-of-the-prophets" },
  { label: "Teachings", href: "/teachings" },
  { label: "Live Broadcast", href: "/live-broadcast" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Giving", href: "/giving" },
  { label: "Prayer Altar", href: "/prayer-altar" },
  { label: "Contact", href: "/contact" },
] as const;

export const socialLinks = {
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
} as const;

/**
 * Founder & Senior Pastor. `photoSrc` is expected at
 * public/images/pastor-shedrack.jpg -- drop the real photo file there.
 */
export const pastorConfig = {
  name: "Prophet Shedrack A. O.",
  title: "Founder & Senior Pastor",
  ministryName: "Omega Replenishers International Ministry",
  bio: "A bond servant of God with the mandate to gather people from all phases of the world and let them replenish the Earth with continual intercession.",
  photoSrc: "/images/pastor-shedrack.jpg",
  /** Used on the homepage hero only -- a more dynamic, in-action shot. */
  heroPhotoSrc: "/images/pastor-shedrack-preaching.jpg",
} as const;

/**
 * Weekday live service. Times are fixed local-clock values (not
 * auto-converted), since Nigeria (WAT) does not observe daylight saving
 * while US Eastern does -- the EST figure holds for the US winter half
 * of the year and shifts to EDT (4pm) during daylight saving.
 */
export const serviceSchedule = {
  label: "Global Prayers & Prophetic Service",
  days: "Monday – Friday",
  nigeriaTime: "9:00 PM WAT",
  usEasternTime: "3:00 PM ET",
} as const;

export const youtubeConfig = {
  liveVideoId: process.env.NEXT_PUBLIC_YOUTUBE_LIVE_VIDEO_ID ?? "",
  channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ?? "",
  playlistId: process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID ?? "",
} as const;

export const paypalConfig = {
  link: process.env.NEXT_PUBLIC_PAYPAL_LINK ?? "",
  currency: process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD",
} as const;

export const testimonyCategories = [
  "Healing",
  "Financial Breakthrough",
  "Deliverance",
  "Restoration",
  "Salvation",
  "Marriage & Family",
] as const;

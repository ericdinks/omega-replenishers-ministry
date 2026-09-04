import type { MetadataRoute } from "next";

const SITE_URL = "https://www.omegareplenishers.com";

const PUBLIC_PATHS = [
  "",
  "/about",
  "/school-of-the-prophets",
  "/teachings",
  "/live-broadcast",
  "/testimonials",
  "/giving",
  "/store",
  "/prayer-altar",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}

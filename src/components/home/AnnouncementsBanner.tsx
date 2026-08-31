import Image from "next/image";
import { Megaphone } from "lucide-react";
import type { AnnouncementRow } from "@/lib/types/database";

/**
 * Displays up to two active announcements/posters published from /admin.
 * Each can be image-led, text-only, or both. Renders nothing if none are
 * active -- there is no placeholder announcement.
 */
export function AnnouncementsBanner({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  if (announcements.length === 0) return null;

  return (
    <section className="bg-navy-50 py-16 sm:py-20">
      <div className="container-page">
        <div
          className={`mx-auto grid gap-6 ${
            announcements.length > 1 ? "sm:grid-cols-2" : "max-w-2xl"
          }`}
        >
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm"
            >
              {announcement.image_url ? (
                <div className="relative aspect-[16/9] w-full bg-navy-100">
                  <Image
                    src={announcement.image_url}
                    alt={announcement.title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-gold">
                  <Megaphone className="h-4 w-4" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-navy-900">
                  {announcement.title}
                </h3>
                {announcement.body ? (
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">
                    {announcement.body}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Video } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { VideoMessageRow } from "@/lib/types/database";

/**
 * Shows the single active video message published from /admin (recorded
 * live via webcam or uploaded from disk). Renders nothing if none is
 * active -- there is no placeholder video.
 */
export function VideoMessageSection({ message }: { message: VideoMessageRow | null }) {
  if (!message) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="A Word For You"
          title="Message From the Pastor"
          description={message.caption || undefined}
        />

        <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl border border-navy-100 shadow-xl">
          <div className="relative aspect-video w-full bg-black">
            <video
              key={message.id}
              src={message.video_url}
              controls
              playsInline
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div className="flex items-center gap-2 bg-navy-900 px-4 py-3 text-xs font-medium uppercase tracking-wide text-navy-100">
            <Video className="h-4 w-4 text-gold" />
            {message.source_type === "recorded" ? "Recorded Live" : "Video Message"}
          </div>
        </div>
      </div>
    </section>
  );
}

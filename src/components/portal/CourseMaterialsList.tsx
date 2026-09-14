import { FileText } from "lucide-react";
import type { CourseMaterialRow } from "@/lib/types/database";

export function CourseMaterialsList({ materials }: { materials: CourseMaterialRow[] }) {
  if (materials.length === 0) {
    return <p className="text-sm text-navy-400">No materials have been posted yet -- check back soon.</p>;
  }

  return (
    <div className="space-y-6">
      {materials.map((material) => (
        <div key={material.id} className="rounded-lg border border-navy-100 bg-white p-5">
          <h3 className="font-display text-base font-bold text-navy-900">{material.title}</h3>
          {material.material_type === "youtube" && material.youtube_video_id ? (
            <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-md bg-navy-900">
              <iframe
                src={`https://www.youtube.com/embed/${material.youtube_video_id}`}
                title={material.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : (
            <p className="mt-2 flex items-start gap-2 text-sm text-navy-600">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy-400" />
              <span className="whitespace-pre-wrap">{material.body}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

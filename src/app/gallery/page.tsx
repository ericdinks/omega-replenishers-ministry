import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryAlbums } from "@/components/gallery/GalleryAlbums";
import { getPhotoAlbums } from "@/lib/content/photos";

export const metadata: Metadata = {
  title: "Pictures",
  description:
    "Photos from Omega Replenishers International Ministry services, crusades, and events.",
  alternates: { canonical: "/gallery" },
};

export const revalidate = 60;

export default async function GalleryPage() {
  const albums = await getPhotoAlbums();

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Pictures"
          title="Moments From the Ministry"
          description="Photos from our services, crusades, and events -- captured to celebrate what God is doing among us."
        />

        <div className="mt-12">
          {albums.length === 0 ? (
            <p className="text-center text-sm text-navy-400">
              No pictures have been posted yet -- check back soon.
            </p>
          ) : (
            <GalleryAlbums albums={albums} />
          )}
        </div>
      </div>
    </div>
  );
}

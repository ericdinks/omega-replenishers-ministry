"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PhotoAlbum } from "@/lib/content/photos";

export function GalleryAlbums({ albums }: { albums: PhotoAlbum[] }) {
  const allPhotos = useMemo(() => albums.flatMap((a) => a.photos), [albums]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const current = openIndex !== null ? allPhotos[openIndex] : null;

  useEffect(() => {
    if (openIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % allPhotos.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + allPhotos.length) % allPhotos.length));
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex, allPhotos.length]);

  return (
    <>
      <div className="space-y-12">
        {albums.map(({ album, photos }) => (
          <div key={album}>
            <h3 className="font-display text-lg font-bold text-navy-900">{album}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => {
                const globalIndex = allPhotos.indexOf(photo);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setOpenIndex(globalIndex)}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-navy-50"
                  >
                    <Image
                      src={photo.image_url}
                      alt={photo.caption || album}
                      fill
                      sizes="(min-width: 768px) 25vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {current ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? i : (i - 1 + allPhotos.length) % allPhotos.length));
            }}
            aria-label="Previous picture"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={current.image_url}
                alt={current.caption || "Gallery picture"}
                fill
                sizes="100vw"
                className="rounded-lg object-contain"
              />
            </div>
            {current.caption ? (
              <p className="mt-3 text-center text-sm text-white/80">{current.caption}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? i : (i + 1) % allPhotos.length));
            }}
            aria-label="Next picture"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      ) : null}
    </>
  );
}

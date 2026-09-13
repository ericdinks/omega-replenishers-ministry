"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createPhotos, deletePhoto } from "@/app/admin/actions";
import { uploadMediaFile } from "@/lib/supabase/upload";
import type { PhotoRow } from "@/lib/types/database";

type PhotoAlbum = { album: string; photos: PhotoRow[] };

function groupByAlbum(photos: PhotoRow[]): PhotoAlbum[] {
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
}

export function PhotosManager({ photos }: { photos: PhotoRow[] }) {
  const [album, setAlbum] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploading] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const albums = groupByAlbum(photos);

  function handleUpload() {
    if (!album.trim()) {
      setError("Give this album/event a name (e.g. \"Sunday Service - Sept 2026\").");
      return;
    }
    if (files.length === 0) {
      setError("Choose at least one picture to upload.");
      return;
    }
    setError(null);

    startUploading(async () => {
      try {
        const uploaded = await Promise.all(
          files.map(async (file) => {
            const extension = file.name.split(".").pop() ?? "jpg";
            const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
            const imageUrl = await uploadMediaFile(file, path);
            return { image_url: imageUrl, album: album.trim(), caption: caption.trim() };
          })
        );

        await createPhotos(uploaded);

        setAlbum("");
        setCaption("");
        setFiles([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload photos.");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this picture permanently? This can't be undone.")) return;
    setPendingId(id);
    try {
      await deletePhoto(id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">Upload Pictures</h3>
        <p className="mt-1 text-xs text-navy-400">
          Pictures are grouped by album/event name on the public Gallery page. Upload
          several at once by selecting multiple files.
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Album or event name (e.g. Youth Conference 2026)"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption applied to all uploaded pictures (optional)"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-navy-300 px-4 py-3 text-sm text-navy-600 hover:border-gold">
            <ImagePlus className="h-4 w-4" />
            {files.length > 0 ? `${files.length} picture(s) selected` : "Choose pictures"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            disabled={isUploading}
            onClick={handleUpload}
            className="btn-gold disabled:opacity-60"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Upload
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {albums.length === 0 ? (
          <p className="text-sm text-navy-400">No pictures uploaded yet.</p>
        ) : (
          albums.map(({ album: albumName, photos: albumPhotos }) => (
            <div key={albumName}>
              <h4 className="font-display text-sm font-bold text-navy-900">{albumName}</h4>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {albumPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-navy-100 bg-navy-50"
                  >
                    <Image
                      src={photo.image_url}
                      alt={photo.caption || albumName}
                      fill
                      sizes="(min-width: 768px) 25vw, 33vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      disabled={pendingId === photo.id}
                      onClick={() => handleDelete(photo.id)}
                      aria-label="Delete picture"
                      className="absolute right-1.5 top-1.5 rounded-full bg-navy-900/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 disabled:opacity-100 group-hover:opacity-100"
                    >
                      {pendingId === photo.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

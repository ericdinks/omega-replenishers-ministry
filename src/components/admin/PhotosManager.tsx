"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createPhotos, deletePhoto, reorderPhotos } from "@/app/admin/actions";
import { uploadMediaFile } from "@/lib/supabase/upload";
import type { PhotoRow } from "@/lib/types/database";

const DEFAULT_ALBUM = "General";

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

function movePhoto(photos: PhotoRow[], fromIndex: number, toIndex: number): PhotoRow[] {
  const next = [...photos];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved!);
  return next;
}

export function PhotosManager({ photos }: { photos: PhotoRow[] }) {
  const [album, setAlbum] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploading] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [albums, setAlbums] = useState<PhotoAlbum[]>(() => groupByAlbum(photos));
  useEffect(() => setAlbums(groupByAlbum(photos)), [photos]);

  const [dragged, setDragged] = useState<{ albumIndex: number; index: number } | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  function addFiles(incoming: FileList | null) {
    const imagesOnly = Array.from(incoming ?? []).filter((f) => f.type.startsWith("image/"));
    if (imagesOnly.length > 0) setError(null);
    setFiles((prev) => [...prev, ...imagesOnly]);
  }

  function handleUpload() {
    if (files.length === 0) {
      setError("Choose at least one picture to upload.");
      return;
    }
    setError(null);

    const targetAlbum = album.trim() || DEFAULT_ALBUM;
    const existingInAlbum = photos.filter((p) => p.album === targetAlbum);
    const startOrder =
      existingInAlbum.length > 0
        ? Math.max(...existingInAlbum.map((p) => p.display_order)) + 1
        : 0;

    startUploading(async () => {
      try {
        const uploaded = await Promise.all(
          files.map(async (file, index) => {
            const extension = file.name.split(".").pop() ?? "jpg";
            const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
            const imageUrl = await uploadMediaFile(file, path);
            return {
              image_url: imageUrl,
              album: targetAlbum,
              caption: caption.trim(),
              display_order: startOrder + index,
            };
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

  async function handleDrop(albumIndex: number, targetIndex: number) {
    setDragOverKey(null);
    if (!dragged || dragged.albumIndex !== albumIndex) {
      setDragged(null);
      return;
    }
    if (dragged.index === targetIndex) {
      setDragged(null);
      return;
    }

    const previousAlbums = albums;
    const reorderedPhotos = movePhoto(albums[albumIndex]!.photos, dragged.index, targetIndex);
    const nextAlbums = albums.map((a, i) => (i === albumIndex ? { ...a, photos: reorderedPhotos } : a));
    setAlbums(nextAlbums);
    setDragged(null);

    try {
      await reorderPhotos(reorderedPhotos.map((photo, i) => ({ id: photo.id, display_order: i })));
    } catch {
      setAlbums(previousAlbums);
      window.alert("Failed to save the new order. Please try again.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">Upload Pictures</h3>
        <p className="mt-1 text-xs text-navy-400">
          Pictures are grouped by album/event name on the public Gallery page. Leave the
          album blank to file them under &quot;{DEFAULT_ALBUM}&quot;. Upload several at once
          by selecting multiple files.
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Album or event name (optional, e.g. Youth Conference 2026)"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption applied to all uploaded pictures (optional)"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed px-4 py-6 text-center text-sm transition-colors ${
              isDraggingOver
                ? "border-gold bg-gold-50 text-gold-700"
                : "border-navy-300 text-navy-600 hover:border-gold"
            }`}
          >
            <ImagePlus className="h-5 w-5" />
            {files.length > 0 ? (
              <span>{files.length} picture(s) selected -- click or drop to add more</span>
            ) : (
              <span>Drag &amp; drop pictures here, or click to choose</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 ? (
            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-xs font-medium text-navy-400 hover:text-red-600"
            >
              Clear selected pictures
            </button>
          ) : null}

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
          albums.map(({ album: albumName, photos: albumPhotos }, albumIndex) => (
            <div key={albumName}>
              <h4 className="font-display text-sm font-bold text-navy-900">{albumName}</h4>
              {albumPhotos.length > 1 ? (
                <p className="mt-0.5 text-xs text-navy-400">Drag pictures to reorder them.</p>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {albumPhotos.map((photo, index) => {
                  const key = `${albumIndex}-${index}`;
                  return (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={(e) => {
                        setDragged({ albumIndex, index });
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnter={() => setDragOverKey(key)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnd={() => {
                        setDragged(null);
                        setDragOverKey(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(albumIndex, index);
                      }}
                      className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border bg-navy-50 active:cursor-grabbing ${
                        dragOverKey === key ? "border-gold ring-2 ring-gold" : "border-navy-100"
                      } ${dragged?.albumIndex === albumIndex && dragged.index === index ? "opacity-40" : ""}`}
                    >
                      <Image
                        src={photo.image_url}
                        alt={photo.caption || albumName}
                        fill
                        sizes="(min-width: 768px) 25vw, 33vw"
                        className="pointer-events-none object-cover"
                      />
                      <div className="absolute left-1.5 top-1.5 rounded-full bg-navy-900/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
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
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

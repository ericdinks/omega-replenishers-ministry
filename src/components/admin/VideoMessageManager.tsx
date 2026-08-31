"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Circle, Loader2, Square, Trash2, Upload, Video } from "lucide-react";
import { publishVideoMessage, removeActiveVideoMessage } from "@/app/admin/actions";
import { uploadMediaFile } from "@/lib/supabase/upload";
import type { VideoMessageRow } from "@/lib/types/database";

const PREFERRED_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function VideoMessageManager({
  current,
}: {
  current: VideoMessageRow | null;
}) {
  const [mode, setMode] = useState<"record" | "upload">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, startPublishing] = useTransition();
  const [isRemoving, startRemoving] = useTransition();

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.muted = true;
        await videoPreviewRef.current.play();
      }
    } catch {
      setError(
        "Couldn't access your camera/microphone. Check your browser's site permissions and try again."
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
  }

  function startRecording() {
    if (!streamRef.current) return;
    const mimeType = pickSupportedMimeType();
    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined
    );
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType ?? "video/webm" });
      setRecordedBlob(blob);
      stopCamera();
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  function resetRecording() {
    setRecordedBlob(null);
    setUploadedFile(null);
    setError(null);
  }

  function handlePublish() {
    const fileToPublish = mode === "record" ? recordedBlob : uploadedFile;
    if (!fileToPublish) return;

    setError(null);
    startPublishing(async () => {
      try {
        const extension = mode === "record" ? "webm" : uploadedFile?.name.split(".").pop() ?? "mp4";
        const path = `videos/${Date.now()}.${extension}`;
        const publicUrl = await uploadMediaFile(fileToPublish, path);
        await publishVideoMessage(publicUrl, mode === "record" ? "recorded" : "uploaded", caption);
        resetRecording();
        setCaption("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to publish video message.");
      }
    });
  }

  const pendingFile = mode === "record" ? recordedBlob : uploadedFile;

  return (
    <div className="space-y-6">
      {current ? (
        <div className="rounded-lg border border-navy-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Currently Live on Homepage
          </p>
          <video src={current.video_url} controls className="mt-3 max-h-64 w-full rounded-md bg-black" />
          {current.caption ? (
            <p className="mt-2 text-sm text-navy-600">{current.caption}</p>
          ) : null}
          <button
            type="button"
            disabled={isRemoving}
            onClick={() => startRemoving(async () => removeActiveVideoMessage())}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Remove from homepage
          </button>
        </div>
      ) : (
        <p className="text-sm text-navy-400">No video message is currently live.</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            resetRecording();
            setMode("record");
          }}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "record"
              ? "border-navy-900 bg-navy-900 text-white"
              : "border-navy-200 text-navy-600"
          }`}
        >
          Record with camera
        </button>
        <button
          type="button"
          onClick={() => {
            resetRecording();
            stopCamera();
            setMode("upload");
          }}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "border-navy-900 bg-navy-900 text-white"
              : "border-navy-200 text-navy-600"
          }`}
        >
          Upload a file
        </button>
      </div>

      {mode === "record" ? (
        <div className="space-y-3">
          {recordedBlob ? (
            <video
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="max-h-64 w-full rounded-md bg-black"
            />
          ) : (
            <video ref={videoPreviewRef} className="max-h-64 w-full rounded-md bg-navy-900" />
          )}

          <div className="flex flex-wrap gap-3">
            {!streamRef.current && !recordedBlob ? (
              <button type="button" onClick={startCamera} className="btn-outline-navy">
                <Video className="h-4 w-4" />
                Enable Camera
              </button>
            ) : null}
            {streamRef.current && !isRecording && !recordedBlob ? (
              <button type="button" onClick={startRecording} className="btn-gold">
                <Circle className="h-4 w-4 fill-current" />
                Start Recording
              </button>
            ) : null}
            {isRecording ? (
              <button type="button" onClick={stopRecording} className="btn-gold">
                <Square className="h-4 w-4 fill-current" />
                Stop Recording
              </button>
            ) : null}
            {recordedBlob ? (
              <button type="button" onClick={resetRecording} className="btn-outline-navy">
                Record Again
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {uploadedFile ? (
            <video
              src={URL.createObjectURL(uploadedFile)}
              controls
              className="max-h-64 w-full rounded-md bg-black"
            />
          ) : null}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-navy-300 px-4 py-3 text-sm text-navy-600 hover:border-gold">
            <Upload className="h-4 w-4" />
            {uploadedFile ? uploadedFile.name : "Choose a video file"}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      <div>
        <label htmlFor="video-caption" className="block text-sm font-medium text-navy-800">
          Caption (optional)
        </label>
        <input
          id="video-caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="A short note about this message"
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={!pendingFile || isPublishing}
        onClick={handlePublish}
        className="btn-gold disabled:opacity-50"
      >
        {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Publish to Homepage
      </button>
    </div>
  );
}

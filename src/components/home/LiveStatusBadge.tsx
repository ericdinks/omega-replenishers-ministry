"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

interface LiveStatusResponse {
  configured: boolean;
  isLive: boolean;
}

const POLL_INTERVAL_MS = 60_000;

/**
 * Polls /api/youtube/live-status and renders a pulsing "LIVE NOW" pill
 * that deep-links straight into the Live Broadcast player when the
 * ministry's channel is actively streaming. When the YouTube Data API
 * is not configured, it degrades to a neutral schedule link rather than
 * asserting a live status it cannot verify.
 */
export function LiveStatusBadge() {
  const [status, setStatus] = useState<LiveStatusResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkLiveStatus() {
      try {
        const response = await fetch("/api/youtube/live-status", {
          cache: "no-store",
        });
        const data = (await response.json()) as LiveStatusResponse;
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setStatus({ configured: false, isLive: false });
      }
    }

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const isLive = status?.isLive ?? false;

  return (
    <Link
      href="/live-broadcast"
      className={`group inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide shadow-sm transition-colors ${
        isLive
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-navy-100 bg-white text-navy-600 hover:border-gold/50 hover:text-gold-700"
      }`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {isLive ? (
          <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-red-500" />
        ) : null}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            isLive ? "bg-red-500" : "bg-navy-300"
          }`}
        />
      </span>
      {isLive ? "Live Now — Join the Broadcast" : "Watch the Live Broadcast"}
      <Radio className="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

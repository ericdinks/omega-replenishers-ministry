"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updatePrayerRequestStatus } from "@/app/admin/actions";
import type { PrayerRequestStatus } from "@/lib/types/database";

export function StatusToggle({
  id,
  status,
}: {
  id: string;
  status: PrayerRequestStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const nextStatus: PrayerRequestStatus =
    status === "pending" ? "answered" : "pending";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await updatePrayerRequestStatus(id, nextStatus);
        })
      }
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-60 ${
        status === "answered"
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
      }`}
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      {status}
      <span className="text-navy-400">→ mark {nextStatus}</span>
    </button>
  );
}

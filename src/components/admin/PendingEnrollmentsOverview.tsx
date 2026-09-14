"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { confirmEnrollment } from "@/app/portal/actions";
import { paypalConfig } from "@/lib/config/site";
import type { CourseEnrollmentRow } from "@/lib/types/database";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function PendingEnrollmentsOverview({
  enrollments,
  courseTitleById,
  emailById,
}: {
  enrollments: CourseEnrollmentRow[];
  courseTitleById: Record<string, string>;
  emailById: Record<string, string>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(enrollment: CourseEnrollmentRow) {
    setError(null);
    setPendingId(enrollment.id);
    try {
      await confirmEnrollment(enrollment.id, enrollment.course_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm the enrollment.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <h3 className="font-display text-sm font-bold text-navy-900">
        Pending Course Payments ({enrollments.length})
      </h3>
      <p className="mt-1 text-xs text-navy-500">
        Check your PayPal account for the matching payment before marking an enrollment active.
      </p>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {enrollments.length === 0 ? (
        <p className="mt-3 text-sm text-navy-400">No pending course payments.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy-100 bg-white p-4"
            >
              <div>
                <p className="font-medium text-navy-900">
                  {courseTitleById[enrollment.course_id] ?? "Unknown course"}
                </p>
                <p className="text-sm text-navy-600">
                  {emailById[enrollment.student_id] ?? "Unknown student"}
                </p>
                <p className="text-xs text-navy-400">
                  {formatDateTime(enrollment.created_at)} &middot; {paypalConfig.currency}{" "}
                  {enrollment.amount_due}
                </p>
              </div>
              <button
                type="button"
                disabled={pendingId === enrollment.id}
                onClick={() => handleConfirm(enrollment)}
                className="btn-outline-navy !py-1.5 !text-xs disabled:opacity-60"
              >
                {pendingId === enrollment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Mark Active
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

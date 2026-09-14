"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCourse, setCourseActive } from "@/app/portal/actions";
import { paypalConfig } from "@/lib/config/site";
import type { CourseRow } from "@/lib/types/database";

export function TeacherCoursesList({ courses }: { courses: CourseRow[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleToggleActive(course: CourseRow) {
    setPendingId(course.id);
    try {
      await setCourseActive(course.id, !course.is_active);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(courseId: string) {
    if (!window.confirm("Delete this course and all its materials permanently?")) return;
    setPendingId(courseId);
    try {
      await deleteCourse(courseId);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <h3 className="font-display text-sm font-bold text-navy-900">My Courses ({courses.length})</h3>
      {courses.length === 0 ? (
        <p className="mt-2 text-sm text-navy-400">You haven&apos;t created any courses yet.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col gap-3 rounded-lg border border-navy-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/portal/courses/${course.id}`}
                  className="font-medium text-navy-900 hover:text-gold-700"
                >
                  {course.title}
                </Link>
                <p className="text-xs text-navy-400">
                  {course.price > 0 ? `${paypalConfig.currency} ${course.price}` : "Free"} &middot;{" "}
                  {course.is_active ? "Active" : "Hidden"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={pendingId === course.id}
                  onClick={() => handleToggleActive(course)}
                  className="text-sm font-medium text-navy-600 hover:text-gold-700 disabled:opacity-60"
                >
                  {course.is_active ? "Hide" : "Publish"}
                </button>
                <button
                  type="button"
                  disabled={pendingId === course.id}
                  onClick={() => handleDelete(course.id)}
                  aria-label="Delete course"
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {pendingId === course.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

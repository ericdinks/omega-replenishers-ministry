import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { CourseRow } from "@/lib/types/database";

export function CourseCatalog({
  courses,
  enrolledCourseIds,
  currency,
}: {
  courses: CourseRow[];
  enrolledCourseIds: string[];
  currency: string;
}) {
  if (courses.length === 0) {
    return <p className="text-sm text-navy-400">No courses are available yet -- check back soon.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const isEnrolled = enrolledCourseIds.includes(course.id);
        return (
          <Link
            key={course.id}
            href={`/portal/courses/${course.id}`}
            className="flex flex-col rounded-xl border border-navy-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="font-display text-lg font-bold text-navy-900">{course.title}</h3>
            <p className="mt-2 flex-1 text-sm text-navy-500">{course.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-gold-700">
                {course.price > 0 ? `${currency} ${course.price}` : "Free"}
              </span>
              {isEnrolled ? (
                <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Enrolled
                </span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

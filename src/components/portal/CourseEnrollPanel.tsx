"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { enrollInCourse } from "@/app/portal/actions";
import { buildPaypalUrl } from "@/lib/utils/paypal";
import type { CourseEnrollmentRow, CourseRow } from "@/lib/types/database";

export function CourseEnrollPanel({
  course,
  isLoggedIn,
  enrollment,
  currency,
}: {
  course: CourseRow;
  isLoggedIn: boolean;
  isStudent: boolean;
  enrollment: CourseEnrollmentRow | null;
  currency: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, startEnrolling] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-navy-100 bg-navy-50 p-6 text-center">
        <p className="text-sm text-navy-600">Sign in or create a student account to enroll.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/portal/login" className="btn-outline-navy">
            Sign In
          </Link>
          <Link href="/portal/signup" className="btn-gold">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (enrollment?.status === "pending_payment") {
    const paypalUrl = buildPaypalUrl(enrollment.amount_due);
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm font-medium text-amber-800">
          Your enrollment is awaiting payment confirmation.
        </p>
        <a href={paypalUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4">
          Pay {currency} {enrollment.amount_due} on PayPal
        </a>
        <p className="mt-2 text-xs text-navy-500">
          Once your payment is confirmed, you&apos;ll get access to the course materials here.
        </p>
      </div>
    );
  }

  function handleEnroll() {
    setError(null);
    startEnrolling(async () => {
      try {
        await enrollInCourse(course.id, course.price);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to enroll.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50 p-6 text-center">
      <p className="text-lg font-bold text-gold-700">
        {course.price > 0 ? `${currency} ${course.price}` : "Free"}
      </p>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={isEnrolling}
        onClick={handleEnroll}
        className="btn-gold mt-4 disabled:opacity-60"
      >
        {isEnrolling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        Enroll {course.price > 0 ? "& Pay" : "Now"}
      </button>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { CreateCourseForm } from "@/components/portal/CreateCourseForm";
import { TeacherCoursesList } from "@/components/portal/TeacherCoursesList";
import { CourseCatalog } from "@/components/portal/CourseCatalog";
import { paypalConfig } from "@/lib/config/site";
import type { CourseRow } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Training Portal",
  description: "Courses from Omega Replenishers International Ministry's School of the Prophets training program.",
  alternates: { canonical: "/portal" },
};

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let role: "admin" | "teacher" | "student" | null = null;
  let teacherCourses: CourseRow[] = [];
  let enrolledCourseIds: string[] = [];

  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    role = profile?.role ?? null;

    if (role === "teacher") {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", session.user.id)
        .order("created_at", { ascending: false });
      teacherCourses = data ?? [];
    }

    if (role === "student") {
      const { data } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .eq("student_id", session.user.id);
      enrolledCourseIds = (data ?? []).map((row) => row.course_id);
    }
  }

  const publicClient = createSupabasePublicClient();
  const { data: activeCourses } = await publicClient
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Training Portal"
          title="Grow Through Structured Courses"
          description="Courses from the School of the Prophets, with video lessons and materials from our teachers."
        />

        {!session ? (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/portal/login" className="btn-outline-navy">
              Sign In
            </Link>
            <Link href="/portal/signup" className="btn-gold">
              <GraduationCap className="h-4 w-4" />
              Create Student Account
            </Link>
          </div>
        ) : null}

        {role === "teacher" ? (
          <div className="mt-12 space-y-8">
            <CreateCourseForm />
            <TeacherCoursesList courses={teacherCourses} />
          </div>
        ) : null}

        {role === "admin" ? (
          <div className="mt-8 rounded-lg border border-navy-100 bg-navy-50 p-5 text-center">
            <p className="text-sm text-navy-600">
              You&apos;re signed in as a ministry admin. Create teacher accounts and confirm
              course payments from the{" "}
              <Link href="/admin" className="font-medium text-gold-700 hover:underline">
                Training Portal tab in /admin
              </Link>
              . This page below is what students and teachers see.
            </p>
          </div>
        ) : null}

        <div className="mt-14">
          <h2 className="font-display text-xl font-bold text-navy-900">
            {role === "student" ? "All Courses" : "Available Courses"}
          </h2>
          <div className="mt-6">
            <CourseCatalog
              courses={activeCourses ?? []}
              enrolledCourseIds={enrolledCourseIds}
              currency={paypalConfig.currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

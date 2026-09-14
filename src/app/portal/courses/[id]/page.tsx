import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { CourseManager } from "@/components/portal/CourseManager";
import { CourseMaterialsList } from "@/components/portal/CourseMaterialsList";
import { CourseEnrollPanel } from "@/components/portal/CourseEnrollPanel";
import { paypalConfig } from "@/lib/config/site";
import type { CourseEnrollmentRow, CourseMaterialRow, CourseRow } from "@/lib/types/database";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createSupabasePublicClient();
  const { data: course } = await supabase.from("courses").select("title").eq("id", params.id).maybeSingle();

  return {
    title: course?.title ?? "Course",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const client = session ? supabase : createSupabasePublicClient();
  const { data: course } = await client
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<CourseRow>();

  if (!course) notFound();

  let role: "admin" | "teacher" | "student" | null = null;
  let myEnrollment: CourseEnrollmentRow | null = null;

  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    role = profile?.role ?? null;

    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("course_id", course.id)
      .eq("student_id", session.user.id)
      .maybeSingle<CourseEnrollmentRow>();
    myEnrollment = enrollment ?? null;
  }

  const isOwner = session?.user.id === course.teacher_id;
  const canManage = isOwner || role === "admin";
  const hasActiveAccess = myEnrollment?.status === "active";

  let materials: CourseMaterialRow[] = [];
  let enrollments: CourseEnrollmentRow[] = [];

  if (canManage) {
    const [materialsResult, enrollmentsResult] = await Promise.all([
      supabase
        .from("course_materials")
        .select("*")
        .eq("course_id", course.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at", { ascending: false }),
    ]);
    materials = materialsResult.data ?? [];
    enrollments = enrollmentsResult.data ?? [];
  } else if (hasActiveAccess) {
    const { data } = await supabase
      .from("course_materials")
      .select("*")
      .eq("course_id", course.id)
      .order("display_order", { ascending: true });
    materials = data ?? [];
  }

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page max-w-3xl">
        <p className="section-eyebrow">Training Portal</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-navy-900">{course.title}</h1>
        <p className="mt-3 text-navy-500">{course.description}</p>

        <div className="mt-8">
          {canManage ? (
            <CourseManager course={course} materials={materials} enrollments={enrollments} />
          ) : hasActiveAccess ? (
            <CourseMaterialsList materials={materials} />
          ) : (
            <CourseEnrollPanel
              course={course}
              isLoggedIn={Boolean(session)}
              isStudent={role === "student"}
              enrollment={myEnrollment}
              currency={paypalConfig.currency}
            />
          )}
        </div>
      </div>
    </div>
  );
}

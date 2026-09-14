"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeEmail, sanitizeText } from "@/lib/utils/sanitize";
import { extractYoutubeVideoId } from "@/lib/utils/youtube";
import type { CourseMaterialType } from "@/lib/types/database";

/**
 * These actions run under the signed-in user's own session (not the
 * service-role client), so row level security -- not a JS role check --
 * is what actually enforces who can touch what. That's deliberate: a
 * teacher can only affect their own courses, a student only their own
 * enrollment, and an admin can touch everything, purely because that's
 * what the RLS policies in 0008/0009 already say. This is also why the
 * same `confirmEnrollment` action below works from both the teacher's
 * course page and the admin Training Portal tab -- whoever calls it, the
 * database itself decides whether the write is allowed.
 */
async function requireSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/portal/login");
  }

  return session;
}

/**
 * Creates a new student login and profile. Uses the admin client only
 * because creating a Supabase Auth user requires the service role -- the
 * account itself is a plain student with no elevated access. The caller
 * signs in immediately afterward with the same credentials.
 *
 * Returns `{ error }` instead of throwing on a known, user-facing failure
 * (e.g. duplicate email). A thrown Error here would cross the Server
 * Component render boundary on this page's next automatic refresh and get
 * redacted to a generic digest in production -- returning a plain value
 * keeps the real message reaching the form.
 */
export async function registerStudent(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const fullName = sanitizeText(input.fullName);
  const email = sanitizeEmail(input.email);

  if (!fullName || !email || input.password.length < 6) {
    return { error: "Enter your name, a valid email, and a password of at least 6 characters." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { role: "student", full_name: fullName },
  });

  if (error) {
    return { error: error.message || "Failed to create your account." };
  }

  return {};
}

export async function createCourse(input: {
  title: string;
  description: string;
  price: number;
}): Promise<{ error?: string }> {
  const session = await requireSession();
  const supabase = createSupabaseServerClient();

  const title = sanitizeText(input.title);
  if (!title) return { error: "Give the course a title." };

  const { error } = await supabase.from("courses").insert({
    teacher_id: session.user.id,
    title,
    description: sanitizeText(input.description),
    price: Math.max(0, input.price || 0),
  });

  if (error) return { error: "Failed to create the course." };

  revalidatePath("/portal");
  return {};
}

export async function setCourseActive(
  courseId: string,
  isActive: boolean
): Promise<{ error?: string }> {
  await requireSession();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("courses").update({ is_active: isActive }).eq("id", courseId);
  if (error) return { error: "Failed to update the course." };

  revalidatePath("/portal");
  revalidatePath(`/portal/courses/${courseId}`);
  return {};
}

export async function deleteCourse(courseId: string): Promise<{ error?: string }> {
  await requireSession();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return { error: "Failed to delete the course." };

  revalidatePath("/portal");
  return {};
}

export async function addCourseMaterial(input: {
  courseId: string;
  title: string;
  materialType: CourseMaterialType;
  youtubeUrl?: string;
  body?: string;
  displayOrder: number;
}): Promise<{ error?: string }> {
  await requireSession();
  const supabase = createSupabaseServerClient();

  const title = sanitizeText(input.title);
  if (!title) return { error: "Give the material a title." };

  let youtubeVideoId: string | null = null;
  if (input.materialType === "youtube") {
    youtubeVideoId = extractYoutubeVideoId(input.youtubeUrl ?? "");
    if (!youtubeVideoId) return { error: "That doesn't look like a valid YouTube link." };
  }

  const { error } = await supabase.from("course_materials").insert({
    course_id: input.courseId,
    title,
    material_type: input.materialType,
    youtube_video_id: youtubeVideoId,
    body: sanitizeText(input.body ?? ""),
    display_order: input.displayOrder,
  });

  if (error) return { error: "Failed to add the material." };

  revalidatePath(`/portal/courses/${input.courseId}`);
  return {};
}

export async function deleteCourseMaterial(
  materialId: string,
  courseId: string
): Promise<{ error?: string }> {
  await requireSession();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("course_materials").delete().eq("id", materialId);
  if (error) return { error: "Failed to delete the material." };

  revalidatePath(`/portal/courses/${courseId}`);
  return {};
}

export async function reorderCourseMaterials(
  courseId: string,
  updates: { id: string; display_order: number }[]
): Promise<{ error?: string }> {
  await requireSession();
  const supabase = createSupabaseServerClient();

  const results = await Promise.all(
    updates.map(({ id, display_order }) =>
      supabase.from("course_materials").update({ display_order }).eq("id", id)
    )
  );

  if (results.some((r) => r.error)) return { error: "Failed to reorder the materials." };

  revalidatePath(`/portal/courses/${courseId}`);
  return {};
}

/**
 * Self-enrollment. Free courses go straight to `active`; paid courses go
 * to `pending_payment` and the client then sends the student to PayPal --
 * mirroring the store's manual PayPal.me + admin-confirms flow, since the
 * ministry's PayPal account can't do automated Checkout (see the store
 * for why).
 */
export async function enrollInCourse(courseId: string, price: number): Promise<{ error?: string }> {
  const session = await requireSession();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("course_enrollments").insert({
    course_id: courseId,
    student_id: session.user.id,
    status: price > 0 ? "pending_payment" : "active",
    amount_due: price,
  });

  if (error) return { error: "Failed to enroll. You may already be enrolled in this course." };

  revalidatePath(`/portal/courses/${courseId}`);
  return {};
}

/** Marks a pending enrollment active once the teacher/admin confirms the PayPal payment landed. */
export async function confirmEnrollment(
  enrollmentId: string,
  courseId: string
): Promise<{ error?: string }> {
  await requireSession();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("course_enrollments")
    .update({ status: "active" })
    .eq("id", enrollmentId);

  if (error) return { error: "Failed to confirm the enrollment." };

  revalidatePath(`/portal/courses/${courseId}`);
  revalidatePath("/admin");
  return {};
}

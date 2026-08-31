"use server";

import { prayerRequestSchema, type PrayerRequestFormState, type PrayerRequestInput } from "@/lib/validation/prayer";
import { sanitizeEmail, sanitizeText } from "@/lib/utils/sanitize";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * Validates, sanitizes, and persists a Prayer Altar submission. This is
 * the sole write path into `prayer_requests`; the table's row level
 * security policy allows anonymous INSERT only, so no request data is
 * ever readable back through this same client (see
 * supabase/migrations/0001_init.sql).
 */
export async function submitPrayerRequest(
  input: PrayerRequestInput
): Promise<PrayerRequestFormState> {
  const parsed = prayerRequestSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: PrayerRequestFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof PrayerRequestInput | undefined;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const sanitized = {
    full_name: sanitizeText(parsed.data.fullName),
    email: sanitizeEmail(parsed.data.email),
    request: sanitizeText(parsed.data.request),
    is_public: parsed.data.isPublic,
  };

  const supabase = createSupabasePublicClient();
  const { error } = await supabase.from("prayer_requests").insert(sanitized);

  if (error) {
    return {
      status: "error",
      message:
        "We couldn't submit your prayer request right now. Please try again shortly.",
    };
  }

  return {
    status: "success",
    message:
      "Your prayer request has been received. Our prayer team will be standing in agreement with you.",
  };
}

import { z } from "zod";

/**
 * Validation for the Prayer Altar submission form. Mirrors the
 * constraints enforced at the database layer (see
 * supabase/migrations/0001_init.sql) so invalid input is rejected
 * before it ever reaches Supabase.
 */
export const prayerRequestSchema = z.object({
  fullName: z
    .string()
    .min(2, "Please share your full name.")
    .max(200, "Name is too long."),
  email: z
    .string()
    .min(3, "Please share a valid email address.")
    .max(320, "Email is too long.")
    .email("Please enter a valid email address."),
  request: z
    .string()
    .min(10, "Please share a bit more detail in your prayer request.")
    .max(4000, "Prayer request is too long (4000 characters max)."),
  isPublic: z.boolean().default(false),
});

export type PrayerRequestInput = z.infer<typeof prayerRequestSchema>;

export interface PrayerRequestFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof PrayerRequestInput, string>>;
}

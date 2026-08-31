import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Privileged Supabase client using the service role key. This BYPASSES
 * row level security and must never be imported into client components
 * or exposed to the browser. It exists solely so the /admin dashboard
 * (already gated by Supabase Auth + middleware) can read every prayer
 * request, since the public RLS policy intentionally allows INSERT only.
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. The admin dashboard cannot read prayer requests without it."
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

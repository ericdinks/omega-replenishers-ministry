import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Anonymous, session-less Supabase client for public reads inside Server
 * Components (e.g. the Testimonials Wall). Uses only the public anon key
 * and is constrained entirely by row level security — safe to call from
 * anywhere, including pages with no user session.
 */
export function createSupabasePublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

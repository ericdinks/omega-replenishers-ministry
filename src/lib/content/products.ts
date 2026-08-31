import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { ProductRow } from "@/lib/types/database";

export async function getActiveProducts(): Promise<ProductRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    return data ?? [];
  } catch {
    return [];
  }
}

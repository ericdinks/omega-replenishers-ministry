import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { DonationTierRow } from "@/lib/types/database";

/**
 * Fallback tiers used only if Supabase isn't configured or the fetch
 * fails -- matches what was seeded in
 * supabase/migrations/0003_donation_tiers.sql so the page never shows
 * something different from what admins expect to edit.
 */
const DEFAULT_DONATION_TIERS: DonationTierRow[] = [
  {
    id: "default-seed",
    created_at: "",
    label: "Seed Offering",
    amount: 25,
    description: "Sow a seed of faith into the ministry's work.",
    is_active: true,
    display_order: 1,
  },
  {
    id: "default-tithe",
    created_at: "",
    label: "Tithe",
    amount: 100,
    description: "Bring your tithe in faithful obedience.",
    is_active: true,
    display_order: 2,
  },
  {
    id: "default-partner",
    created_at: "",
    label: "Kingdom Partner",
    amount: 250,
    description: "Partner monthly to advance the Gospel globally.",
    is_active: true,
    display_order: 3,
  },
  {
    id: "default-vision",
    created_at: "",
    label: "Vision Offering",
    amount: 500,
    description: "Invest directly into the ministry's vision and outreach.",
    is_active: true,
    display_order: 4,
  },
];

export async function getActiveDonationTiers(): Promise<DonationTierRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return DEFAULT_DONATION_TIERS;
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("donation_tiers")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    return data && data.length > 0 ? data : DEFAULT_DONATION_TIERS;
  } catch {
    return DEFAULT_DONATION_TIERS;
  }
}

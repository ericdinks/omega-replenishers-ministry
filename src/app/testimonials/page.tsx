import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialsGrid } from "@/components/testimonials/TestimonialsGrid";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Real miracle and breakthrough reports from the Omega Replenishers International Ministry community.",
};

export const revalidate = 60;

async function getApprovedTestimonials() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("status", "approved")
    .order("testimony_date", { ascending: false });

  return data ?? [];
}

export default async function TestimonialsPage() {
  const testimonials = await getApprovedTestimonials();

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Testimony Wall"
          title="Miracles & Breakthrough Reports"
          description="Every testimony here is submitted by real members of this ministry and reviewed before it is published."
        />

        <div className="mt-12">
          <TestimonialsGrid testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}

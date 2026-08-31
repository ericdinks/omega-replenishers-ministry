"use client";

import { useMemo, useState } from "react";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import type { TestimonialRow } from "@/lib/types/database";

export function TestimonialsGrid({
  testimonials,
}: {
  testimonials: TestimonialRow[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(testimonials.map((t) => t.category))).sort(),
    [testimonials]
  );

  const filtered = useMemo(
    () =>
      activeCategory
        ? testimonials.filter((t) => t.category === activeCategory)
        : testimonials,
    [testimonials, activeCategory]
  );

  return (
    <div>
      {categories.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-navy-200 text-navy-600 hover:border-navy-900"
            }`}
          >
            All Testimonies
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "border-gold bg-gold text-navy-900"
                  : "border-navy-200 text-navy-600 hover:border-gold"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="mx-auto mt-12 max-w-xl rounded-lg border border-dashed border-navy-200 bg-navy-50 p-10 text-center">
          <p className="text-sm text-navy-500">
            {testimonials.length === 0
              ? "Testimonies are reviewed before publishing. Check back soon to read what God is doing."
              : "No testimonies in this category yet."}
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      )}
    </div>
  );
}

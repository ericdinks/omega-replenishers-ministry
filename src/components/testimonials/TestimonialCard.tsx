import { Quote } from "lucide-react";
import type { TestimonialRow } from "@/lib/types/database";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function TestimonialCard({ testimonial }: { testimonial: TestimonialRow }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-navy-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <Quote className="h-7 w-7 text-gold/70" aria-hidden="true" />
      <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-700">
        {testimonial.content}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-navy-100 pt-4">
        <div>
          <p className="font-display text-sm font-bold text-navy-900">
            {testimonial.name}
          </p>
          <p className="text-xs text-navy-400">
            {formatDate(testimonial.testimony_date)}
          </p>
        </div>
        <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700">
          {testimonial.category}
        </span>
      </div>
    </article>
  );
}

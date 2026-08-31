"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  createTestimonial,
  deleteTestimonial,
  setTestimonialStatus,
} from "@/app/admin/actions";
import { testimonyCategories } from "@/lib/config/site";
import type { TestimonialRow, TestimonialStatus } from "@/lib/types/database";

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES: Record<TestimonialStatus, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-navy-100 text-navy-500",
};

export function TestimonialsManager({
  testimonials,
}: {
  testimonials: TestimonialRow[];
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [category, setCategory] = useState<string>(testimonyCategories[0]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleCreate() {
    if (!name.trim() || !content.trim()) {
      setError("Please fill in the name and testimony content.");
      return;
    }
    setError(null);

    startCreating(async () => {
      try {
        await createTestimonial({
          name: name.trim(),
          testimony_date: date,
          category,
          content: content.trim(),
        });
        setName("");
        setContent("");
        setDate(todayISODate());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save the testimony.");
      }
    });
  }

  async function handleStatusChange(id: string, status: TestimonialStatus) {
    setPendingId(id);
    try {
      await setTestimonialStatus(id, status);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    setPendingId(id);
    try {
      await deleteTestimonial(id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">Add a Testimony</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:col-span-2"
          >
            {testimonyCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Testimony content"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:col-span-2"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={isCreating}
          onClick={handleCreate}
          className="btn-gold mt-4 disabled:opacity-60"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Publish Testimony
        </button>
      </div>

      <div className="space-y-3">
        {testimonials.length === 0 ? (
          <p className="text-sm text-navy-400">No testimonies yet.</p>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-navy-100 bg-white p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-navy-900">{testimonial.name}</p>
                  <span className="text-xs text-navy-400">
                    {formatDate(testimonial.testimony_date)}
                  </span>
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold-700">
                    {testimonial.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[testimonial.status]}`}
                  >
                    {testimonial.status}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-navy-600">{testimonial.content}</p>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-2">
                <select
                  value={testimonial.status}
                  disabled={pendingId === testimonial.id}
                  onChange={(e) =>
                    handleStatusChange(testimonial.id, e.target.value as TestimonialStatus)
                  }
                  className="rounded-md border border-navy-200 px-2 py-1 text-xs text-navy-700 disabled:opacity-60"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  disabled={pendingId === testimonial.id}
                  onClick={() => handleDelete(testimonial.id)}
                  className="text-red-600 hover:text-red-700 disabled:opacity-60"
                  aria-label="Delete testimony"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

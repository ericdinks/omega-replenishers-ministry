"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { createCourse } from "@/app/portal/actions";

export function CreateCourseForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();

  function handleCreate() {
    if (!title.trim()) {
      setError("Give the course a title.");
      return;
    }
    setError(null);

    startCreating(async () => {
      try {
        await createCourse({
          title: title.trim(),
          description: description.trim(),
          price: Number.parseFloat(price) || 0,
        });
        setTitle("");
        setDescription("");
        setPrice("0");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create the course.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-5">
      <h3 className="font-display text-sm font-bold text-navy-900">Create a Course</h3>
      <p className="mt-1 text-xs text-navy-400">
        Set a price to require enrollment payment via PayPal, or leave it at 0 for free
        instant enrollment.
      </p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course title"
          className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Description (optional)"
          className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-navy-600">Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-28 rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={isCreating}
          onClick={handleCreate}
          className="btn-gold disabled:opacity-60"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Course
        </button>
      </div>
    </div>
  );
}

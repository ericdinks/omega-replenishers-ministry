"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import {
  addCourseMaterial,
  confirmEnrollment,
  deleteCourseMaterial,
  reorderCourseMaterials,
} from "@/app/portal/actions";
import { paypalConfig } from "@/lib/config/site";
import type { CourseEnrollmentRow, CourseMaterialRow, CourseMaterialType, CourseRow } from "@/lib/types/database";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function AddMaterialForm({ courseId, nextOrder }: { courseId: string; nextOrder: number }) {
  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState<CourseMaterialType>("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function handleAdd() {
    if (!title.trim()) {
      setError("Give the material a title.");
      return;
    }
    setError(null);

    startSaving(async () => {
      try {
        await addCourseMaterial({
          courseId,
          title: title.trim(),
          materialType,
          youtubeUrl,
          body,
          displayOrder: nextOrder,
        });
        setTitle("");
        setYoutubeUrl("");
        setBody("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add the material.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-5">
      <h4 className="font-display text-sm font-bold text-navy-900">Add Material</h4>
      <div className="mt-3 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={materialType === "youtube"}
              onChange={() => setMaterialType("youtube")}
            />
            YouTube Video
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={materialType === "text"}
              onChange={() => setMaterialType("text")}
            />
            Text Note
          </label>
        </div>

        {materialType === "youtube" ? (
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Unlisted YouTube link (e.g. https://youtu.be/...)"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        ) : (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write the lesson note here"
            className="block w-full rounded-md border border-navy-200 px-4 py-2.5 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={isSaving}
          onClick={handleAdd}
          className="btn-gold disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Material
        </button>
      </div>
    </div>
  );
}

function MaterialsManager({ courseId, materials }: { courseId: string; materials: CourseMaterialRow[] }) {
  const [items, setItems] = useState(materials);
  useEffect(() => setItems(materials), [materials]);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dragged, setDragged] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  async function handleDelete(materialId: string) {
    if (!window.confirm("Delete this material permanently?")) return;
    setPendingId(materialId);
    try {
      await deleteCourseMaterial(materialId, courseId);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDrop(targetIndex: number) {
    setDragOverIndex(null);
    if (dragged === null || dragged === targetIndex) {
      setDragged(null);
      return;
    }

    const previous = items;
    const next = [...items];
    const [moved] = next.splice(dragged, 1);
    next.splice(targetIndex, 0, moved!);
    setItems(next);
    setDragged(null);

    try {
      await reorderCourseMaterials(
        courseId,
        next.map((m, i) => ({ id: m.id, display_order: i }))
      );
    } catch {
      setItems(previous);
      window.alert("Failed to save the new order. Please try again.");
    }
  }

  return (
    <div>
      <h4 className="font-display text-sm font-bold text-navy-900">
        Materials ({items.length}) {items.length > 1 ? <span className="font-normal text-navy-400">-- drag to reorder</span> : null}
      </h4>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-navy-400">No materials yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((material, index) => (
            <div
              key={material.id}
              draggable
              onDragStart={() => setDragged(index)}
              onDragEnter={() => setDragOverIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={() => {
                setDragged(null);
                setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(index);
              }}
              className={`flex cursor-grab items-center justify-between gap-3 rounded-lg border bg-white p-3 active:cursor-grabbing ${
                dragOverIndex === index ? "border-gold ring-2 ring-gold" : "border-navy-100"
              } ${dragged === index ? "opacity-40" : ""}`}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-navy-300" />
                <div>
                  <p className="text-sm font-medium text-navy-900">{material.title}</p>
                  <p className="text-xs text-navy-400">
                    {material.material_type === "youtube" ? "YouTube Video" : "Text Note"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={pendingId === material.id}
                onClick={() => handleDelete(material.id)}
                aria-label="Delete material"
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {pendingId === material.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EnrollmentsManager({ courseId, enrollments }: { courseId: string; enrollments: CourseEnrollmentRow[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleConfirm(enrollmentId: string) {
    setPendingId(enrollmentId);
    try {
      await confirmEnrollment(enrollmentId, courseId);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <h4 className="font-display text-sm font-bold text-navy-900">
        Enrollments ({enrollments.length})
      </h4>
      {enrollments.length === 0 ? (
        <p className="mt-2 text-sm text-navy-400">No one has enrolled yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy-100 bg-white p-3"
            >
              <div>
                <p className="text-sm text-navy-700">{formatDateTime(enrollment.created_at)}</p>
                {enrollment.amount_due > 0 ? (
                  <p className="text-xs text-navy-400">
                    {paypalConfig.currency} {enrollment.amount_due}
                  </p>
                ) : null}
              </div>
              {enrollment.status === "active" ? (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <Check className="h-3 w-3" />
                  Active
                </span>
              ) : (
                <button
                  type="button"
                  disabled={pendingId === enrollment.id}
                  onClick={() => handleConfirm(enrollment.id)}
                  className="btn-outline-navy !py-1.5 !text-xs disabled:opacity-60"
                >
                  {pendingId === enrollment.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Mark Active (payment confirmed)
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CourseManager({
  course,
  materials,
  enrollments,
}: {
  course: CourseRow;
  materials: CourseMaterialRow[];
  enrollments: CourseEnrollmentRow[];
}) {
  const nextOrder = materials.length > 0 ? Math.max(...materials.map((m) => m.display_order)) + 1 : 0;

  return (
    <div className="space-y-8">
      <AddMaterialForm courseId={course.id} nextOrder={nextOrder} />
      <MaterialsManager courseId={course.id} materials={materials} />
      <EnrollmentsManager courseId={course.id} enrollments={enrollments} />
    </div>
  );
}

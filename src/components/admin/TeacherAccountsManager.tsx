"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { createTeacherAccount, deleteTeacherAccount } from "@/app/admin/actions";
import type { AdminUserSummary } from "@/components/admin/AdminUsersManager";

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function TeacherAccountsManager({ teachers }: { teachers: AdminUserSummary[] }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleCreate() {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError("Enter a name, email, and a password of at least 6 characters.");
      return;
    }
    setError(null);
    startCreating(async () => {
      try {
        await createTeacherAccount(fullName, email.trim(), password);
        setFullName("");
        setEmail("");
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create the account.");
      }
    });
  }

  async function handleDelete(userId: string) {
    if (!window.confirm("Delete this teacher account and all their courses permanently?")) return;
    setPendingId(userId);
    try {
      await deleteTeacherAccount(userId);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">New Teacher Account</h3>
        <p className="mt-1 text-xs text-navy-500">
          Teachers create and manage their own courses and materials at /portal.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={isCreating}
          onClick={handleCreate}
          className="btn-gold mt-4 disabled:opacity-60"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create Teacher Account
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-navy-900">
          Teachers ({teachers.length})
        </h3>
        {teachers.length === 0 ? (
          <p className="text-sm text-navy-400">No teacher accounts yet.</p>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex flex-col gap-3 rounded-lg border border-navy-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-navy-900">{teacher.email}</p>
                <p className="text-xs text-navy-400">
                  Created {formatDate(teacher.createdAt)} &middot; Last sign-in{" "}
                  {formatDate(teacher.lastSignInAt)}
                </p>
              </div>
              <button
                type="button"
                disabled={pendingId === teacher.id}
                onClick={() => handleDelete(teacher.id)}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
                aria-label={`Delete ${teacher.email}`}
              >
                {pendingId === teacher.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

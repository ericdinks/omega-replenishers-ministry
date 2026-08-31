"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, Trash2, UserPlus } from "lucide-react";
import {
  createAdminUser,
  deleteAdminUser,
  resetAdminUserPassword,
} from "@/app/admin/actions";

export interface AdminUserSummary {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ResetPasswordRow({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, startSaving] = useTransition();

  function handleSave() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    startSaving(async () => {
      try {
        await resetAdminUserPassword(userId, password);
        setSuccess(true);
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reset password.");
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setSuccess(false);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-gold-700"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Reset Password
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="w-40 rounded-md border border-navy-200 px-2 py-1 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
      <button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className="rounded-md bg-gold px-2.5 py-1 text-xs font-semibold text-navy-900 disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          setPassword("");
          setError(null);
        }}
        className="text-xs text-navy-400 hover:text-navy-600"
      >
        Cancel
      </button>
      {success ? <span className="text-xs font-medium text-green-700">Password updated</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export function AdminUsersManager({
  users,
  currentUserId,
}: {
  users: AdminUserSummary[];
  currentUserId: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleCreate() {
    if (!email.trim() || password.length < 6) {
      setError("Enter an email and a password of at least 6 characters.");
      return;
    }
    setError(null);
    startCreating(async () => {
      try {
        await createAdminUser(email.trim(), password);
        setEmail("");
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create the account.");
      }
    });
  }

  async function handleDelete(userId: string) {
    setPendingDeleteId(userId);
    try {
      await deleteAdminUser(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete the account.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">New Operator Account</h3>
        <p className="mt-1 text-xs text-navy-500">
          Creates a login with full access to this dashboard -- the same as any other
          operator account.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
          Create Account
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-navy-900">
          Current Operators ({users.length})
        </h3>
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-lg border border-navy-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-navy-900">
                {user.email}
                {user.id === currentUserId ? (
                  <span className="ml-2 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold-700">
                    You
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-navy-400">
                Created {formatDate(user.createdAt)} &middot; Last sign-in{" "}
                {formatDate(user.lastSignInAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ResetPasswordRow userId={user.id} />
              {user.id !== currentUserId && users.length > 1 ? (
                <button
                  type="button"
                  disabled={pendingDeleteId === user.id}
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  aria-label={`Delete ${user.email}`}
                >
                  {pendingDeleteId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

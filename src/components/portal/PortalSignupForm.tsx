"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { registerStudent } from "@/app/portal/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PortalSignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  function handleSubmit() {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError("Enter your name, a valid email, and a password of at least 6 characters.");
      return;
    }
    setError(null);

    startSubmitting(async () => {
      const result = await registerStudent({ fullName, email, password });
      if (result.error) {
        setError(result.error);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Account created -- please sign in.");
        router.push("/portal/login");
        return;
      }

      router.push("/portal");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-navy-800">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-navy-800">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleSubmit}
        className="btn-gold w-full disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Create Account
      </button>
    </div>
  );
}

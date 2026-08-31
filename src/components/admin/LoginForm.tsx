"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError("Invalid email or password.");
      return;
    }

    const redirectedFrom = searchParams.get("redirectedFrom") ?? "/admin";
    router.push(redirectedFrom);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy-800">
          Operator Email
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button type="submit" disabled={isSubmitting} className="btn-gold w-full disabled:opacity-60">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { submitPrayerRequest } from "@/app/prayer-altar/actions";
import type { PrayerRequestFormState } from "@/lib/validation/prayer";

const initialState: PrayerRequestFormState = { status: "idle" };

export function PrayerForm() {
  const [formState, setFormState] = useState<PrayerRequestFormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await submitPrayerRequest({
        fullName,
        email,
        request,
        isPublic,
      });
      setFormState(result);

      if (result.status === "success") {
        setFullName("");
        setEmail("");
        setRequest("");
        setIsPublic(false);
      }
    });
  }

  if (formState.status === "success") {
    return (
      <div className="flex flex-col items-center rounded-xl border border-gold/30 bg-gold/5 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-gold" />
        <h3 className="mt-4 font-display text-xl font-bold text-navy-900">
          Prayer Request Received
        </h3>
        <p className="mt-2 max-w-sm text-sm text-navy-500">{formState.message}</p>
        <button
          type="button"
          onClick={() => setFormState(initialState)}
          className="btn-outline mt-6 !text-navy-900 !border-navy-900 hover:!bg-navy-900 hover:!text-white"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-navy-800">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="Jane Doe"
        />
        {formState.fieldErrors?.fullName ? (
          <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.fullName}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy-800">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="jane@example.com"
        />
        {formState.fieldErrors?.email ? (
          <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="request" className="block text-sm font-medium text-navy-800">
          Confidential Prayer Request
        </label>
        <textarea
          id="request"
          name="request"
          required
          rows={6}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-navy-200 px-4 py-2.5 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="Share what's on your heart. This is read only by the ministry prayer team."
        />
        {formState.fieldErrors?.request ? (
          <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.request}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-md border border-navy-100 bg-navy-50 p-4">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-navy-300 text-gold focus:ring-gold"
        />
        <span className="text-sm text-navy-600">
          I&apos;m open to my testimony being shared publicly once this prayer is
          answered. (Leave unchecked to keep this fully private.)
        </span>
      </label>

      {formState.status === "error" && formState.message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {formState.message}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-gold w-full disabled:opacity-60">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Prayer Request"
        )}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-navy-400">
        <ShieldCheck className="h-4 w-4" />
        Your submission is encrypted in transit and never displayed publicly
        unless you opt in.
      </p>
    </form>
  );
}

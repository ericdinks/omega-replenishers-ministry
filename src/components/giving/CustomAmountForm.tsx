"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { paypalConfig } from "@/lib/config/site";
import { buildPaypalUrl } from "@/lib/utils/paypal";

export function CustomAmountForm() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isConfigured = Boolean(paypalConfig.link);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    const url = buildPaypalUrl(numericAmount);
    if (!url) {
      setError("Giving is not configured yet. Please contact the ministry office.");
      return;
    }

    setError(null);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
      <label htmlFor="customAmount" className="block text-sm font-medium text-navy-800">
        Give a Custom Amount
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-navy-400">
            {paypalConfig.currency}
          </span>
          <input
            id="customAmount"
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="150"
            className="w-full rounded-md border border-navy-200 py-2.5 pl-16 pr-4 text-navy-900 shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <button
          type="submit"
          disabled={!isConfigured}
          className="btn-gold whitespace-nowrap disabled:opacity-50"
        >
          Give Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {!isConfigured ? (
        <p className="mt-2 text-sm text-navy-400">
          NEXT_PUBLIC_PAYPAL_LINK is not configured yet.
        </p>
      ) : null}
    </form>
  );
}

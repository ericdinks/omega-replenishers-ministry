"use client";

import { useState } from "react";
import { HandCoins } from "lucide-react";
import { paypalConfig } from "@/lib/config/site";
import { buildPaypalUrl } from "@/lib/utils/paypal";
import type { DonationTierRow } from "@/lib/types/database";

function TierCard({ tier, isPaypalConfigured }: { tier: DonationTierRow; isPaypalConfigured: boolean }) {
  const [amount, setAmount] = useState(String(tier.amount));
  const numericAmount = Number(amount);
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const canGive = isPaypalConfigured && isValidAmount;

  return (
    <div className="flex flex-col rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-gold">
        <HandCoins className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{tier.label}</h3>
      <p className="mt-2 flex-1 text-sm text-navy-500">{tier.description}</p>

      <label htmlFor={`amount-${tier.id}`} className="mt-4 text-xs font-medium text-navy-500">
        Amount to give
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-navy-400">
          {paypalConfig.currency}
        </span>
        <input
          id={`amount-${tier.id}`}
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-navy-200 py-2.5 pl-16 pr-4 text-lg font-bold text-gold-700 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <a
        href={canGive ? buildPaypalUrl(numericAmount) : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!canGive}
        className={`btn-gold mt-4 ${!canGive ? "pointer-events-none opacity-50" : ""}`}
      >
        Give {paypalConfig.currency} {isValidAmount ? amount : "--"}
      </a>
    </div>
  );
}

export function DonationTiers({ tiers }: { tiers: DonationTierRow[] }) {
  const isPaypalConfigured = Boolean(paypalConfig.link);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {tiers.map((tier) => (
        <TierCard key={tier.id} tier={tier} isPaypalConfigured={isPaypalConfigured} />
      ))}
    </div>
  );
}

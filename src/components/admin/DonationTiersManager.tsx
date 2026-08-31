"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import {
  createDonationTier,
  deleteDonationTier,
  setDonationTierActive,
  updateDonationTier,
} from "@/app/admin/actions";
import { paypalConfig } from "@/lib/config/site";
import type { DonationTierRow } from "@/lib/types/database";

function TierRow({ tier }: { tier: DonationTierRow }) {
  const [label, setLabel] = useState(tier.label);
  const [amount, setAmount] = useState(String(tier.amount));
  const [description, setDescription] = useState(tier.description);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isToggling, startToggling] = useTransition();

  const isDirty =
    label !== tier.label || amount !== String(tier.amount) || description !== tier.description;

  function handleSave() {
    const numericAmount = Number(amount);
    if (!label.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a label and a suggested amount greater than zero.");
      return;
    }
    setError(null);
    startSaving(async () => {
      try {
        await updateDonationTier(tier.id, {
          label: label.trim(),
          amount: numericAmount,
          description: description.trim(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr,140px]">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          className="rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-navy-400">
            {paypalConfig.currency}
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            title="Suggested amount -- donors see this pre-filled but can change it before giving"
            className="w-full rounded-md border border-navy-200 py-2 pl-12 pr-3 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-navy-400">
        Suggested amount only -- donors can type a different amount on /giving.
      </p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Description"
        className="mt-3 block w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-navy-900 disabled:opacity-40"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
          <button
            type="button"
            disabled={isToggling}
            onClick={() =>
              startToggling(async () => setDonationTierActive(tier.id, !tier.is_active))
            }
            className="text-xs font-medium text-navy-600 hover:text-gold-700 disabled:opacity-60"
          >
            {tier.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => startDeleting(async () => deleteDonationTier(tier.id))}
          className="text-red-600 hover:text-red-700 disabled:opacity-60"
          aria-label="Delete tier"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <span
        className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
          tier.is_active ? "bg-green-100 text-green-700" : "bg-navy-100 text-navy-500"
        }`}
      >
        {tier.is_active ? "Active on /giving" : "Inactive"}
      </span>
    </div>
  );
}

export function DonationTiersManager({ tiers }: { tiers: DonationTierRow[] }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();

  function handleCreate() {
    const numericAmount = Number(amount);
    if (!label.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a label and a suggested amount greater than zero.");
      return;
    }
    setError(null);

    startCreating(async () => {
      try {
        await createDonationTier({
          label: label.trim(),
          amount: numericAmount,
          description: description.trim(),
          display_order: tiers.length,
        });
        setLabel("");
        setAmount("");
        setDescription("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create the donation tier.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">New Giving Tier</h3>
        <p className="mt-1 text-xs text-navy-500">
          The amount here is just a starting suggestion -- every tier lets the
          donor type their own amount on the Giving page before they give.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,140px]">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Building Fund"
            className="rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-navy-400">
              {paypalConfig.currency}
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50"
              className="w-full rounded-md border border-navy-200 py-2 pl-12 pr-3 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Short description shown on the card"
          className="mt-3 block w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={isCreating}
          onClick={handleCreate}
          className="btn-gold mt-4 disabled:opacity-60"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Add Tier
        </button>
      </div>

      <div className="space-y-3">
        {tiers.length === 0 ? (
          <p className="text-sm text-navy-400">No donation tiers yet.</p>
        ) : (
          tiers.map((tier) => <TierRow key={tier.id} tier={tier} />)
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Mail, Trash2 } from "lucide-react";
import { deleteProductOrder, generateProductDownloadLink, setProductOrderStatus } from "@/app/admin/actions";
import { paypalConfig } from "@/lib/config/site";
import type { ProductOrderRow } from "@/lib/types/database";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function OrderRow({
  order,
  productTitle,
}: {
  order: ProductOrderRow;
  productTitle: string;
}) {
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isUpdating, startUpdating] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete() {
    startDeleting(() => deleteProductOrder(order.id));
  }

  function handleGenerateLink() {
    setError(null);
    startGenerating(async () => {
      try {
        const url = await generateProductDownloadLink(order.product_id);
        setDownloadLink(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate link.");
      }
    });
  }

  async function handleCopy() {
    if (!downloadLink) return;
    await navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref = downloadLink
    ? `mailto:${order.customer_email}?subject=${encodeURIComponent(
        `Your purchase: ${productTitle}`
      )}&body=${encodeURIComponent(
        `Hi ${order.customer_name},\n\nThank you for your purchase! Here is your download link (valid for 7 days):\n${downloadLink}\n\nGod bless you.`
      )}`
    : undefined;

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-navy-900">{productTitle}</p>
          <p className="text-sm text-navy-600">
            {order.customer_name} &middot; {order.customer_email}
          </p>
          <p className="text-xs text-navy-400">
            {formatDateTime(order.created_at)} &middot; {paypalConfig.currency} {order.amount}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              order.status === "fulfilled"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {order.status}
          </span>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              startUpdating(async () =>
                setProductOrderStatus(order.id, order.status === "fulfilled" ? "pending" : "fulfilled")
              )
            }
            className="text-xs font-medium text-navy-600 hover:text-gold-700 disabled:opacity-60"
          >
            {order.status === "fulfilled" ? "Mark Pending" : "Mark Fulfilled"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            aria-label="Delete order"
            className="text-navy-400 hover:text-red-600 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="mt-3 border-t border-navy-100 pt-3">
        {!downloadLink ? (
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateLink}
            className="btn-outline-navy !py-1.5 !text-xs disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Generate Download Link
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                readOnly
                value={downloadLink}
                className="min-w-0 flex-1 rounded-md border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs text-navy-700"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-navy-200 px-2.5 py-1.5 text-xs font-medium text-navy-700 hover:border-gold"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-1.5 rounded-md border border-navy-200 px-2.5 py-1.5 text-xs font-medium text-navy-700 hover:border-gold"
              >
                <Mail className="h-3.5 w-3.5" />
                Email Customer
              </a>
            </div>
            <p className="text-xs text-navy-400">
              Link expires in 7 days. Verify the payment landed in your PayPal account before
              sending it.
            </p>
          </div>
        )}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

export function ProductOrdersManager({
  orders,
  productTitles,
}: {
  orders: ProductOrderRow[];
  productTitles: Record<string, string>;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "fulfilled">("all");

  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "fulfilled"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === option
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-navy-200 text-navy-600 hover:border-navy-900"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filteredOrders.length === 0 ? (
          <p className="text-sm text-navy-400">No orders in this view.</p>
        ) : (
          filteredOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              productTitle={productTitles[order.product_id] ?? "Unknown product"}
            />
          ))
        )}
      </div>
    </div>
  );
}

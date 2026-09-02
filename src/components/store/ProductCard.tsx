"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { BookOpen, CheckCircle2, Download, Loader2 } from "lucide-react";
import { createProductOrder } from "@/app/store/actions";
import { paypalConfig } from "@/lib/config/site";
import { loadPaypalScript } from "@/lib/paypal/loadPaypalScript";
import type { ProductRow } from "@/lib/types/database";

interface PaypalNamespace {
  Buttons: (config: {
    style?: Record<string, string | number>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError?: (err: unknown) => void;
  }) => { render: (container: HTMLElement) => void };
}

export function ProductCard({ product }: { product: ProductRow }) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRenderedRef = useRef(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createProductOrder({
        productId: product.id,
        customerName: name,
        customerEmail: email,
      });

      if (result.status === "error" || !result.orderId) {
        setError(result.message ?? "Something went wrong. Please try again.");
        return;
      }

      setOrderId(result.orderId);
    });
  }

  useEffect(() => {
    if (!orderId || buttonsRenderedRef.current || !paypalContainerRef.current) return;
    if (!paypalConfig.clientId) {
      setError("Checkout isn't configured yet. Please contact the ministry office.");
      return;
    }

    buttonsRenderedRef.current = true;

    loadPaypalScript(paypalConfig.clientId, paypalConfig.currency)
      .then(() => {
        const paypal = (window as unknown as { paypal?: PaypalNamespace }).paypal;
        if (!paypal || !paypalContainerRef.current) return;

        paypal
          .Buttons({
            style: { layout: "horizontal", height: 40 },
            createOrder: async () => {
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id }),
              });
              const data = await response.json();
              if (!data.paypalOrderId) throw new Error(data.error ?? "Failed to start checkout.");
              return data.paypalOrderId;
            },
            onApprove: async (data) => {
              const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paypalOrderId: data.orderID, orderId }),
              });
              const result = await response.json();
              if (result.downloadUrl) {
                setDownloadUrl(result.downloadUrl);
              } else {
                setError(result.error ?? "Payment could not be confirmed. Please contact the ministry office.");
              }
            },
            onError: () => {
              setError("PayPal encountered an error. Please try again.");
            },
          })
          .render(paypalContainerRef.current);
      })
      .catch(() => setError("Failed to load PayPal. Please try again."));
  }, [orderId, product.id]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
      <div className="relative aspect-[3/4] w-full bg-navy-100">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-navy-300">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-gold-700">
          {product.category}
        </span>
        <h3 className="mt-2 font-display text-lg font-bold text-navy-900">{product.title}</h3>
        <p className="mt-2 flex-1 text-sm text-navy-500">{product.description}</p>
        <p className="mt-3 text-xl font-extrabold text-gold-700">
          {paypalConfig.currency} {product.price}
        </p>

        {downloadUrl ? (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-center">
            <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Payment successful!
            </p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-3 w-full"
            >
              <Download className="h-4 w-4" />
              Download Now
            </a>
            <p className="mt-2 text-xs text-navy-400">
              Also emailed to you. Link expires in 7 days.
            </p>
          </div>
        ) : !isPurchasing ? (
          <button type="button" onClick={() => setIsPurchasing(true)} className="btn-gold mt-4">
            Buy Now
          </button>
        ) : !orderId ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="block w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="block w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={isPending} className="btn-gold w-full disabled:opacity-60">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue to Payment
            </button>
          </form>
        ) : (
          <div className="mt-4">
            <div ref={paypalContainerRef} />
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { createProductOrder } from "@/app/store/actions";
import { paypalConfig } from "@/lib/config/site";
import type { ProductRow } from "@/lib/types/database";

export function ProductCard({ product }: { product: ProductRow }) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createProductOrder({
        productId: product.id,
        customerName: name,
        customerEmail: email,
      });

      if (result.status === "error") {
        setError(result.message ?? "Something went wrong. Please try again.");
        return;
      }

      if (result.paypalUrl) {
        setRedirecting(true);
        window.location.href = result.paypalUrl;
      }
    });
  }

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

        {!isPurchasing ? (
          <button type="button" onClick={() => setIsPurchasing(true)} className="btn-gold mt-4">
            Buy Now
          </button>
        ) : (
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
            <button
              type="submit"
              disabled={isPending || redirecting}
              className="btn-gold w-full disabled:opacity-60"
            >
              {isPending || redirecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {redirecting ? "Redirecting to PayPal..." : "Please wait..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Continue to PayPal
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

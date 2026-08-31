"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductRow } from "@/lib/types/database";

export function StoreGrid({ products }: { products: ProductRow[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filtered = useMemo(
    () => (activeCategory ? products.filter((p) => p.category === activeCategory) : products),
    [products, activeCategory]
  );

  return (
    <div>
      {categories.length > 1 ? (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-navy-200 text-navy-600 hover:border-navy-900"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "border-gold bg-gold text-navy-900"
                  : "border-navy-200 text-navy-600 hover:border-gold"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

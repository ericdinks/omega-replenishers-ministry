import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StoreGrid } from "@/components/store/StoreGrid";
import { getActiveProducts } from "@/lib/content/products";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Store",
  description: `E-books, music, and other resources from ${siteConfig.name}.`,
  alternates: { canonical: "/store" },
};

export const revalidate = 30;

export default async function StorePage() {
  const products = await getActiveProducts();

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Resources"
          title="The Store"
          description="E-books, music, and other resources to strengthen your walk. All purchases are processed securely through PayPal."
        />

        <div className="mt-12">
          {products.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-navy-200 bg-navy-50 p-10 text-center">
              <p className="text-sm text-navy-500">
                Nothing is available for purchase yet. Check back soon.
              </p>
            </div>
          ) : (
            <StoreGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}

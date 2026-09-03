"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { BookOpen, Check, Copy, FileText, Image as ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  generateProductDownloadLink,
  replaceProductFile,
  setProductActive,
  updateProduct,
} from "@/app/admin/actions";
import { uploadDigitalProductFile, uploadMediaFile } from "@/lib/supabase/upload";
import { paypalConfig } from "@/lib/config/site";
import type { ProductRow } from "@/lib/types/database";

/** file_path is stored as e.g. "products/1234567890.pdf" -- just show the filename. */
function fileNameFromPath(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function ProductFileSection({ product }: { product: ProductRow }) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isReplacing, startReplacing] = useTransition();

  function handleGetLink() {
    setError(null);
    startGenerating(async () => {
      try {
        const url = await generateProductDownloadLink(product.id);
        setLink(url);
        setCopied(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate link.");
      }
    });
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReplaceFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    startReplacing(async () => {
      try {
        const extension = file.name.split(".").pop() ?? "bin";
        const newPath = `products/${Date.now()}.${extension}`;
        await uploadDigitalProductFile(file, newPath);
        await replaceProductFile(product.id, newPath);
        setLink(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to replace the file.");
      }
    });
  }

  return (
    <div className="mt-2 rounded-md border border-navy-100 bg-navy-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm text-navy-700">
          <FileText className="h-4 w-4 text-navy-400" />
          {fileNameFromPath(product.file_path)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGetLink}
            className="text-xs font-medium text-navy-600 hover:text-gold-700 disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> : "Preview / Get Link"}
          </button>
          <label className="cursor-pointer text-xs font-medium text-navy-600 hover:text-gold-700">
            {isReplacing ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> : "Replace File"}
            <input
              type="file"
              className="hidden"
              disabled={isReplacing}
              onChange={(e) => handleReplaceFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>

      {link ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={link}
            className="min-w-0 flex-1 rounded-md border border-navy-200 bg-white px-3 py-1.5 text-xs text-navy-700"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-navy-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy-700 hover:border-gold"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gold-700 hover:underline"
          >
            Open
          </a>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function ProductRowItem({ product }: { product: ProductRow }) {
  const [title, setTitle] = useState(product.title);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isToggling, startToggling] = useTransition();

  const isDirty =
    title !== product.title ||
    category !== product.category ||
    price !== String(product.price) ||
    description !== product.description;

  function handleSave() {
    const numericPrice = Number(price);
    if (!title.trim() || !category.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a title, category, and a price greater than zero.");
      return;
    }
    setError(null);
    startSaving(async () => {
      try {
        await updateProduct(product.id, {
          title: title.trim(),
          category: category.trim(),
          price: numericPrice,
          description: description.trim(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-4">
      <div className="flex gap-4">
        {product.cover_image_url ? (
          <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-navy-100">
            <Image src={product.cover_image_url} alt={product.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-20 w-16 flex-shrink-0 items-center justify-center rounded-md bg-navy-100 text-navy-300">
            <BookOpen className="h-6 w-6" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="grid gap-2 sm:grid-cols-[1fr,140px,110px]">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g. E-Book, Music)"
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-md border border-navy-200 py-2 pl-12 pr-3 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Description"
            className="block w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />

          <ProductFileSection product={product} />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center justify-between">
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
                  startToggling(async () => setProductActive(product.id, !product.is_active))
                }
                className="text-xs font-medium text-navy-600 hover:text-gold-700 disabled:opacity-60"
              >
                {product.is_active ? "Deactivate" : "Activate"}
              </button>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  product.is_active ? "bg-green-100 text-green-700" : "bg-navy-100 text-navy-500"
                }`}
              >
                {product.is_active ? "Listed on /store" : "Hidden"}
              </span>
            </div>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => startDeleting(async () => deleteProduct(product.id))}
              className="text-red-600 hover:text-red-700 disabled:opacity-50"
              aria-label="Delete product"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsManager({ products }: { products: ProductRow[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();

  function handleCreate() {
    const numericPrice = Number(price);
    if (
      !title.trim() ||
      !category.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !productFile
    ) {
      setError("Fill in title, category, price, and choose the file to sell.");
      return;
    }
    setError(null);

    startCreating(async () => {
      try {
        const fileExtension = productFile.name.split(".").pop() ?? "bin";
        const filePath = `products/${Date.now()}.${fileExtension}`;
        await uploadDigitalProductFile(productFile, filePath);

        let coverImageUrl: string | undefined;
        if (coverFile) {
          const coverExtension = coverFile.name.split(".").pop() ?? "jpg";
          coverImageUrl = await uploadMediaFile(coverFile, `product-covers/${Date.now()}.${coverExtension}`);
        }

        await createProduct({
          title: title.trim(),
          category: category.trim(),
          price: numericPrice,
          description: description.trim(),
          file_path: filePath,
          cover_image_url: coverImageUrl,
        });

        setTitle("");
        setCategory("");
        setPrice("");
        setDescription("");
        setCoverFile(null);
        setProductFile(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create the product.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-navy-900">New Product</h3>
        <p className="mt-1 text-xs text-navy-500">
          Works for e-books, music, or anything else digital -- the category is just a label
          you choose (e.g. &ldquo;E-Book&rdquo; or &ldquo;Music&rdquo;).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,160px,110px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g. E-Book, Music)"
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="15"
              className="w-full rounded-md border border-navy-200 py-2 pl-12 pr-3 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Description shown on the store page"
          className="mt-3 block w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-navy-300 px-4 py-3 text-sm text-navy-600 hover:border-gold">
            <Upload className="h-4 w-4" />
            {productFile ? productFile.name : "Choose the book/music file to sell"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-navy-300 px-4 py-3 text-sm text-navy-600 hover:border-gold">
            <ImageIcon className="h-4 w-4" />
            {coverFile ? coverFile.name : "Cover image (optional)"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={isCreating}
          onClick={handleCreate}
          className="btn-gold mt-4 disabled:opacity-60"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Add Product
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-navy-900">
          Products ({products.length})
        </h3>
        {products.length === 0 ? (
          <p className="text-sm text-navy-400">No products yet.</p>
        ) : (
          products.map((product) => <ProductRowItem key={product.id} product={product} />)
        )}
      </div>
    </div>
  );
}

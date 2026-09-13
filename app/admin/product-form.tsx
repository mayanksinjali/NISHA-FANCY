"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { compressImage } from "@/lib/compress-image";
import type { Product } from "@/lib/products";
import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "./actions";

type Props = {
  /** Existing row when editing; omitted when adding. */
  product?: Product;
  /** Category suggestions from products already in the database. */
  knownCategories: string[];
};

/**
 * Add / edit product form, built for a phone:
 *  - 16px inputs (no iOS zoom), 48px+ tap targets
 *  - photo picker opens the camera or gallery
 *  - the chosen photo is downscaled in the browser before upload, so a 6 MB
 *    camera shot becomes ~250 KB and uploads fine on mobile data
 */
export default function ProductForm({ product, knownCategories }: Props) {
  const isEdit = Boolean(product);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateProductAction : createProductAction,
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([
    ...(product?.image_url ? [product.image_url] : []),
    ...(product?.image_urls ?? []),
  ].filter((url, index, all) => all.indexOf(url) === index));
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  /**
   * Compress on selection and write the smaller file back into the input via a
   * DataTransfer, so the form submits the compressed version.
   */
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 4);
    if (!files.length) return;

    setWorking(true);
    try {
      const transfer = new DataTransfer();
      const compressedFiles: File[] = [];
      for (const file of files) {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
        transfer.items.add(compressed);
      }
      if (fileInputRef.current) fileInputRef.current.files = transfer.files;

      setPreviews((old) => {
        old.filter((url) => url.startsWith("blob:")).forEach(URL.revokeObjectURL);
        return compressedFiles.map((file) => URL.createObjectURL(file));
      });
      setFileNote(`${compressedFiles.length} of 4 photos ready to upload`);
    } finally {
      setWorking(false);
    }
  }

  const busy = pending || working;

  return (
    <form action={formAction} className="pb-28">
      {product && <input type="hidden" name="id" value={product.id} />}
      {product?.image_url && (
        <input
          type="hidden"
          name="existing_image_url"
          value={product.image_url}
        />
      )}
      {product?.image_urls && (
        <input
          type="hidden"
          name="existing_image_urls"
          value={JSON.stringify(product.image_urls)}
        />
      )}

      {/* ---------- Photo ---------- */}
      <section className="border-b border-line px-5 py-6">
        <h2 className="eyebrow text-ink-soft">Photo</h2>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-28 w-24 shrink-0 gap-1 overflow-hidden bg-bone">
            {previews.length ? (
              previews.slice(0, 3).map((image) => (
              // Blob previews aren't known to next/image, so use a plain img.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image}
                src={image}
                alt="Product preview"
                className="h-full min-w-full object-cover"
              />
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft">
                No photo
              </div>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="image"
              className="btn btn-outline w-full cursor-pointer"
            >
              {previews.length ? "Change photos" : "Take or choose photos"}
            </label>
            <input
              ref={fileInputRef}
              id="image"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {fileNote ??
                "Choose up to 4 photos for the gallery — each is resized before upload."}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Details ---------- */}
      <section className="space-y-5 px-5 py-6">
        <div>
          <label htmlFor="name" className="eyebrow text-ink-soft">
            Product name *
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            defaultValue={product?.name ?? ""}
            placeholder="Oversized linen shirt"
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="price" className="eyebrow text-ink-soft">
            Price (Rs.) *
          </label>
          <input
            id="price"
            name="price"
            required
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            defaultValue={product?.price ?? ""}
            placeholder="2450"
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="category" className="eyebrow text-ink-soft">
            Category
          </label>
          <input
            id="category"
            name="category"
            list="category-options"
            defaultValue={product?.category ?? ""}
            placeholder="Women"
            className="field mt-2"
          />
          {/* Type anything new, or pick one already in use. */}
          <datalist id="category-options">
            {knownCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="description" className="eyebrow text-ink-soft">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            placeholder="Fabric, fit, sizes available…"
            className="field mt-2 resize-y"
          />
        </div>

        <label className="flex items-center justify-between border border-line bg-bone px-4 py-4">
          <span>
            <span className="block text-[15px] font-medium">In stock</span>
            <span className="block text-xs text-ink-soft">
              Off = shown as sold out, no order button
            </span>
          </span>
          <input
            type="checkbox"
            name="in_stock"
            defaultChecked={product ? product.in_stock : true}
            className="h-6 w-6 shrink-0 accent-[#a53f22]"
          />
        </label>

        {state?.error && (
          <p
            role="alert"
            className="border border-terracotta/40 bg-terracotta/5 px-3 py-2.5 text-sm text-terracotta-deep"
          >
            {state.error}
          </p>
        )}
      </section>

      {/* ---------- Sticky save bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-line bg-paper/95 px-5 py-4 backdrop-blur-sm">
        <Link href="/admin/products" className="btn btn-outline flex-1">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={busy}
          className="btn btn-solid flex-[2] disabled:opacity-60"
        >
          {busy
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Add to store"}
        </button>
      </div>
    </form>
  );
}

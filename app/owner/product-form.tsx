"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { compressImage } from "@/lib/compress-image";
import type { AdminProduct } from "@/lib/products";
import { productImages } from "@/lib/product-rules";
import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "./actions";

type Props = {
  /** Existing row when editing; omitted when adding. */
  product?: AdminProduct;
};

/**
 * Add / edit product form, built for a phone:
 *  - 16px inputs (no iOS zoom), 48px+ tap targets
 *  - photo picker opens the camera or gallery
 *  - the chosen photo is downscaled in the browser before upload, so a 6 MB
 *    camera shot becomes ~250 KB and uploads fine on mobile data
 */
export default function ProductForm({ product }: Props) {
  const isEdit = Boolean(product);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isEdit ? updateProductAction : createProductAction,
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const existingImages = product ? productImages(product) : [];
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const selectedFilesRef = useRef<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  /* Drag-to-reorder (Task 15). Reordered existing photos are written back into
     the hidden fields, so the saved gallery order follows the tiles. */
  const [existingOrder, setExistingOrder] = useState<string[] | null>(null);
  const dragIndex = useRef<number | null>(null);

  function reorderPreviews(target: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === target) return;
    setPreviews((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved);
      // Only existing (non-blob) photos can be re-persisted; new files keep
      // their own input order.
      setExistingOrder(next.filter((url) => !url.startsWith("blob:")));
      return next;
    });
  }

  /**
   * Compress on selection and write the smaller file back into the input via a
   * DataTransfer, so the form submits the compressed version.
   */
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setWorking(true);
    try {
      const remaining = Math.max(
        0,
        4 - existingImages.length - selectedFilesRef.current.length,
      );
      const filesToAdd = files.slice(0, remaining);
      const transfer = new DataTransfer();
      const compressedFiles: File[] = [...selectedFilesRef.current];
      for (const file of filesToAdd) {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
      }
      compressedFiles.forEach((file) => transfer.items.add(file));
      if (fileInputRef.current) fileInputRef.current.files = transfer.files;

      selectedFilesRef.current = compressedFiles;
      setSelectedFiles(compressedFiles);
      setPreviews((old) => {
        old.filter((url) => url.startsWith("blob:")).forEach(URL.revokeObjectURL);
        return [
          ...existingImages,
          ...compressedFiles.map((file) => URL.createObjectURL(file)),
        ];
      });
      setFileNote(
        `${compressedFiles.length} of 4 photos ready to upload${
          files.length > filesToAdd.length ? " — maximum reached" : ""
        }`,
      );
    } finally {
      setWorking(false);
    }
  }

  const busy = pending || working;

  return (
    <form action={formAction} className="pb-28 pt-2">
      {product && <input type="hidden" name="id" value={product.id} />}
      {/*
        The COMPLETE gallery in display order, so dragging photos to reorder
        persists even when no new file is uploaded. `existingOrder` is set once
        the owner reorders; until then the stored order is submitted as-is.
      */}
      {product && (
        <input
          type="hidden"
          name="existing_image_urls"
          value={JSON.stringify(existingOrder ?? existingImages)}
        />
      )}

      {/* ---------- Photo ---------- */}
      <section className="admin-card mx-5 mt-5 px-5 py-6">
        <h2 className="eyebrow text-ink-soft">Photo</h2>

        <div className="mt-4 flex items-start gap-4">
          <div className="grid h-44 w-44 shrink-0 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-lg bg-gray-50">
            {previews.length ? (
              previews.map((image, index) => (
              // Blob previews aren't known to next/image, so use a plain img.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image}
                src={image}
                alt={`Product preview ${index + 1}`}
                draggable
                onDragStart={() => { dragIndex.current = index; }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); reorderPreviews(index); }}
                title="Drag to reorder"
                className={`cursor-grab object-cover active:cursor-grabbing ${previews.length === 1 ? "col-span-2 row-span-2 h-full w-full" : "h-full w-full"}`}
              />
              ))
            ) : (
              <div className="col-span-2 row-span-2 flex items-center justify-center text-xs text-ink-soft">
                No photo
              </div>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="image"
              className="w-full cursor-pointer rounded-full border border-gray-200 py-3 text-center text-xs font-semibold text-ink transition-colors hover:border-ink"
            >
              {selectedFiles.length >= 4
                ? "4 photos selected"
                : previews.length
                  ? "Add more photos"
                  : "Take or choose photos"}
            </label>
            <input
              ref={fileInputRef}
              id="image"
              name="images"
              type="file"
              accept="image/*"
              multiple
              disabled={selectedFiles.length >= 4 || working}
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
      <section className="admin-card mx-5 mt-4 space-y-5 px-5 py-6">
        <div>
          <label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Product name *
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            defaultValue={product?.name ?? ""}
            placeholder="Oversized linen shirt"
            className="admin-field mt-2"
          />
        </div>

        <div>
          <label htmlFor="price" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
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
            className="admin-field mt-2"
          />
        </div>

        <div>
          <label htmlFor="sale_price" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Sale price <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="sale_price"
            name="sale_price"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            defaultValue={product?.sale_price ?? ""}
            placeholder="Leave blank for regular price"
            className="admin-field mt-2"
          />
        </div>

        <div>
          <label htmlFor="category" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? ""}
            className="admin-field mt-2 appearance-none bg-white"
          >
            <option value="">No category</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Children">Children</option>
            <option value="Both">Both</option>
          </select>
          <p className="mt-1 text-xs text-ink-soft">
            The shop shows a filter for the category you pick here.
          </p>
        </div>

        <div>
          <label htmlFor="type" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Garment type <span className="normal-case tracking-normal">— internal search tag (customers never see this)</span>
          </label>
          <input
            id="type"
            name="type"
            type="text"
            maxLength={60}
            defaultValue={product?.type ?? ""}
            placeholder="kurtha, saree, lehenga, t-shirt…"
            className="admin-field mt-2"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-ink-soft">
            Used only to match searches — e.g. a customer searching “kurtha” finds every product tagged with it, even if the name doesn&apos;t say it. Hidden from the storefront.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="sizes" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Sizes
            </label>
            <input
              id="sizes"
              name="sizes"
              defaultValue={product?.sizes?.join(", ") ?? ""}
              placeholder="S, M, L, XL"
              className="admin-field mt-2"
            />
            <p className="mt-1 text-xs text-ink-soft">Separate with commas.</p>
          </div>

          <div>
            <label htmlFor="colors" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Colors
            </label>
            <input
              id="colors"
              name="colors"
              defaultValue={product?.colors?.join(", ") ?? ""}
              placeholder="Black, White"
              className="admin-field mt-2"
            />
            <p className="mt-1 text-xs text-ink-soft">Separate with commas.</p>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            placeholder="Fabric, fit, sizes available…"
            className="admin-field mt-2 resize-y"
          />
        </div>

        <label className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
          <span>
            <span className="block text-[15px] font-medium">In stock</span>
            <span className="block text-xs text-ink-soft">
              Off = hidden from the shop as sold out
            </span>
          </span>
          <input
            type="checkbox"
            name="in_stock"
            defaultChecked={product ? product.in_stock : true}
            className="h-6 w-6 shrink-0 accent-blue-600"
          />
        </label>

        {state?.error && (
          <p
            role="alert"
            className="rounded-xl border border-terracotta/40 bg-terracotta/5 px-3 py-2.5 text-sm text-terracotta-deep"
          >
            {state.error}
          </p>
        )}
      </section>

      {/* ---------- Sticky save bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-sm">
        <Link
          href="/owner/products"
          className="flex-1 rounded-full border border-gray-200 py-3 text-center text-xs font-semibold text-ink transition-colors hover:border-ink"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={busy}
          className="flex-[2] rounded-full bg-blue-600 py-3 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
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

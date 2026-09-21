"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  checkPassword,
  createSessionValue,
  isAdminPasswordConfigured,
  sessionCookieOptions,
} from "@/lib/auth";
import { clientIp, requireAdmin } from "@/lib/admin-guard";
import {
  checkRateLimit,
  formatRetryAfter,
  recordFailure,
  resetRateLimit,
} from "@/lib/rate-limit";
import {
  MAX_PRODUCT_IMAGES,
  isLegacySchemaError,
  parseSubmittedImageUrls,
  stripUnsupportedColumns,
} from "@/lib/product-rules";
import {
  PRODUCT_IMAGE_BUCKET,
  getSupabaseAdmin,
  isAdminSupabaseConfigured,
} from "@/lib/supabase/admin";

/**
 * Every mutating action here calls requireAdmin() first. Server actions are
 * public HTTP endpoints — middleware protects page navigation, not these.
 */

export type ActionState = { error?: string; success?: string } | null;

/** Namespace for login throttling, so other actions can reuse the limiter. */
const LOGIN_RATE_LIMIT_KEY = "admin-login";

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isAdminPasswordConfigured()) {
    return { error: "ADMIN_PASSWORD isn't set on the server." };
  }

  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/owner/products");

  // One shared password with no lockout was the weakest link in the panel:
  // a 600 ms delay alone still allows thousands of guesses a day. Check the
  // throttle BEFORE touching the password so a locked-out caller can't even
  // time the comparison.
  const throttleKey = `${LOGIN_RATE_LIMIT_KEY}:${await clientIp()}`;
  const throttle = checkRateLimit(throttleKey);
  if (!throttle.allowed) {
    return {
      error: `Too many failed attempts. Try again in ${formatRetryAfter(throttle.retryAfterSeconds)}.`,
    };
  }

  if (!(await checkPassword(password))) {
    const outcome = recordFailure(throttleKey);
    // Small delay so guessing is slow and the response time doesn't leak much.
    await new Promise((r) => setTimeout(r, 600));
    if (outcome.seconds > 0) {
      return {
        error: `Too many failed attempts. Try again in ${formatRetryAfter(outcome.seconds)}.`,
      };
    }
    return { error: "Wrong password. Try again." };
  }

  // Right password — forget the failed attempts so the owner is never locked
  // out by their own earlier typos.
  resetRateLimit(throttleKey);

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), sessionCookieOptions);

  // Only allow same-site relative paths — never bounce to an external URL.
  redirect(next.startsWith("/owner") ? next : "/owner/products");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/owner");
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type ParsedProduct = {
  name: string;
  price: number;
  sale_price: number | null;
  category: string | null;
  /** Internal search tag ("kurtha", "saree"...). Never shown to customers. */
  type: string | null;
  sizes: string[];
  colors: string[];
  description: string | null;
  in_stock: boolean;
};

const MAX_IMAGE_UPLOAD_BYTES = 14 * 1024 * 1024;

function parseProductForm(formData: FormData): ParsedProduct | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").trim();
  const rawSalePrice = String(formData.get("sale_price") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  // Capitalize each word ("men" -> "Men", "summer kurti" -> "Summer Kurti")
  // so the shop filter never shows duplicate chips from casing differences.
  const categoryNormalized = categoryRaw
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const sizes = parseList(formData.get("sizes"));
  const colors = parseList(formData.get("colors"));
  const description = String(formData.get("description") ?? "").trim();
  // Free-text internal tag. Trimmed and capped, no casing normalization —
  // search matches it case-insensitively anyway.
  const type = String(formData.get("type") ?? "").trim().slice(0, 60) || null;

  if (!name) return { error: "Product name is required." };
  if (name.length > 120) return { error: "Product name is too long." };

  const price = Number(rawPrice);
  if (!rawPrice || !Number.isFinite(price) || price < 0) {
    return { error: "Enter a valid price in rupees." };
  }
  const salePrice = rawSalePrice ? Number(rawSalePrice) : null;
  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price)) {
    return { error: "Sale price must be lower than the regular price." };
  }

  return {
    name,
    price,
    sale_price: salePrice,
    category: categoryNormalized || null,
    type,
    sizes,
    colors,
    description: description || null,
    // Unchecked checkboxes are absent from FormData entirely.
    in_stock: formData.get("in_stock") === "on",
  };
}

function parseList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index)
    .slice(0, 12);
}

/** Uploads to the product-images bucket and returns the public URL. */
async function uploadImage(file: File): Promise<string> {
  const supabase = getSupabaseAdmin();
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const kind = detectImageType(bytes);
  if (!kind) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Each image must be smaller than 14 MB.");
  }

  const extension = kind.extension;
  const path = `${crypto.randomUUID()}.${extension || "jpg"}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      contentType: kind.mime,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

function detectImageType(bytes: Uint8Array): { extension: string; mime: string } | null {
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (isJpeg) return { extension: "jpg", mime: "image/jpeg" };
  if (isPng) return { extension: "png", mime: "image/png" };
  if (isWebp) return { extension: "webp", mime: "image/webp" };
  return null;
}

async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  try {
    for (const file of files) urls.push(await uploadImage(file));
  } catch (error) {
    for (const url of urls) await removeStoredImage(url);
    throw error;
  }
  return urls;
}

/**
 * Public storage URLs look like:
 *   https://<ref>.supabase.co/storage/v1/object/public/product-images/<path>
 * Returns <path> if the URL belongs to our bucket, otherwise null.
 */
function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Best-effort cleanup so replaced/deleted photos don't fill the free tier. */
async function removeStoredImage(url: string | null): Promise<void> {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await getSupabaseAdmin()
    .storage.from(PRODUCT_IMAGE_BUCKET)
    .remove([path]);
  if (error) console.warn("[admin] could not delete old image:", error.message);
}

/** Storefront pages read live data; this just clears the router cache. */
function revalidateStorefront(): void {
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  // The sitemap is cached for an hour (app/sitemap.ts) so crawlers don't hit
  // Supabase on every fetch — a new product has to purge it by path.
  revalidatePath("/sitemap.xml");
  revalidatePath("/owner/products");
}

/* ------------------------------------------------------------------ */
/* Product CRUD                                                        */
/* ------------------------------------------------------------------ */

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!isAdminSupabaseConfigured()) {
    return { error: "Supabase isn't configured. Check your env vars." };
  }

  const parsed = parseProductForm(formData);
  if ("error" in parsed) return parsed;

  let imageUrls: string[] = [];
  try {
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_PRODUCT_IMAGES) {
      return { error: `Choose up to ${MAX_PRODUCT_IMAGES} photos per product.` };
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_IMAGE_UPLOAD_BYTES) {
      return { error: "The photos are too large together. Choose smaller images and try again." };
    }
    imageUrls = await uploadImages(files);

    const payload = {
      ...parsed,
      image_url: imageUrls[0] ?? null,
      image_urls: imageUrls,
    };
    let { error } = await getSupabaseAdmin().from("products").insert(payload);
    if (error && isLegacySchemaError(error.message)) {
      ({ error } = await getSupabaseAdmin()
        .from("products")
        .insert(stripUnsupportedColumns(payload, error.message)));
    }

    if (error) throw new Error(error.message);
  } catch (err) {
    // Don't orphan an uploaded file if the row insert failed.
    for (const url of imageUrls) await removeStoredImage(url);
    return { error: err instanceof Error ? err.message : "Could not save product." };
  }

  revalidateStorefront();
  redirect("/owner/products?added=1");
}

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!isAdminSupabaseConfigured()) {
    return { error: "Supabase isn't configured. Check your env vars." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id." };

  const parsed = parseProductForm(formData);
  if ("error" in parsed) return parsed;

  // The form submits the COMPLETE existing gallery in display order (reorder
  // included) — not just the cover — so an order-only save is persisted too.
  // This used to be skipped whenever no new file was uploaded, silently
  // discarding drag-to-reorder edits behind a "Changes saved" flash.
  const rawExistingImageUrls = formData.get("existing_image_urls");
  // `null` means the field wasn't submitted at all — a form rendered before
  // this field existed. Fall back to the old separate cover field so that
  // client can't silently wipe the product's photos.
  const legacyCover = String(formData.get("existing_image_url") ?? "") || null;
  const existingImageUrls =
    rawExistingImageUrls === null
      ? legacyCover
        ? [legacyCover]
        : null
      : parseSubmittedImageUrls(String(rawExistingImageUrls));
  let newImageUrls: string[] = [];
  let submittedImageUrls: string[] | null = existingImageUrls;
  let combinedImageUrls: string[] | null = existingImageUrls;

  try {
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_PRODUCT_IMAGES) {
      return { error: `Choose up to ${MAX_PRODUCT_IMAGES} photos per product.` };
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_IMAGE_UPLOAD_BYTES) {
      return { error: "The photos are too large together. Choose smaller images and try again." };
    }
    newImageUrls = await uploadImages(files);
    submittedImageUrls = [...(existingImageUrls ?? []), ...newImageUrls];
    combinedImageUrls = submittedImageUrls.slice(0, MAX_PRODUCT_IMAGES);

    // Write both photo columns whenever we know what the gallery should be:
    // image_url mirrors the first entry, image_urls is the ordered gallery the
    // storefront renders. Neither is written when there's nothing to go on.
    const updatePayload = {
      ...parsed,
      ...(combinedImageUrls
        ? { image_url: combinedImageUrls[0] ?? null, image_urls: combinedImageUrls }
        : {}),
    };
    let { error } = await getSupabaseAdmin()
      .from("products")
      .update(updatePayload)
      .eq("id", id);
    if (error && isLegacySchemaError(error.message)) {
      ({ error } = await getSupabaseAdmin()
        .from("products")
        .update(stripUnsupportedColumns(updatePayload, error.message))
        .eq("id", id));
    }

    if (error) throw new Error(error.message);
  } catch (err) {
    for (const url of newImageUrls) await removeStoredImage(url);
    return { error: err instanceof Error ? err.message : "Could not update product." };
  }

  // Row is saved — now it's safe to bin whatever didn't make the final gallery
  // (a photo dropped by the 4-image cap, including overflow uploads).
  const removedImageUrls = (submittedImageUrls ?? []).filter(
    (url) => !(combinedImageUrls ?? []).includes(url),
  );
  for (const url of removedImageUrls) {
    await removeStoredImage(url);
  }

  revalidateStorefront();
  redirect("/owner/products?updated=1");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getSupabaseAdmin();

  // Read the image URL first so we can clean up storage after the row is gone.
  let { data: existing } = await supabase
    .from("products")
    .select("image_url,image_urls")
    .eq("id", id)
    .maybeSingle();
  // Pre-migration table has no image_urls column — fall back to the cover only.
  if (!existing) {
    ({ data: existing } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .maybeSingle());
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const existingImages = existing as
    | { image_url: string | null; image_urls: string[] | null }
    | null;
  for (const url of [existingImages?.image_url, ...(existingImages?.image_urls ?? [])]) {
    await removeStoredImage(url ?? null);
  }

  revalidateStorefront();
  redirect("/owner/products?deleted=1");
}

/** Inline price edit from the inventory drawer. */
export async function quickUpdateProductAction(
  id: string,
  price: number,
): Promise<void> {
  await requireAdmin();

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Enter a valid price.");
  }

  const { error } = await getSupabaseAdmin()
    .from("products")
    .update({ price })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateStorefront();
}

/** One-tap in-stock switch from the product list. */
export async function toggleStockAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const next = formData.get("in_stock") === "true";
  if (!id) return;

  const { error } = await getSupabaseAdmin()
    .from("products")
    .update({ in_stock: next })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidateStorefront();
}

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
import { requireAdmin } from "@/lib/admin-guard";
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
  const next = String(formData.get("next") ?? "/admin/products");

  if (!(await checkPassword(password))) {
    // Small delay so guessing is slow and the response time doesn't leak much.
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Wrong password. Try again." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), sessionCookieOptions);

  // Only allow same-site relative paths — never bounce to an external URL.
  redirect(next.startsWith("/admin") ? next : "/admin/products");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin");
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type ParsedProduct = {
  name: string;
  price: number;
  category: string | null;
  description: string | null;
  in_stock: boolean;
};

const MAX_PRODUCT_IMAGES = 4;

function parseProductForm(formData: FormData): ParsedProduct | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Product name is required." };
  if (name.length > 120) return { error: "Product name is too long." };

  const price = Number(rawPrice);
  if (!rawPrice || !Number.isFinite(price) || price < 0) {
    return { error: "Enter a valid price in rupees." };
  }

  return {
    name,
    price,
    category: category || null,
    description: description || null,
    // Unchecked checkboxes are absent from FormData entirely.
    in_stock: formData.get("in_stock") === "on",
  };
}

/** Uploads to the product-images bucket and returns the public URL. */
async function uploadImage(file: File): Promise<string> {
  const supabase = getSupabaseAdmin();

  const extension = (file.name.split(".").pop() ?? "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5);
  const path = `${crypto.randomUUID()}.${extension || "jpg"}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) urls.push(await uploadImage(file));
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
  revalidatePath("/admin/products");
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
    imageUrls = await uploadImages(files);

    const { error } = await getSupabaseAdmin()
      .from("products")
      .insert({
        ...parsed,
        image_url: imageUrls[0] ?? null,
        image_urls: imageUrls,
      });

    if (error) throw new Error(error.message);
  } catch (err) {
    // Don't orphan an uploaded file if the row insert failed.
    for (const url of imageUrls) await removeStoredImage(url);
    return { error: err instanceof Error ? err.message : "Could not save product." };
  }

  revalidateStorefront();
  redirect("/admin/products?added=1");
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

  const previousUrl = String(formData.get("existing_image_url") ?? "") || null;
  const previousImageUrls = JSON.parse(
    String(formData.get("existing_image_urls") ?? "[]"),
  ) as string[];
  let newImageUrls: string[] = [];

  try {
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_PRODUCT_IMAGES) {
      return { error: `Choose up to ${MAX_PRODUCT_IMAGES} photos per product.` };
    }
    newImageUrls = await uploadImages(files);

    const { error } = await getSupabaseAdmin()
      .from("products")
      .update({
        ...parsed,
        ...(newImageUrls.length
          ? { image_url: newImageUrls[0], image_urls: newImageUrls }
          : {}),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
  } catch (err) {
    for (const url of newImageUrls) await removeStoredImage(url);
    return { error: err instanceof Error ? err.message : "Could not update product." };
  }

  // Row is saved — now it's safe to bin the old photo.
  if (newImageUrls.length) {
    for (const url of [previousUrl, ...previousImageUrls]) {
      await removeStoredImage(url);
    }
  }

  revalidateStorefront();
  redirect("/admin/products?updated=1");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getSupabaseAdmin();

  // Read the image URL first so we can clean up storage after the row is gone.
  const { data: existing } = await supabase
    .from("products")
    .select("image_url,image_urls")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const existingImages = existing as
    | { image_url: string | null; image_urls: string[] | null }
    | null;
  for (const url of [existingImages?.image_url, ...(existingImages?.image_urls ?? [])]) {
    await removeStoredImage(url ?? null);
  }

  revalidateStorefront();
  redirect("/admin/products?deleted=1");
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

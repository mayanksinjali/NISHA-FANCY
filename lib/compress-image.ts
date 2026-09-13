/**
 * Client-side image downscaling, used before uploading from the admin panel.
 *
 * Phone cameras produce 4–8 MB files; on Nepali mobile data that's a slow,
 * failure-prone upload and it burns through the Supabase free storage tier.
 * We redraw the photo into a canvas at a sane max edge and re-encode as JPEG,
 * which typically lands around 150–400 KB with no visible quality loss in a
 * product grid. Pure browser APIs — no image library.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  // Leave anything that isn't a bitmap (e.g. SVG) untouched.
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

    // Already small enough and reasonably sized on disk? Ship it as-is.
    if (scale === 1 && file.size < 600_000) {
      bitmap.close();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], replaceExtension(file.name, "jpg"), {
      type: "image/jpeg",
    });
  } catch {
    // If anything about the canvas path fails, fall back to the original file.
    return file;
  }
}

function replaceExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "photo"}.${ext}`;
}

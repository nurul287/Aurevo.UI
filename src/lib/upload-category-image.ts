import { supabase } from "@/lib/supabase";

/** Same bucket as product images; path prefix must be allowed by Storage RLS policies. */
export const CATEGORY_IMAGE_BUCKET = "product-images";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/**
 * Uploads a single category cover image to Storage and returns its public URL.
 * Uses a stable object key per category so re-uploads replace the same object (`upsert`).
 */
export async function uploadCategoryCoverImage(
  categoryId: string,
  file: File,
): Promise<string> {
  if (!categoryId) {
    throw new Error("Category id is required to upload an image");
  }
  if (file.size === 0) {
    throw new Error("Image file is empty");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller");
  }
  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("Use JPG, PNG, WebP, GIF, or AVIF");
  }

  const extFromMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  const ext = extFromMime[mime] || "jpg";

  const path = `categories/${categoryId}/cover.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(CATEGORY_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Upload failed");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CATEGORY_IMAGE_BUCKET).getPublicUrl(path);

  return publicUrl;
}

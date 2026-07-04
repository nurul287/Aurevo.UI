import { apiFetchForm } from "@/lib/api";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

interface CategoryImageResult {
  image_url?: string | null;
  imageUrl?: string | null;
}

/**
 * Uploads a category cover image via Aurevo.BE and returns its public URL.
 * The BE owns storage — no direct Supabase SDK calls.
 */
export async function uploadCategoryCoverImage(
  categoryId: string,
  file: File,
): Promise<string> {
  if (!categoryId) throw new Error("Category id is required to upload an image");
  if (file.size === 0) throw new Error("Image file is empty");
  if (file.size > MAX_BYTES) throw new Error("Image must be 5 MB or smaller");

  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) throw new Error("Use JPG, PNG, WebP, GIF, or AVIF");

  const formData = new FormData();
  formData.append("image", file);

  const data = await apiFetchForm<CategoryImageResult>(`/categories/${categoryId}/image`, { formData });
  const url = data.image_url ?? data.imageUrl;
  if (!url) throw new Error("Upload succeeded but no image URL returned");
  return url;
}

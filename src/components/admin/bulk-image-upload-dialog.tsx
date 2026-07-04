import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useBulkUploadProductImages,
  useProductVariants,
} from "@/services/product";
import type { ProductVariant } from "@/services/types";
import { ProductCombobox } from "@/components/admin/product-combobox";
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  ImagePlus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface BulkImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProductId?: string;
}

interface QueuedFile {
  clientId: string;
  file: File;
  previewUrl: string;
  altText: string;
  isPrimary: boolean;
  status: "pending" | "uploading" | "saving" | "done" | "error";
  progress: number;
  errorMessage?: string;
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";
const ACCEPTED_MIME_SET = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_FILE_SIZE_MB = 5;
const MAX_FILES_PER_BATCH = 50;
const MAX_BATCH_SIZE_MB = 100;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const BulkImageUploadDialog = ({
  open,
  onOpenChange,
  defaultProductId,
}: BulkImageUploadDialogProps) => {
  const [productId, setProductId] = useState<string>(defaultProductId ?? "");
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: variants = [], isLoading: variantsLoading } =
    useProductVariants(productId);
  const upload = useBulkUploadProductImages();

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setProductId(defaultProductId ?? "");
      setSelectedVariantIds([]);
      setQueue([]);
    } else {
      // Cancel any in-flight uploads on close
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      // Revoke any object URLs we created to avoid leaks
      queue.forEach((q) => {
        if (q.previewUrl) URL.revokeObjectURL(q.previewUrl);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultProductId]);

  // Auto-clear variant selection when product changes
  useEffect(() => {
    setSelectedVariantIds([]);
  }, [productId]);

  const validVariants: ProductVariant[] = useMemo(
    () => variants.filter((v) => v.is_active !== false),
    [variants],
  );

  const targetVariantIds = selectedVariantIds;

  const totalSize = useMemo(
    () => queue.reduce((sum, q) => sum + q.file.size, 0),
    [queue],
  );

  const isUploading = upload.isPending;
  const allDone =
    queue.length > 0 &&
    queue.every((q) => q.status === "done" || q.status === "error");

  // ---- File handling ----
  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const accepted: QueuedFile[] = [];
    const errors: string[] = [];

    // How much room is left in the queue & batch size?
    const currentBatchSize = queue.reduce((s, q) => s + q.file.size, 0);
    let remainingSlots = Math.max(0, MAX_FILES_PER_BATCH - queue.length);
    let runningBatchSize = currentBatchSize;
    const maxBatchBytes = MAX_BATCH_SIZE_MB * 1024 * 1024;

    list.forEach((file) => {
      // 1) Empty file
      if (file.size === 0) {
        errors.push(`${file.name}: file is empty (0 bytes)`);
        return;
      }
      // 2) MIME allow-list — strict (Storage bucket enforces the same list)
      const mime = file.type.toLowerCase();
      if (!ACCEPTED_MIME_SET.has(mime)) {
        errors.push(
          `${file.name}: ${
            mime || "unknown type"
          } not allowed (use JPG, PNG, WebP, GIF, AVIF)`,
        );
        return;
      }
      // 3) Per-file size
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(
          `${file.name}: ${formatBytes(file.size)} exceeds the ${MAX_FILE_SIZE_MB} MB limit`,
        );
        return;
      }
      // 4) Queue length cap
      if (remainingSlots <= 0) {
        errors.push(
          `${file.name}: skipped — queue limit is ${MAX_FILES_PER_BATCH} files`,
        );
        return;
      }
      // 5) Total batch size cap
      if (runningBatchSize + file.size > maxBatchBytes) {
        errors.push(
          `${file.name}: skipped — batch total would exceed ${MAX_BATCH_SIZE_MB} MB`,
        );
        return;
      }

      remainingSlots -= 1;
      runningBatchSize += file.size;

      accepted.push({
        clientId: newId(),
        file,
        previewUrl: URL.createObjectURL(file),
        altText: "",
        isPrimary: false,
        status: "pending",
        progress: 0,
      });
    });

    if (accepted.length) {
      setQueue((prev) => [...prev, ...accepted]);
    }
    if (errors.length) {
      // Surface rejected files as inline rows so the admin can see what
      // was skipped without opening the console.
      const errorRows: QueuedFile[] = errors.map((message) => ({
        clientId: newId(),
        file: new File([], "Rejected file"),
        previewUrl: "",
        altText: "",
        isPrimary: false,
        status: "error",
        progress: 0,
        errorMessage: message,
      }));
      setQueue((prev) => [...prev, ...errorRows]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (clientId: string) => {
    setQueue((prev) => {
      const next = prev.filter((q) => q.clientId !== clientId);
      const removed = prev.find((q) => q.clientId === clientId);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleClearAll = () => {
    queue.forEach((q) => {
      if (q.previewUrl) URL.revokeObjectURL(q.previewUrl);
    });
    setQueue([]);
  };

  const handleUpdateAlt = (clientId: string, altText: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.clientId === clientId ? { ...q, altText } : q)),
    );
  };

  const handleTogglePrimary = (clientId: string) => {
    setQueue((prev) =>
      prev.map((q) => ({
        ...q,
        // Only one image can be primary at a time
        isPrimary: q.clientId === clientId ? !q.isPrimary : false,
      })),
    );
  };

  const handleToggleVariant = (variantId: string, checked: boolean) => {
    setSelectedVariantIds((prev) =>
      checked ? [...prev, variantId] : prev.filter((id) => id !== variantId),
    );
  };

  const validQueue = queue.filter((q) => q.status !== "error" || q.previewUrl);
  const uploadableCount = validQueue.length;

  const canSubmit =
    !!productId && uploadableCount > 0 && !isUploading && !allDone;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const items = queue
      .filter((q) => q.previewUrl) // exclude error rows we created for rejected files
      .map((q, index) => ({
        clientId: q.clientId,
        file: q.file,
        alt_text: q.altText || undefined,
        is_primary: q.isPrimary,
        sort_order: index,
      }));

    // Mark all as uploading immediately for instant feedback
    setQueue((prev) =>
      prev.map((q) =>
        items.some((i) => i.clientId === q.clientId)
          ? { ...q, status: "uploading", progress: 0.05, errorMessage: undefined }
          : q,
      ),
    );

    // Fresh abort controller per submit
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    await upload.mutateAsync({
      product_id: productId,
      variant_ids: targetVariantIds,
      items,
      signal: controller.signal,
      onProgress: (clientId, update) => {
        setQueue((prev) =>
          prev.map((q) =>
            q.clientId === clientId
              ? {
                  ...q,
                  status:
                    update.status === "cancelled" ? "error" : update.status,
                  progress: update.progress,
                  errorMessage: update.error,
                }
              : q,
          ),
        );
      },
    });
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5" />
            Bulk Upload Images
          </DialogTitle>
          <DialogDescription>
            Drop multiple images, assign them to one or more variants, and
            we&apos;ll upload to Supabase Storage and link them to the product
            in one go.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product */}
          <div className="space-y-3">
            <Label>
              Product <span className="text-red-500">*</span>
            </Label>
            <ProductCombobox
              value={productId || "all"}
              onChange={(v) => setProductId(v === "all" ? "" : v)}
              className="w-full"
            />
          </div>

          {/* Variants */}
          {productId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Link to a variant (optional)</Label>
                <span className="text-xs text-gray-500">
                  {selectedVariantIds.length === 1
                    ? "Variant feature image"
                    : "Product-level image"}
                </span>
              </div>

              {variantsLoading ? (
                <p className="text-sm text-gray-500">Loading variants…</p>
              ) : validVariants.length === 0 ? (
                <p className="text-sm text-gray-500">
                  This product has no variants. Images will be linked to the
                  product directly.
                </p>
              ) : (
                <>
                  <div className="border border-gray-200 rounded-md">
                    <div className="max-h-40 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {validVariants.map((v) => {
                        const checked = selectedVariantIds.includes(v.id);
                        return (
                          <label
                            key={v.id}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm border border-transparent",
                              checked
                                ? "bg-gray-100 border-gray-200"
                                : "hover:bg-gray-50",
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) =>
                                handleToggleVariant(v.id, !!c)
                              }
                            />
                            {v.color_code && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: v.color_code }}
                              />
                            )}
                            <span>
                              {v.name ||
                                [v.color, v.size].filter(Boolean).join(" / ") ||
                                "Variant"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Pick <strong>one</strong> variant to make these uploads its
                    feature image. Pick <strong>none</strong> (or multiple) to
                    upload as <strong>product-level images</strong> visible
                    across every variant. Either way, each file creates exactly
                    one image row.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Drop zone */}
          <div className="space-y-2">
            <Label>
              Images <span className="text-red-500">*</span>
              {queue.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {queue.length} file{queue.length === 1 ? "" : "s"} •{" "}
                  {formatBytes(totalSize)}
                </span>
              )}
            </Label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging
                  ? "border-[#111111] bg-gray-50"
                  : "border-gray-300 hover:border-gray-400",
                isUploading && "opacity-50 cursor-not-allowed",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES}
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
              />
              <ImagePlus className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Drop images here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP, GIF, AVIF · up to {MAX_FILE_SIZE_MB} MB each ·
                max {MAX_FILES_PER_BATCH} files / {MAX_BATCH_SIZE_MB} MB per
                batch
              </p>
            </div>
          </div>

          {/* Queue / preview grid */}
          {queue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Queue
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 hover:text-red-600"
                  onClick={handleClearAll}
                  disabled={isUploading}
                >
                  Clear all
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {queue.map((q) => (
                  <div
                    key={q.clientId}
                    className={cn(
                      "flex gap-3 border rounded-lg p-2 bg-white",
                      q.status === "error"
                        ? "border-red-200 bg-red-50"
                        : q.status === "done"
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200",
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden relative">
                      {q.previewUrl ? (
                        <img
                          src={q.previewUrl}
                          alt={q.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                      )}
                      {q.status === "done" && (
                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {q.isPrimary && q.status !== "error" && (
                        <div className="absolute bottom-1 left-1 bg-yellow-400 text-yellow-900 rounded-full p-0.5">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {q.file.name || "—"}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemove(q.clientId)}
                          className="text-gray-400 hover:text-red-600 flex-shrink-0"
                          disabled={isUploading && q.status !== "error"}
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {q.errorMessage ? (
                        <p className="text-xs text-red-600">
                          {q.errorMessage}
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-500">
                            {formatBytes(q.file.size)}
                          </p>
                          <Input
                            placeholder="Alt text (optional)"
                            value={q.altText}
                            onChange={(e) =>
                              handleUpdateAlt(q.clientId, e.target.value)
                            }
                            disabled={isUploading || q.status === "done"}
                            className="h-7 text-xs"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePrimary(q.clientId)}
                              disabled={isUploading || q.status === "done"}
                              className={cn(
                                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded transition-colors",
                                q.isPrimary
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200",
                              )}
                            >
                              <Star
                                className={cn(
                                  "w-3 h-3",
                                  q.isPrimary && "fill-current",
                                )}
                              />
                              Primary
                            </button>

                            {/* Progress / status */}
                            {q.status === "done" ? (
                              <span className="text-xs text-green-700 font-medium">
                                Uploaded
                              </span>
                            ) : q.status === "error" ? (
                              <span className="text-xs text-red-600 font-medium">
                                Failed
                              </span>
                            ) : q.status === "uploading" ||
                              q.status === "saving" ? (
                              <div className="flex-1 ml-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#111111] transition-all"
                                  style={{
                                    width: `${Math.round(q.progress * 100)}%`,
                                  }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {isUploading ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Stop uploads
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {allDone ? "Close" : "Cancel"}
            </Button>
          )}
          {allDone ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear queue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isUploading
                ? "Uploading..."
                : uploadableCount > 0
                  ? `Upload ${uploadableCount} image${uploadableCount === 1 ? "" : "s"}`
                  : "Upload"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImageUploadDialog;

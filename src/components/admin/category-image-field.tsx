import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

type CategoryImageFieldProps = {
  label?: string;
  /** Current image from the database (shown until replaced). */
  existingUrl?: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
};

export function CategoryImageField({
  label = "Category image",
  existingUrl,
  file,
  onFileChange,
  disabled,
  className,
}: CategoryImageFieldProps) {
  const uid = useId();
  const fileInputId = `category-image-${uid}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) onFileChange(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) onFileChange(f);
  };

  const showPreview = preview || (existingUrl && !file ? existingUrl : null);

  return (
    <div className={cn("grid grid-cols-4 items-start gap-4", className)}>
      <div className="text-right pt-2 text-sm font-medium leading-none text-foreground">
        {label}
      </div>
      <div className="col-span-3 space-y-3">
        <input
          ref={inputRef}
          id={fileInputId}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={disabled}
          onChange={onInputChange}
        />
        <label
          htmlFor={fileInputId}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
            isDragging
              ? "border-gray-900 bg-gray-50"
              : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {showPreview ? (
            <img
              src={showPreview}
              alt=""
              className="mx-auto mb-3 max-h-28 w-auto max-w-full rounded-md object-contain"
            />
          ) : (
            <ImagePlus className="mb-2 h-10 w-10 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            Drag and drop an image here, or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WebP, GIF, or AVIF — max 5 MB
          </p>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Choose file
          </Button>
          {(file || existingUrl) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onFileChange(null)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

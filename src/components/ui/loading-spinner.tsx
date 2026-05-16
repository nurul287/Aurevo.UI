import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-10 w-10",
} as const;

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-gray-600", sizeClasses[size], className)}
      aria-hidden
    />
  );
}

type LoadingIndicatorProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
};

export function LoadingIndicator({
  className,
  size = "md",
  label = "Loading",
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn("flex items-center justify-center py-4", className)}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size={size} />
      <span className="sr-only">{label}</span>
    </div>
  );
}


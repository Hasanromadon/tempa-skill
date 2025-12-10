import { cn } from "@/app/utils/cn-classes";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

/**
 * Reusable submit button with loading state
 *
 * @example
 * ```tsx
 * <SubmitButton loading={isSubmitting} loadingText="Memproses...">
 *   Masuk
 * </SubmitButton>
 * ```
 */
export function SubmitButton({
  loading = false,
  loadingText = "Memproses...",
  children,
  variant = "default",
  size = "default",
  fullWidth = false,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={loading || disabled}
      className={cn(
        fullWidth && "w-full",
        variant === "default" && "bg-orange-600 hover:bg-orange-700",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
}

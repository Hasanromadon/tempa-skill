import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React from "react";
import { useFormContext } from "react-hook-form";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  className?: string;
}

/**
 * Reusable form field component with integrated validation
 * Automatically connects to React Hook Form context
 *
 * @example
 * ```tsx
 * <FormField
 *   name="email"
 *   label="Email"
 *   type="email"
 *   placeholder="john@example.com"
 * />
 * ```
 */
export function FormField({
  name,
  label,
  description,
  type = "text",
  placeholder,
  className,
  ...props
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className={error ? "text-red-600" : ""}>
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...register(name)}
        {...props}
      />
      {description && !error && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

/**
 * Reusable textarea field component with integrated validation
 * Automatically connects to React Hook Form context
 *
 * @example
 * ```tsx
 * <TextareaField
 *   name="bio"
 *   label="Bio"
 *   placeholder="Ceritakan tentang diri Anda..."
 *   rows={4}
 * />
 * ```
 */
export function TextareaField({
  name,
  label,
  description,
  placeholder,
  rows = 4,
  className,
  ...props
}: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className={error ? "text-red-600" : ""}>
        {label}
      </Label>
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...register(name)}
        {...props}
      />
      {description && !error && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

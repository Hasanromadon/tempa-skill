"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  className?: string;
  prefix?: string;
  thousandSeparator?: string;
  decimalSeparator?: string;
  decimals?: number;
  onValueChange?: (cleanValue: number) => void;
}

/**
 * Number input component with thousand separator formatting
 *
 * Features:
 * - Displays formatted value (e.g., "1.000.000")
 * - Stores clean value internally (e.g., 1000000)
 * - Supports prefix (e.g., "Rp ")
 * - Customizable separators and decimals
 *
 * @example
 * ```tsx
 * <NumberInput
 *   name="price"
 *   label="Harga"
 *   prefix="Rp "
 *   thousandSeparator="."
 *   decimalSeparator=","
 *   decimals={0}
 * />
 * ```
 */
export function NumberInput({
  name,
  label,
  description,
  placeholder = "0",
  className,
  prefix = "",
  thousandSeparator = ".",
  decimalSeparator = ",",
  decimals = 0,
  onValueChange,
  disabled = false,
  required = false,
  ...props
}: NumberInputProps) {
  const { control } = useFormContext();
  const [displayValue, setDisplayValue] = useState<string>("");

  const formatNumberDisplay = (
    value: number | string | null | undefined
  ): string => {
    // Handle null, undefined, atau empty string
    if (value === null || value === undefined || value === "") return "";

    const numValue =
      typeof value === "string"
        ? parseFloat(value.replace(/\D/g, "")) || 0
        : value;

    if (isNaN(numValue)) return "";

    // Format dengan separator ribuan
    const parts = numValue.toFixed(decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    // Gabungkan dengan decimal separator jika ada desimal
    const formatted =
      decimals > 0 ? parts[0] + decimalSeparator + parts[1] : parts[0];

    return prefix + formatted;
  };

  const extractCleanNumber = (value: string): number => {
    // Remove prefix, separators, dan ambil hanya angka
    const cleaned = value
      .replace(new RegExp(`^${prefix}`), "") // Remove prefix
      .replace(new RegExp(`\\${thousandSeparator}`, "g"), "") // Remove thousand separator
      .replace(decimalSeparator, "."); // Replace decimal separator with dot

    const num = parseFloat(cleaned) || 0;
    return num;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Sync displayValue with field value on mount or when field.value changes
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
          if (field.value !== undefined && field.value !== null) {
            setDisplayValue(formatNumberDisplay(field.value));
          }
        }, [field.value]);

        return (
          <div className={cn("space-y-2", className)}>
            <Label htmlFor={name} className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className="relative">
              <Input
                id={name}
                type="text"
                inputMode="numeric"
                placeholder={placeholder}
                disabled={disabled}
                value={displayValue}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const cleanNumber = extractCleanNumber(inputValue);

                  // Format display value real-time saat mengetik
                  const formattedValue = formatNumberDisplay(cleanNumber);
                  setDisplayValue(formattedValue);

                  // Update form value dengan clean number
                  field.onChange(cleanNumber);

                  // Call callback if provided
                  if (onValueChange) {
                    onValueChange(cleanNumber);
                  }
                }}
                onBlur={() => {
                  field.onBlur();
                }}
                {...props}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed",
                  error ? "border-red-500" : "border-gray-300"
                )}
              />
            </div>

            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}

            {error && <p className="text-xs text-red-500">{error.message}</p>}
          </div>
        );
      }}
    />
  );
}

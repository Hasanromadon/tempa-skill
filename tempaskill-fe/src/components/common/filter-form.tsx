"use client";

import { ReactNode } from "react";

interface FilterFormProps {
  children: ReactNode;
  className?: string;
}

/**
 * Filter Form Layout Component
 * 
 * Reusable container untuk filter form dengan good design principles:
 * - Consistent spacing (space-y-4)
 * - Responsive grid layout untuk fields
 * - Proper visual hierarchy
 * - Accessible form structure
 * 
 * @example
 * ```tsx
 * <FilterForm>
 *   <SearchFilterInput {...props} />
 *   <FilterFormGrid>
 *     <FilterFormField label="Kategori">
 *       <SelectFilter {...props} />
 *     </FilterFormField>
 *     <FilterFormField label="Status">
 *       <SelectFilter {...props} />
 *     </FilterFormField>
 *   </FilterFormGrid>
 *   <ActiveFilters {...props} />
 * </FilterForm>
 * ```
 */
export function FilterForm({ children, className = "" }: FilterFormProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

interface FilterFormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * Filter Form Grid Component
 * 
 * Container untuk field filter dengan responsive grid layout
 * Default 2 columns, responsive ke 1 column di mobile
 */
export function FilterFormGrid({
  children,
  columns = 2,
  className = "",
}: FilterFormGridProps) {
  const colsMap = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  };

  return (
    <div
      className={`grid grid-cols-1 ${colsMap[columns]} gap-3 ${className}`}
    >
      {children}
    </div>
  );
}

interface FilterFormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Filter Form Field Component
 * 
 * Wrapper untuk individual filter field dengan:
 * - Label dengan consistent styling
 * - Vertical spacing
 * - Accessibility support
 */
export function FilterFormField({
  label,
  children,
  className = "",
}: FilterFormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

interface FilterFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Filter Form Section Component
 * 
 * Optional section for grouping related filters dengan header
 */
export function FilterFormSection({
  title,
  description,
  children,
  className = "",
}: FilterFormSectionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

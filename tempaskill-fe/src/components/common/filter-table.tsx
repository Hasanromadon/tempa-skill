"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { FC } from "react";

interface SearchFilterInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable search input component untuk filter table
 * Features:
 * - Real-time search dengan icon
 * - Smooth clear button animation
 * - Modern design dengan rounded corners
 * - Focus states dengan orange accent
 */
export const SearchFilterInput: FC<SearchFilterInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Cari...",
  disabled = false,
}) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pl-11 pr-11 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors h-10"
      />
      {value && (
        <button
          onClick={onClear}
          disabled={disabled}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors p-1 hover:bg-gray-100 rounded"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface FilterBadgeProps {
  label: string;
  value: string;
  onRemove: () => void;
}

/**
 * Badge untuk menampilkan active filter
 */
export const FilterBadge: FC<FilterBadgeProps> = ({
  label,
  value,
  onRemove,
}) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm text-orange-900 border border-orange-200 transition-all hover:bg-orange-200 hover:shadow-sm">
      <span className="flex items-center gap-1">
        <span className="font-semibold">{label}:</span>
        <span className="text-orange-800">{value}</span>
      </span>
      <button 
        onClick={onRemove} 
        className="ml-1 text-orange-700 hover:text-orange-900 hover:bg-orange-300 rounded-full p-0.5 transition-colors"
        aria-label={`Hapus filter ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

interface ActiveFiltersProps {
  filters: Record<string, unknown>;
  labels?: Record<string, string>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

/**
 * Component untuk menampilkan active filters
 * Features:
 * - Visual filter counter dengan Filter icon
 * - Gradient background untuk visual hierarchy
 * - Clear all button dengan confirm action
 * - Smooth animations dan transitions
 */
export const ActiveFilters: FC<ActiveFiltersProps> = ({
  filters,
  labels = {},
  onRemove,
  onClearAll,
}) => {
  const activeFilters = Object.entries(filters);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-orange-200 bg-linear-to-r from-orange-50 to-orange-100 p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-semibold text-gray-700">
          Filter aktif:
          <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
            {activeFilters.length}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map(([key, value]) => (
          <FilterBadge
            key={key}
            label={labels[key] || key}
            value={String(value)}
            onRemove={() => onRemove(key)}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-orange-600 hover:bg-orange-200 font-medium"
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Hapus semua filter
      </Button>
    </div>
  );
};

interface SortHeaderProps {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentOrder?: "asc" | "desc";
  onSort: (key: string) => void;
}

/**
 * @deprecated Use DataTable component with sortable columns instead.
 * This component is kept for backward compatibility but is no longer recommended.
 * DataTable provides better UX with proper visual feedback and column definitions.
 * 
 * Example:
 * - Old: <SortHeader label="Title" sortKey="title" onSort={...} />
 * - New: Create column with sortable: true in DataTable ColumnDef
 */
export const SortHeader: FC<SortHeaderProps> = ({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
}) => {
  const isActive = currentSort === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 font-medium transition-colors ${
        isActive ? "text-orange-600" : "text-gray-700 hover:text-gray-900"
      }`}
    >
      {label}
      {isActive && (
        <span className="text-sm">{currentOrder === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  );
};

interface TableStatusProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

/**
 * @deprecated Use DataTable component which has built-in loading, error, and empty states.
 * This component is kept for backward compatibility but is no longer recommended.
 * DataTable provides better UX with skeleton loaders, icons, and professional styling.
 * 
 * Example:
 * - Old: <TableStatus isLoading={loading} isError={error} isEmpty={!data} />
 * - New: <DataTable data={data} isLoading={loading} error={error} columns={...} />
 */
export const TableStatus: FC<TableStatusProps> = ({
  isLoading,
  isError,
  isEmpty,
  errorMessage = "Terjadi kesalahan saat memuat data",
  emptyMessage = "Tidak ada data untuk ditampilkan",
  loadingMessage = "Memuat data...",
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center border-t border-gray-200 py-8">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
          <p className="text-sm">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center border-t border-gray-200 py-8">
        <div className="flex flex-col items-center gap-2 text-red-600">
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center border-t border-gray-200 py-8">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return null;
};

interface ResultsSummaryProps {
  total: number;
  page: number;
  limit: number;
}

/**
 * @deprecated Use DataTable component which has built-in results summary.
 * This component is kept for backward compatibility but is no longer recommended.
 * DataTable provides better UX with automatic calculation and orange-600 highlights.
 * 
 * Example:
 * - Old: <ResultsSummary total={100} page={1} limit={10} />
 * - New: DataTable includes this automatically as "Showing 1-10 of 100"
 */
export const ResultsSummary: FC<ResultsSummaryProps> = ({
  total,
  page,
  limit,
}) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <p className="text-sm text-gray-600">
      Menampilkan <span className="font-semibold text-orange-600">{start}</span> hingga{" "}
      <span className="font-semibold text-orange-600">{end}</span> dari{" "}
      <span className="font-semibold text-orange-600">{total}</span> hasil
    </p>
  );
};

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  aria?: string;
}

/**
 * Reusable select filter component menggunakan Shadcn
 * Features:
 * - Consistent design dengan orange accent
 * - Multiple options dengan placeholder support
 * - Rounded corners dan smooth focus state
 * - ARIA labels untuk accessibility
 * - Automatic empty value filtering
 */
export const SelectFilter: FC<SelectFilterProps> = ({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  disabled = false,
  aria = "Select filter",
}) => {
  // Filter options yang memiliki value (tidak kosong)
  const validOptions = options.filter((opt) => opt.value !== "");
  const placeholderOption = options.find((opt) => opt.value === "");

  // Check if current value is valid
  const hasValidValue = validOptions.some((opt) => opt.value === value);
  const selectedValue = hasValidValue ? value : validOptions[0]?.value ?? "";

  return (
    <Select value={selectedValue} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={aria} className="rounded-lg border-gray-300 focus:ring-orange-500 h-10">
        <SelectValue placeholder={placeholderOption?.label || placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        {validOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

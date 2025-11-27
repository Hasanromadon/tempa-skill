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
import { Search, X } from "lucide-react";
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
 * - Real-time search
 * - Clear button
 * - Loading state
 * - Customizable placeholder
 */
export const SearchFilterInput: FC<SearchFilterInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Cari...",
  disabled = false,
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pl-10 pr-10"
      />
      {value && (
        <button
          onClick={onClear}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface LimitSelectProps {
  value: number;
  onChange: (limit: number) => void;
  options?: number[];
  disabled?: boolean;
}

/**
 * Reusable limit selector component
 * Digunakan untuk mengubah jumlah item per halaman
 */
export const LimitSelect: FC<LimitSelectProps> = ({
  value,
  onChange,
  options = [10, 20, 50, 100],
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="limit" className="text-sm text-gray-600">
        Tampilkan per halaman:
      </label>
      <select
        id="limit"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-900">
      <span>
        <span className="font-medium">{label}:</span> {value}
      </span>
      <button onClick={onRemove} className="ml-1 hover:text-orange-800">
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
 * Memudahkan user melihat dan clear filters yang sedang aktif
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
    <div className="space-y-2">
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
        className="text-orange-600 hover:bg-orange-50"
      >
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
 * Sortable table header component
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
 * Component untuk menampilkan loading, error, atau empty state
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
 * Component untuk menampilkan summary hasil (misal: "Showing 1-10 of 100")
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
      Menampilkan <span className="font-medium">{start}</span> hingga{" "}
      <span className="font-medium">{end}</span> dari{" "}
      <span className="font-medium">{total}</span> hasil
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
 * Supports multiple options dengan placeholder (empty value as clear)
 *
 * Note: Shadcn Select tidak support empty value pada SelectItem,
 * jadi gunakan first valid option sebagai default atau handle di parent
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
      <SelectTrigger aria-label={aria} className="w-full">
        <SelectValue placeholder={placeholderOption?.label || placeholder} />
      </SelectTrigger>
      <SelectContent>
        {validOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

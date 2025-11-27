"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

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
 * - Internal debounce (500ms) untuk prevent rapid API calls
 * - Immediate UI feedback (smooth typing)
 * - Focus tetap saat debounce (tidak blur)
 * - Debounce di component level, bukan di parent
 * 
 * IMPORTANT: onChange callback dipanggil SETELAH debounce selesai
 * jadi parent tidak perlu khawatir tentang rapid re-renders
 */
export const SearchFilterInput: FC<SearchFilterInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Cari...",
  disabled = false,
}) => {
  // Local state untuk input (immediate feedback tanpa debounce)
  const [inputValue, setInputValue] = useState(value);
  
  // Ref untuk store debounce timer
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update input value ketika parent value berubah (sync state)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle change dengan internal debounce
  // onChange dipanggil HANYA setelah 500ms pause, tidak setiap keystroke
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Update local input immediately (smooth typing, no blur)
    setInputValue(newValue);

    // Clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce onChange call to parent (500ms)
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full group">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-orange-600 transition-colors" />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        className="pl-10 pr-10 rounded-lg border border-gray-300 bg-white focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all h-11 text-sm disabled:bg-gray-50"
        autoComplete="off"
      />
      {inputValue && (
        <button
          onClick={() => {
            setInputValue("");
            onClear();
            // Cancel pending debounce
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
          }}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 disabled:opacity-50 transition-colors p-1.5 hover:bg-gray-100 rounded-md"
          aria-label="Clear search"
          type="button"
          tabIndex={-1}
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
    <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-orange-700 hover:shadow-md transition-all duration-200">
      <span className="flex items-center gap-1">
        <span className="font-semibold">{label}:</span>
        <span className="font-normal">{value}</span>
      </span>
      <button
        onClick={onRemove}
        className="ml-0.5 text-white/80 hover:text-white hover:bg-orange-800/40 rounded-full p-0.5 transition-colors"
        aria-label={`Hapus filter ${label}`}
        type="button"
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
 * - Compact design dengan active filters count
 * - Modern styling dengan orange accent
 * - Quick clear all functionality
 * - Smooth animations
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
    <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-orange-600 shrink-0" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Filter Aktif
          </span>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
            {activeFilters.length}
          </span>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
          type="button"
        >
          Hapus Semua
        </button>
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
      Menampilkan <span className="font-semibold text-orange-600">{start}</span>{" "}
      hingga <span className="font-semibold text-orange-600">{end}</span> dari{" "}
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
 * - Modern styling dengan better visual feedback
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
      <SelectTrigger
        aria-label={aria}
        className="w-full rounded-lg border border-gray-300 bg-white focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all h-11 text-sm disabled:bg-gray-50"
      >
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

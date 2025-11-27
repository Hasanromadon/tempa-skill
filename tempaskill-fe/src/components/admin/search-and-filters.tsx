"use client";

import { SearchFilterInput, SelectFilter } from "@/components/common";
import { X } from "lucide-react";
import { useMemo } from "react";

interface SearchAndFiltersProps {
  isLoading: boolean;
  filters: Record<string, unknown>;
  onFilterChange: (key: string, value: unknown) => void;
  onFilterClear: (key: string) => void;
  onClearAllFilters: () => void;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

/**
 * Isolated Search and Filters Component
 *
 * Menerima semua props dari parent, tidak membuat state sendiri.
 * Berguna untuk:
 * - Prevent parent re-renders (parent passes callbacks, bukan objects)
 * - Compose filter UI yang besar tanpa affecting parent
 * - Reusable filter pattern
 *
 * PENTING: Parent TIDAK akan re-render ketika component ini update
 * karena component hanya menerima primitive values dan callbacks,
 * bukan complex objects yang berubah
 */
export function SearchAndFilters({
  isLoading,
  filters,
  onFilterChange,
  onFilterClear,
  onClearAllFilters,
  hasActiveFilters,
  onSearchChange,
  onSearchClear,
}: SearchAndFiltersProps) {
  // Memoize active filter badges untuk prevent unnecessary recalculations
  const activeFilterBadges = useMemo(() => {
    const badges = [];

    // Only add badge if value is not empty string and is truthy
    if (filters.category && String(filters.category).trim()) {
      badges.push({
        label: "Kategori",
        value: String(filters.category),
        key: "category",
      });
    }

    if (filters.difficulty && String(filters.difficulty).trim()) {
      badges.push({
        label: "Tingkat",
        value: String(filters.difficulty),
        key: "difficulty",
      });
    }

    return badges;
  }, [filters.category, filters.difficulty]);

  return (
    <div className="space-y-4">
      {/* Search Input - Full Width */}
      <SearchFilterInput
        key="search-input"
        onChange={onSearchChange}
        onClear={onSearchClear}
        placeholder="Cari berdasarkan judul kursus..."
        disabled={isLoading}
      />

      {/* Filters Grid - Responsive & Structured */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Kategori
          </label>
          <SelectFilter
            value={String(filters.category || "")}
            onChange={(value) => onFilterChange("category", value || "")}
            options={[
              { value: "", label: "Semua Kategori" },
              { value: "Web Development", label: "Web Development" },
              {
                value: "Mobile Development",
                label: "Mobile Development",
              },
              { value: "Data Science", label: "Data Science" },
              { value: "DevOps", label: "DevOps" },
            ]}
            placeholder="Semua Kategori"
            disabled={isLoading}
            aria="Filter berdasarkan kategori"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Tingkat Kesulitan
          </label>
          <SelectFilter
            value={String(filters.difficulty || "")}
            onChange={(value) => onFilterChange("difficulty", value || "")}
            options={[
              { value: "", label: "Semua Tingkat" },
              { value: "beginner", label: "Pemula" },
              { value: "intermediate", label: "Menengah" },
              { value: "advanced", label: "Lanjutan" },
            ]}
            placeholder="Semua Tingkat"
            disabled={isLoading}
            aria="Filter berdasarkan tingkat kesulitan"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilterBadges.map((filter) => (
            <div
              key={filter.key}
              className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
            >
              <span>
                <strong>{filter.label}:</strong> {filter.value}
              </span>
              <button
                onClick={() => onFilterClear(filter.key)}
                className="hover:text-orange-900 transition-colors"
                aria-label={`Hapus filter ${filter.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={onClearAllFilters}
            className="text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded transition-colors ml-2"
          >
            Hapus Semua
          </button>
        </div>
      )}
    </div>
  );
}

import { useCallback, useMemo, useState } from "react";

export interface TableFilterState {
  search: string;
  filters: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page: number;
  limit: number;
}

export interface TableFilterConfig {
  initialSearch?: string;
  initialFilters?: Record<string, unknown>;
  initialPage?: number;
  initialLimit?: number;
  initialSort?: {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

interface UseTableFiltersReturn {
  // State
  state: TableFilterState;

  // Search
  search: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;

  // Filters
  filters: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;

  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  setSort: (sortBy: string, sortOrder?: "asc" | "desc") => void;
  toggleSort: (sortBy: string) => void;
  clearSort: () => void;

  // Pagination
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  goToFirstPage: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;

  // Query params
  queryParams: Record<string, unknown>;
  resetAll: () => void;
}

/**
 * Headless hook untuk table filtering, searching, sorting, dan pagination
 *
 * Features:
 * - Search across fields
 * - Multiple independent filters
 * - Sorting (asc/desc toggle)
 * - Pagination management
 * - Reset capabilities
 * - Type-safe state management
 *
 * @example
 * ```tsx
 * const filters = useTableFilters({
 *   initialSearch: "",
 *   initialFilters: { category: "all" },
 *   initialLimit: 10,
 * });
 *
 * return (
 *   <>
 *     <SearchInput
 *       value={filters.search}
 *       onChange={filters.setSearch}
 *     />
 *     <FilterSelect
 *       value={filters.filters.category}
 *       onChange={(val) => filters.setFilter("category", val)}
 *     />
 *     <Table
 *       data={data}
 *       onSort={filters.setSort}
 *     />
 *     <Pagination
 *       page={filters.page}
 *       onPageChange={filters.setPage}
 *     />
 *   </>
 * );
 * ```
 */
export function useTableFilters(
  config: TableFilterConfig = {}
): UseTableFiltersReturn {
  const {
    initialSearch = "",
    initialFilters = {},
    initialPage = 1,
    initialLimit = 10,
    initialSort = {},
  } = config;

  // Search state
  const [search, setSearch] = useState(initialSearch);

  // Filter state
  const [filters, setFiltersState] =
    useState<Record<string, unknown>>(initialFilters);

  // Sort state
  const [sortBy, setSortBy] = useState<string | undefined>(initialSort.sortBy);
  const [sortOrder, setSortOrderState] = useState<"asc" | "desc" | undefined>(
    initialSort.sortOrder
  );

  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // Combined state
  const state: TableFilterState = {
    search,
    filters,
    sortBy,
    sortOrder,
    page,
    limit,
  };

  // Search handlers
  // FIX: Don't reset page on search input change - only on explicit search submission
  // This prevents focus blur from re-renders during typing
  const handleSetSearch = useCallback((value: string) => {
    setSearch(value);
    // Note: Page reset is NOT done here to preserve focus
    // Page will reset when user submits search (if API integration adds that)
    // For now, filtering happens client-side in real-time
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch("");
    // Reset page when explicitly clearing, since it's a deliberate action
    setPage(1);
  }, []);

  // Filter handlers
  const handleSetFilter = useCallback((key: string, value: unknown) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page on filter change
  }, []);

  const handleSetFilters = useCallback(
    (newFilters: Record<string, unknown>) => {
      setFiltersState(newFilters);
      setPage(1);
    },
    []
  );

  const handleClearFilter = useCallback((key: string) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFiltersState({});
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  // Sort handlers
  // Priority 2c (Evaluation): toggleSort debounce
  // CURRENT: Immediate execution (good for small datasets)
  // FUTURE: If rapid sort clicks cause API spam, add 300ms debounce:
  //   - Use useMemo(() => debounce(handleToggleSort, 300), [])
  //   - Watch performance metrics in React DevTools
  //   - Only apply if sorting 100+ times/minute detected
  const handleSetSort = useCallback(
    (newSortBy: string, newSortOrder: "asc" | "desc" = "asc") => {
      setSortBy(newSortBy);
      setSortOrderState(newSortOrder);
      setPage(1);
    },
    []
  );

  const handleToggleSort = useCallback((newSortBy: string) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === newSortBy) {
        // Toggle sort order
        setSortOrderState((prevOrder) =>
          prevOrder === "asc" ? "desc" : "asc"
        );
        return newSortBy;
      } else {
        // New sort column, default to asc
        setSortOrderState("asc");
        return newSortBy;
      }
    });
    setPage(1);
  }, []);

  const handleClearSort = useCallback(() => {
    setSortBy(undefined);
    setSortOrderState(undefined);
  }, []);

  // Pagination handlers
  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(Math.max(1, newLimit));
    setPage(1);
  }, []);

  const handleGoToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const handleGoToNextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handleGoToPrevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  // Query params for API
  const queryParams = useMemo((): Record<string, unknown> => {
    return {
      search: search || undefined,
      ...filters,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit,
    };
  }, [search, filters, sortBy, sortOrder, page, limit]);

  // Reset all
  const handleResetAll = useCallback(() => {
    setSearch(initialSearch);
    setFiltersState(initialFilters);
    setSortBy(initialSort.sortBy);
    setSortOrderState(initialSort.sortOrder);
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialSearch, initialFilters, initialSort, initialPage, initialLimit]);

  return {
    state,
    search,
    setSearch: handleSetSearch,
    clearSearch: handleClearSearch,
    filters,
    setFilter: handleSetFilter,
    setFilters: handleSetFilters,
    clearFilter: handleClearFilter,
    clearAllFilters: handleClearAllFilters,
    hasActiveFilters,
    sortBy,
    sortOrder,
    setSort: handleSetSort,
    toggleSort: handleToggleSort,
    clearSort: handleClearSort,
    page,
    limit,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    goToFirstPage: handleGoToFirstPage,
    goToNextPage: handleGoToNextPage,
    goToPrevPage: handleGoToPrevPage,
    queryParams,
    resetAll: handleResetAll,
  };
}

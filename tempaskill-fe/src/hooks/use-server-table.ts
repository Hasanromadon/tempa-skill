"use client";

import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { TableFilterConfig, useTableFilters } from "./use-table-filters";

export interface ServerTableResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface UseServerTableOptions extends TableFilterConfig {
  queryKey: string[];
  endpoint: string;
  enabled?: boolean;
}

interface UseServerTableReturn<T> {
  // Data
  data: T[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Filters
  filters: ReturnType<typeof useTableFilters>;

  // Pagination helpers
  hasNextPage: boolean;
  hasPrevPage: boolean;

  // Refetch
  refetch: () => void;
}

/**
 * Hook untuk server-side table dengan React Query integration
 *
 * Menggabungkan useTableFilters dengan data fetching dari API
 * Kompatibel dengan response format: {data, total, page, limit}
 *
 * Features:
 * - Automatic API calls dengan filter/sort/pagination params
 * - React Query caching dan refetching
 * - Type-safe data handling
 * - Error handling
 * - Loading states
 *
 * @example
 * ```tsx
 * const table = useServerTable<Course>({
 *   queryKey: ["courses"],
 *   endpoint: "/courses",
 *   initialLimit: 10,
 *   initialFilters: { category: "web" },
 * });
 *
 * return (
 *   <>
 *     <SearchInput
 *       value={table.filters.search}
 *       onChange={table.filters.setSearch}
 *     />
 *
 *     {table.isLoading ? (
 *       <LoadingSkeleton />
 *     ) : (
 *       <Table
 *         data={table.data}
 *         total={table.total}
 *       />
 *     )}
 *
 *     <Pagination
 *       page={table.filters.page}
 *       total={table.totalPages}
 *       onPageChange={table.filters.setPage}
 *     />
 *   </>
 * );
 * ```
 */
export function useServerTable<T>(
  options: UseServerTableOptions
): UseServerTableReturn<T> {
  const { queryKey, endpoint, enabled = true, ...filterConfig } = options;

  // Use table filters hook
  const filters = useTableFilters(filterConfig);

  // Build query params, remove undefined values
  const cleanQueryParams = Object.fromEntries(
    Object.entries(filters.queryParams).filter(
      ([, value]) => value !== undefined
    )
  );

  // Fetch data with React Query
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKey, cleanQueryParams],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{
          courses: T[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
          };
        }>
      >(endpoint, {
        params: cleanQueryParams,
      });
      return response.data.data;
    },
    enabled: enabled,
    staleTime: 1000 * 60, // 1 minute
  });

  const data = responseData?.courses ?? [];
  const total = responseData?.pagination?.total ?? 0;
  const totalPages = responseData?.pagination?.total_pages ?? 1;
  const hasNextPage = filters.page < totalPages;
  const hasPrevPage = filters.page > 1;

  return {
    data,
    total,
    totalPages,
    isLoading,
    isError,
    error: error as Error | null,
    filters,
    hasNextPage,
    hasPrevPage,
    refetch,
  };
}

/**
 * Alternative hook untuk simpler use cases tanpa React Query
 * Gunakan ini jika sudah fetch data di parent component
 */
export function useTableFiltersOnly(config: TableFilterConfig = {}) {
  return useTableFilters(config);
}

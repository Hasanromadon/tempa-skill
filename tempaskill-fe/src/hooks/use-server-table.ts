"use client";

import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { TableFilterConfig, useTableFilters } from "./use-table-filters";

/**
 * Generic server table response structure
 * Supports multiple response formats through customizable parsers
 */
export interface ServerTableResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Options for parsing different API response formats
 * Allows hook to work with any API response structure
 */
export interface ResponseParserOptions<T> {
  // Extract items array from response
  getItems: (response: unknown) => T[];
  // Extract total count from response
  getTotal: (response: unknown) => number;
  // Extract total pages from response
  getTotalPages: (response: unknown) => number;
  // Optional: extract current page
  getPage?: (response: unknown) => number;
  // Optional: extract limit
  getLimit?: (response: unknown) => number;
}

interface UseServerTableOptions<T> extends TableFilterConfig {
  queryKey: string[];
  endpoint: string;
  enabled?: boolean;
  // Optional: custom response parser for different API formats
  responseParser?: ResponseParserOptions<T>;
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
 * Supports ANY API response format through customizable response parser.
 * Default parser works with TempaSKill API format: {courses, pagination}
 *
 * Features:
 * - Automatic API calls dengan filter/sort/pagination params
 * - React Query caching dan refetching
 * - Type-safe data handling
 * - Error handling
 * - Loading states
 * - Flexible response parsing
 *
 * @example
 * ```tsx
 * // With default parser (for courses endpoint)
 * const table = useServerTable<Course>({
 *   queryKey: ["courses"],
 *   endpoint: "/api/v1/courses",
 *   initialLimit: 10,
 * });
 *
 * // With custom parser (for different endpoint)
 * const table = useServerTable<User>({
 *   queryKey: ["users"],
 *   endpoint: "/api/v1/users",
 *   responseParser: {
 *     getItems: (res) => res.data.users,
 *     getTotal: (res) => res.data.pagination.total,
 *     getTotalPages: (res) => res.data.pagination.total_pages,
 *   },
 * });
 * ```
 */
export function useServerTable<T>(
  options: UseServerTableOptions<T>
): UseServerTableReturn<T> {
  const {
    queryKey,
    endpoint,
    enabled = true,
    responseParser,
    ...filterConfig
  } = options;

  // Use table filters hook
  const filters = useTableFilters(filterConfig);

  // Build query params, remove undefined values
  const cleanQueryParams = Object.fromEntries(
    Object.entries(filters.queryParams).filter(
      ([, value]) => value !== undefined
    )
  );

  // Default response parser for TempaSKill API
  const defaultParser: ResponseParserOptions<T> = {
    getItems: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return (data.courses as T[]) ?? [];
    },
    getTotal: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return (data.pagination as Record<string, unknown>)?.total as number ?? 0;
    },
    getTotalPages: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return (data.pagination as Record<string, unknown>)?.total_pages as number ?? 1;
    },
  };

  const parser = responseParser ?? defaultParser;

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
      const response = await apiClient.get<ApiResponse<unknown>>(
        endpoint,
        {
          params: cleanQueryParams,
        }
      );
      return response.data.data;
    },
    enabled: enabled,
    staleTime: 1000 * 60, // 1 minute
  });

  const data = parser.getItems(responseData);
  const total = parser.getTotal(responseData);
  const totalPages = parser.getTotalPages(responseData);
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

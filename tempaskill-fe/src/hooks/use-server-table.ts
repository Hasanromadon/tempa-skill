"use client";

import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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
 * Default parser auto-detects common TempaSKill API format:
 * { [key]: [], pagination: { total, total_pages } }
 *
 * Automatically tries to find array data in response. If that doesn't work,
 * you can provide a custom responseParser untuk handle different formats.
 *
 * Features:
 * - Automatic API calls dengan filter/sort/pagination params
 * - React Query caching dan refetching
 * - Type-safe data handling
 * - Error handling
 * - Loading states
 * - Auto-detect or custom response parsing
 *
 * @example
 * ```tsx
 * // With default parser (auto-detects courses, users, lessons, etc)
 * const table = useServerTable<Course>({
 *   queryKey: ["courses"],
 *   endpoint: "/api/v1/courses",
 *   initialLimit: 10,
 * });
 *
 * // With predefined parser
 * import { COMMON_PARSERS } from "@/lib/table-response-parsers";
 * const table = useServerTable<User>({
 *   queryKey: ["users"],
 *   endpoint: "/api/v1/users",
 *   responseParser: COMMON_PARSERS.users,
 * });
 *
 * // With custom parser (for different response format)
 * const table = useServerTable<Order>({
 *   queryKey: ["orders"],
 *   endpoint: "/api/v1/orders",
 *   responseParser: {
 *     getItems: (res) => res.data.items,
 *     getTotal: (res) => res.data.meta.total,
 *     getTotalPages: (res) => res.data.meta.total_pages,
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

  // Get React Query client untuk prefetch (Priority 3a)
  const queryClient = useQueryClient();

  // Use table filters hook
  const filters = useTableFilters(filterConfig);

  // Build query params, remove undefined values
  const cleanQueryParams = Object.fromEntries(
    Object.entries(filters.queryParams).filter(
      ([, value]) => value !== undefined
    )
  );

  // Default response parser: auto-detect common paginated format
  // Tries to find array data in response and pagination metadata
  const defaultParser: ResponseParserOptions<T> = {
    getItems: (res: unknown) => {
      const data = res as Record<string, unknown>;

      // Try common keys first (courses, users, lessons, enrollments, etc)
      const commonKeys = [
        "courses",
        "users",
        "lessons",
        "enrollments",
        "sessions",
        "reviews",
        "certificates",
        "transactions",
      ];

      for (const key of commonKeys) {
        const items = data?.[key];
        if (Array.isArray(items)) {
          return items as T[];
        }
      }

      // Fallback: find first array in response
      for (const value of Object.values(data ?? {})) {
        if (Array.isArray(value)) {
          return value as T[];
        }
      }

      return [];
    },
    getTotal: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return (
        ((data?.pagination as Record<string, unknown>)?.total as number) ?? 0
      );
    },
    getTotalPages: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return (
        ((data?.pagination as Record<string, unknown>)
          ?.total_pages as number) ?? 1
      );
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
      const response = await apiClient.get<ApiResponse<unknown>>(endpoint, {
        params: cleanQueryParams,
      });
      return response.data.data;
    },
    enabled: enabled,
    staleTime: 1000 * 60, // 1 minute
  });

  // Safely extract data using parser, handle undefined response
  const data = responseData ? parser.getItems(responseData) : [];
  const total = responseData ? parser.getTotal(responseData) : 0;
  const totalPages = responseData ? parser.getTotalPages(responseData) : 1;
  const hasNextPage = filters.page < totalPages;
  const hasPrevPage = filters.page > 1;

  /**
   * Priority 3a: Pagination Prefetch Optimization
   * Automatically prefetch next page before user navigates
   * Improves perceived performance and reduces loading time
   *
   * How it works:
   * 1. When component mounts or page changes
   * 2. If there's a next page available
   * 3. Prefetch that page in background using React Query
   * 4. When user clicks "Next", data is already cached
   * 5. Instant page transition with no loading spinner
   */
  useEffect(() => {
    if (!hasNextPage || !enabled) return;

    const nextParams = {
      ...cleanQueryParams,
      page: filters.page + 1,
    };

    // Prefetch next page in background
    queryClient.prefetchQuery({
      queryKey: [...queryKey, nextParams],
      queryFn: async () => {
        const response = await apiClient.get<ApiResponse<unknown>>(endpoint, {
          params: nextParams,
        });
        return response.data.data;
      },
      staleTime: 1000 * 60, // Match query stale time
    });

    // Also prefetch previous page for back navigation
    if (hasPrevPage) {
      const prevParams = {
        ...cleanQueryParams,
        page: filters.page - 1,
      };

      queryClient.prefetchQuery({
        queryKey: [...queryKey, prevParams],
        queryFn: async () => {
          const response = await apiClient.get<ApiResponse<unknown>>(endpoint, {
            params: prevParams,
          });
          return response.data.data;
        },
        staleTime: 1000 * 60,
      });
    }
  }, [
    filters.page,
    hasNextPage,
    hasPrevPage,
    enabled,
    queryClient,
    queryKey,
    endpoint,
    cleanQueryParams,
  ]);

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

/**
 * Common API Response Parsers for useServerTable Hook
 *
 * Provides reusable parsers untuk berbagai endpoint dan response formats
 * yang umum digunakan di TempaSKill API
 */

import type { ResponseParserOptions } from "@/hooks/use-server-table";

/**
 * Detects common pagination structure and extracts data
 *
 * Supports these response formats:
 * 1. { courses: [], pagination: { total, total_pages } }
 * 2. { users: [], pagination: { total, total_pages } }
 * 3. { lessons: [], pagination: { total, total_pages } }
 * etc - any { [key]: [], pagination: {...} } format
 *
 * @example
 * ```tsx
 * // Auto-detect courses endpoint
 * const table = useServerTable<Course>({
 *   endpoint: "/api/v1/courses",
 *   responseParser: createPaginatedParser("courses"),
 * });
 *
 * // Auto-detect users endpoint
 * const table = useServerTable<User>({
 *   endpoint: "/api/v1/users",
 *   responseParser: createPaginatedParser("users"),
 * });
 * ```
 */
export function createPaginatedParser<T>(
  itemsKey: string
): ResponseParserOptions<T> {
  return {
    getItems: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return (data?.[itemsKey] as T[]) ?? [];
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
    getPage: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return ((data?.pagination as Record<string, unknown>)?.page as number) ?? 1;
    },
    getLimit: (res: unknown) => {
      const data = res as Record<string, unknown>;
      return ((data?.pagination as Record<string, unknown>)?.limit as number) ?? 10;
    },
  };
}

/**
 * For API responses yang return data langsung sebagai array
 *
 * Supports: [item1, item2, ...] (tanpa pagination)
 *
 * @example
 * ```tsx
 * const table = useServerTable<Tag>({
 *   endpoint: "/api/v1/tags",
 *   responseParser: createArrayParser(),
 * });
 * ```
 */
export function createArrayParser<T>(): ResponseParserOptions<T> {
  return {
    getItems: (res: unknown) => {
      return (Array.isArray(res) ? res : []) as T[];
    },
    getTotal: (res: unknown) => {
      return Array.isArray(res) ? res.length : 0;
    },
    getTotalPages: (res: unknown) => {
      const total = Array.isArray(res) ? res.length : 0;
      return total > 0 ? 1 : 0;
    },
  };
}

/**
 * For API responses dengan custom nested structure
 *
 * Supports: { data: { items: [], meta: { total, total_pages } } }
 * atau custom path apapun
 *
 * @example
 * ```tsx
 * const table = useServerTable<Order>({
 *   endpoint: "/api/v1/orders",
 *   responseParser: createCustomParser(
 *     res => res.data.items,
 *     res => res.data.meta.total,
 *     res => res.data.meta.total_pages
 *   ),
 * });
 * ```
 */
export function createCustomParser<T>(
  getItems: (res: unknown) => T[],
  getTotal: (res: unknown) => number,
  getTotalPages: (res: unknown) => number,
  getPage?: (res: unknown) => number,
  getLimit?: (res: unknown) => number
): ResponseParserOptions<T> {
  return {
    getItems,
    getTotal,
    getTotalPages,
    getPage,
    getLimit,
  };
}

/**
 * Predefined parsers untuk common TempaSKill endpoints
 */
export const COMMON_PARSERS = {
  courses: createPaginatedParser("courses"),
  users: createPaginatedParser("users"),
  lessons: createPaginatedParser("lessons"),
  enrollments: createPaginatedParser("enrollments"),
  sessions: createPaginatedParser("sessions"),
  reviews: createPaginatedParser("reviews"),
  certificates: createPaginatedParser("certificates"),
  transactions: createPaginatedParser("transactions"),
} as const;

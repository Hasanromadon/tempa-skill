/**
 * Utility functions untuk table operations
 * Includes: search, filtering, sorting, debouncing
 */

/**
 * Debounce search untuk menghindari API calls terlalu sering
 *
 * @example
 * ```tsx
 * const debouncedSearch = createDebouncedSearch((value) => {
 *   filters.setSearch(value);
 * });
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function createDebouncedSearch(
  callback: (value: string) => void,
  delayMs = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (value: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(value);
    }, delayMs);
  };
}

/**
 * Build filter object dari form values
 * Removes empty/undefined values
 *
 * @example
 * ```tsx
 * const filters = buildFilters({
 *   category: "web",
 *   difficulty: "",
 *   status: "published"
 * });
 * // Result: { category: "web", status: "published" }
 * ```
 */
export function buildFilters(
  filterValues: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filterValues).filter(([, value]) => {
      // Skip empty strings, undefined, null
      if (value === "" || value === undefined || value === null) {
        return false;
      }
      // Skip arrays yang kosong
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    })
  );
}

/**
 * Combine multiple search fields
 * Cari di beberapa field dengan satu keyword
 *
 * @example
 * ```tsx
 * const courses = data.filter(course =>
 *   searchInFields(course, ["title", "description"], "react")
 * );
 * ```
 */
export function searchInFields(
  item: Record<string, unknown>,
  fields: string[],
  searchTerm: string
): boolean {
  if (!searchTerm) return true;

  const lowerSearch = searchTerm.toLowerCase();

  return fields.some((field) => {
    const value = getNestedProperty(item, field);
    if (!value) return false;
    return String(value).toLowerCase().includes(lowerSearch);
  });
}

/**
 * Get nested property dari object (support dot notation)
 *
 * @example
 * ```tsx
 * getNestedProperty({ user: { name: "John" } }, "user.name"); // "John"
 * ```
 */
export function getNestedProperty(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split(".").reduce((current: unknown, prop) => {
    if (current === null || current === undefined) return current;
    return (current as Record<string, unknown>)[prop];
  }, obj);
}

/**
 * Sorting utility untuk array
 *
 * @example
 * ```tsx
 * const sorted = sortArray(courses, "title", "asc");
 * ```
 */
export function sortArray<T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    // Handle numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Handle strings
    if (typeof aVal === "string" && typeof bVal === "string") {
      return order === "asc"
        ? aVal.localeCompare(bVal, "id-ID")
        : bVal.localeCompare(aVal, "id-ID");
    }

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === "asc"
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    return 0;
  });
}

/**
 * Sort multiple fields (composite sort)
 *
 * @example
 * ```tsx
 * const sorted = multiSort(courses, [
 *   { key: "category", order: "asc" },
 *   { key: "title", order: "asc" },
 * ]);
 * ```
 */
export function multiSort<T>(
  array: T[],
  sortConfigs: Array<{ key: keyof T; order: "asc" | "desc" }>
): T[] {
  return [...array].sort((a, b) => {
    for (const config of sortConfigs) {
      const aVal = a[config.key];
      const bVal = b[config.key];

      if (aVal === bVal) continue;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return config.order === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        const comparison = aVal.localeCompare(bVal, "id-ID");
        return config.order === "asc" ? comparison : -comparison;
      }

      return 0;
    }
    return 0;
  });
}

/**
 * Paginate array (client-side pagination)
 *
 * @example
 * ```tsx
 * const paginated = paginateArray(data, page, limit);
 * // { items: [...], hasNextPage: true, hasPrevPage: false }
 * ```
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  limit: number
): {
  items: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
  totalPages: number;
} {
  const total = array.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    items: array.slice(start, end),
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    total,
    totalPages,
  };
}

/**
 * Format table URL query params
 *
 * @example
 * ```tsx
 * const url = formatTableUrl("/courses", {
 *   page: 1,
 *   limit: 10,
 *   search: "react",
 *   category: "web"
 * });
 * // /courses?page=1&limit=10&search=react&category=web
 * ```
 */
export function formatTableUrl(
  baseUrl: string,
  params: Record<string, unknown>
): string {
  const cleanParams = buildFilters(params);
  const searchParams = new URLSearchParams();

  Object.entries(cleanParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Parse table URL query params
 *
 * @example
 * ```tsx
 * const params = parseTableUrl("?page=1&limit=10&search=react");
 * // { page: "1", limit: "10", search: "react" }
 * ```
 */
export function parseTableUrl(
  query: string
): Record<string, string | string[]> {
  const params = new URLSearchParams(query);
  const result: Record<string, string | string[]> = {};

  // Handle multiple values for same key
  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Combine search + filter + sort + pagination untuk array
 * Gunakan untuk client-side table operations
 *
 * @example
 * ```tsx
 * const results = processTableData(data, {
 *   search: "react",
 *   searchFields: ["title", "description"],
 *   filters: { category: "web", difficulty: "beginner" },
 *   filterFn: (item) => item.isActive === true,
 *   sortBy: "title",
 *   sortOrder: "asc",
 *   page: 1,
 *   limit: 10,
 * });
 * // { items, total, totalPages, hasNextPage, hasPrevPage }
 * ```
 */
export interface ProcessTableDataOptions<T extends Record<string, unknown>> {
  search?: string;
  searchFields?: (keyof T)[];
  filters?: Record<string, unknown>;
  filterFn?: (item: T) => boolean;
  sortBy?: keyof T;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function processTableData<T extends Record<string, unknown>>(
  data: T[],
  options: ProcessTableDataOptions<T> = {}
): {
  items: T[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const {
    search = "",
    searchFields = [],
    filters = {},
    filterFn,
    sortBy,
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = options;

  let result = [...data];

  // Apply search
  if (search && searchFields.length > 0) {
    result = result.filter((item) =>
      searchInFields(item, searchFields as string[], search)
    );
  }

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result = result.filter((item) => {
        const itemValue = getNestedProperty(item, key);
        if (Array.isArray(value)) {
          return (value as unknown[]).includes(itemValue);
        }
        return itemValue === value;
      });
    }
  });

  // Apply custom filter function
  if (filterFn) {
    result = result.filter(filterFn);
  }

  // Apply sorting
  if (sortBy) {
    result = sortArray(result, sortBy, sortOrder);
  }

  // Apply pagination
  const pagination = paginateArray(result, page, limit);

  return {
    items: pagination.items,
    total: pagination.total,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPrevPage: pagination.hasPrevPage,
  };
}

/**
 * Export utilities untuk custom usage
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delayMs: number
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delayMs);
  }) as T;
}

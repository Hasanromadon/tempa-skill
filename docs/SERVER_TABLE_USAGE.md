# useServerTable Hook - Complete Guide

Headless hook untuk server-side pagination dan filtering yang generic dan reusable di berbagai endpoint API.

## 🎯 Fitur Utama

- ✅ Support ANY API response format melalui custom response parser
- ✅ Server-side pagination ready
- ✅ Search, filter, sort integration
- ✅ React Query caching dan refetching
- ✅ Type-safe dengan TypeScript generics
- ✅ Zero dependencies (besides React + React Query)

## 📦 API Response Format Support

### Default Format (TempaSKill Courses)

```json
{
  "data": {
    "courses": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

### Custom Format Support

Dengan `responseParser`, hook dapat handle ANY response format:

```json
{
  "data": {
    "users": [...],
    "meta": {
      "total": 100,
      "per_page": 10,
      "current_page": 1
    }
  }
}
```

## 🚀 Usage Examples

### 1. Default Usage (Courses List)

```tsx
"use client";

import { useServerTable } from "@/hooks";
import type { Course } from "@/types/api";

export default function CoursesPage() {
  const table = useServerTable<Course>({
    queryKey: ["courses"],
    endpoint: "/api/v1/courses",
    initialLimit: 10,
    initialFilters: { category: "" },
  });

  if (table.isLoading) return <div>Loading...</div>;
  if (table.isError) return <div>Error: {table.error?.message}</div>;

  return (
    <>
      <input
        value={table.filters.search}
        onChange={(e) => table.filters.setSearch(e.target.value)}
        placeholder="Search..."
      />

      <table>
        <tbody>
          {table.data.map((course) => (
            <tr key={course.id}>
              <td>{course.title}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        Page {table.filters.page} of {table.totalPages}
      </div>
    </>
  );
}
```

### 2. Custom Response Parser (Users)

```tsx
import { useServerTable } from "@/hooks";
import type { User } from "@/types/api";

export default function UsersPage() {
  const table = useServerTable<User>({
    queryKey: ["users"],
    endpoint: "/api/v1/admin/users",
    initialLimit: 20,
    responseParser: {
      // Custom parser untuk endpoint users
      getItems: (response) => (response as any).data.users,
      getTotal: (response) => (response as any).data.pagination.total,
      getTotalPages: (response) =>
        (response as any).data.pagination.total_pages,
    },
  });

  // Rest of component...
}
```

### 3. Different API Response Structure (Pagination in different location)

```tsx
export default function OrdersPage() {
  const table = useServerTable<Order>({
    queryKey: ["orders"],
    endpoint: "/api/orders",
    responseParser: {
      // API returns: { orders: [...], meta: { total, per_page, current_page } }
      getItems: (res) => (res as any).orders,
      getTotal: (res) => (res as any).meta.total,
      getTotalPages: (res) =>
        Math.ceil((res as any).meta.total / (res as any).meta.per_page),
      // Optional: extract page/limit
      getPage: (res) => (res as any).meta.current_page,
      getLimit: (res) => (res as any).meta.per_page,
    },
  });

  // Rest of component...
}
```

### 4. Advanced: With All Filters and Sorting

```tsx
export default function AdminCoursesPage() {
  const table = useServerTable<Course>({
    queryKey: ["admin-courses"],
    endpoint: "/api/v1/admin/courses",
    initialLimit: 10,
    initialFilters: {
      category: "",
      difficulty: "",
      status: "all",
    },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        value={table.filters.search}
        onChange={(e) => table.filters.setSearch(e.target.value)}
        placeholder="Search courses..."
      />

      {/* Filters */}
      <select
        value={table.filters.filters.category || ""}
        onChange={(e) => table.filters.setFilter("category", e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="web">Web Development</option>
        <option value="mobile">Mobile Development</option>
      </select>

      {/* Sort */}
      <button onClick={() => table.filters.toggleSort("title")}>
        Sort by Title{" "}
        {table.filters.sortBy === "title" && table.filters.sortOrder}
      </button>

      {/* Results */}
      <div>
        Showing {(table.filters.page - 1) * table.filters.limit + 1} to{" "}
        {Math.min(table.filters.page * table.filters.limit, table.total)} of{" "}
        {table.total}
      </div>

      {/* Table */}
      <table>
        <tbody>
          {table.data.map((course) => (
            <tr key={course.id}>{/* ... */}</tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex gap-2">
        <button
          disabled={!table.hasPrevPage}
          onClick={() => table.filters.setPage(table.filters.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {table.filters.page} of {table.totalPages}
        </span>
        <button
          disabled={!table.hasNextPage}
          onClick={() => table.filters.setPage(table.filters.page + 1)}
        >
          Next
        </button>
      </div>

      {/* Limit Selector */}
      <select
        value={table.filters.limit}
        onChange={(e) => table.filters.setLimit(Number(e.target.value))}
      >
        <option value="10">10 per page</option>
        <option value="20">20 per page</option>
        <option value="50">50 per page</option>
      </select>
    </div>
  );
}
```

## 🔧 Hook API Reference

### Input Options

```typescript
interface UseServerTableOptions<T> extends TableFilterConfig {
  // Required
  queryKey: string[];              // React Query key
  endpoint: string;                // API endpoint

  // Optional
  enabled?: boolean;               // Enable/disable query
  responseParser?: ResponseParserOptions<T>; // Custom parser

  // From TableFilterConfig
  initialSearch?: string;
  initialFilters?: Record<string, unknown>;
  initialPage?: number;
  initialLimit?: number;
  initialSort?: {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}
```

### Output (Return Value)

```typescript
interface UseServerTableReturn<T> {
  // Data
  data: T[];                       // Items array
  total: number;                   // Total count
  totalPages: number;              // Total pages

  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Filters (full useTableFilters API)
  filters: {
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

    // Sort
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
  };

  // Pagination helpers
  hasNextPage: boolean;
  hasPrevPage: boolean;

  // Methods
  refetch: () => void;             // Manual refetch
}
```

### Response Parser Options

```typescript
interface ResponseParserOptions<T> {
  // Extract items array (required)
  getItems: (response: unknown) => T[];

  // Extract total count (required)
  getTotal: (response: unknown) => number;

  // Extract total pages (required)
  getTotalPages: (response: unknown) => number;

  // Optional: extract current page
  getPage?: (response: unknown) => number;

  // Optional: extract items per page limit
  getLimit?: (response: unknown) => number;
}
```

## 📋 Common Response Patterns

### Pattern 1: TempaSKill (Default)

```json
{
  "data": {
    "courses": [...],
    "pagination": { "page": 1, "limit": 10, "total": 100, "total_pages": 10 }
  }
}
```

Parser:
```typescript
responseParser: {
  getItems: (res) => (res as any).courses,
  getTotal: (res) => (res as any).pagination.total,
  getTotalPages: (res) => (res as any).pagination.total_pages,
}
```

### Pattern 2: Simple Array + Meta

```json
{
  "data": [...],
  "meta": { "total": 100 }
}
```

Parser:
```typescript
responseParser: {
  getItems: (res) => (res as any).data,
  getTotal: (res) => (res as any).meta.total,
  getTotalPages: (res) => 10, // Assume 10 per page
}
```

### Pattern 3: Nested Data

```json
{
  "success": true,
  "result": {
    "records": [...],
    "totalRecords": 100,
    "pageSize": 10,
    "pageNumber": 1
  }
}
```

Parser:
```typescript
responseParser: {
  getItems: (res) => (res as any).result.records,
  getTotal: (res) => (res as any).result.totalRecords,
  getTotalPages: (res) =>
    Math.ceil((res as any).result.totalRecords / (res as any).result.pageSize),
}
```

## 🔄 Query Params Sent to API

```
GET /api/endpoint?page=1&limit=10&search=keyword&category=web&sort_by=title&sort_order=asc
```

Parameters:
- `page`: Current page (1-indexed)
- `limit`: Items per page
- `search`: Search term (optional)
- `sort_by`: Sort field (optional)
- `sort_order`: Sort direction: "asc" | "desc" (optional)
- Any custom filters added via `setFilter()`

## 💡 Best Practices

1. **Create Type-Safe Query Keys**

```typescript
const courseQueryKeys = {
  all: ["courses"] as const,
  lists: () => [...courseQueryKeys.all, "list"] as const,
  list: (filters: unknown) =>
    [...courseQueryKeys.lists(), filters] as const,
  detail: (id: number) => [...courseQueryKeys.all, "detail", id] as const,
};

// Usage
const table = useServerTable<Course>({
  queryKey: courseQueryKeys.list(filters),
  endpoint: "/api/v1/courses",
});
```

2. **Extract Response Parser to Constant**

```typescript
const courseResponseParser: ResponseParserOptions<Course> = {
  getItems: (res) => (res as any).courses,
  getTotal: (res) => (res as any).pagination.total,
  getTotalPages: (res) => (res as any).pagination.total_pages,
};

const userResponseParser: ResponseParserOptions<User> = {
  getItems: (res) => (res as any).data.users,
  getTotal: (res) => (res as any).data.pagination.total,
  getTotalPages: (res) => (res as any).data.pagination.total_pages,
};
```

3. **Combine with UI Components**

```tsx
import {
  SearchFilterInput,
  SelectFilter,
  LimitSelect,
  TableStatus,
  Pagination,
} from "@/components/common";

export default function AdminPage() {
  const table = useServerTable<Course>({
    queryKey: ["courses"],
    endpoint: "/api/v1/courses",
  });

  return (
    <>
      <SearchFilterInput
        value={table.filters.search}
        onChange={table.filters.setSearch}
        onClear={table.filters.clearSearch}
      />

      <SelectFilter
        value={table.filters.filters.category || ""}
        onChange={(value) => table.filters.setFilter("category", value)}
        options={[
          { value: "", label: "All" },
          { value: "web", label: "Web" },
        ]}
      />

      <LimitSelect
        value={table.filters.limit}
        onChange={table.filters.setLimit}
      />

      <TableStatus
        isLoading={table.isLoading}
        isError={table.isError}
        isEmpty={table.data.length === 0}
      />

      {/* Table content */}

      <Pagination
        page={table.filters.page}
        total={table.totalPages}
        onPageChange={table.filters.setPage}
      />
    </>
  );
}
```

## 🧪 Testing

```typescript
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("useServerTable", () => {
  const queryClient = new QueryClient();

  it("should fetch and display data", async () => {
    const { result } = renderHook(() => useServerTable<Course>({...}), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(10);
    });
  });

  it("should handle pagination", async () => {
    const { result } = renderHook(() => useServerTable<Course>({...}), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    act(() => {
      result.current.filters.setPage(2);
    });

    expect(result.current.filters.page).toBe(2);
  });
});
```

## 🚦 Performance Tips

1. **Use appropriate staleTime**

```typescript
const table = useServerTable<Course>({
  // ...,
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

2. **Debounce search**

```typescript
const [search, setSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    table.filters.setSearch(search);
  }, 300);

  return () => clearTimeout(timer);
}, [search]);
```

3. **Memoize response parser**

```typescript
const responseParser = useMemo(
  () => ({
    getItems: (res) => (res as any).courses,
    getTotal: (res) => (res as any).pagination.total,
    getTotalPages: (res) => (res as any).pagination.total_pages,
  }),
  []
);
```

## 📚 Related Documentation

- [useTableFilters Hook](./FILTER_TABLE_GUIDE.md)
- [Filter Components](./FILTER_TABLE_GUIDE.md#filter-components)
- [Table Utilities](./FILTER_TABLE_GUIDE.md#table-utilities)

---

**Last Updated**: November 27, 2025  
**Version**: 2.0 (Generic API Support)

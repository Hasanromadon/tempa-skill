# Filter Table System Documentation

Dokumentasi lengkap untuk sistem filter table yang reusable, headless, dan composable.

## Overview

Sistem ini menyediakan:

- **`useTableFilters`** - Headless hook untuk state management (search, filters, sort, pagination)
- **`useServerTable`** - Hook untuk server-side pagination dengan React Query
- **Filter Components** - Reusable UI components (search, limit selector, filter badges)
- **Table Utils** - Utility functions untuk operasi table (search, sort, paginate)

## Struktur

```
src/
├── hooks/
│   ├── use-table-filters.ts      # Headless filter logic
│   └── use-server-table.ts       # Server-side pagination with React Query
├── components/common/
│   └── filter-table.tsx          # Reusable UI components
└── lib/
    └── table-utils.ts           # Utility functions
```

## 1. useTableFilters Hook

Hook headless untuk mengelola state filter, search, sort, dan pagination.

### Usage Basic

```tsx
import { useTableFilters } from "@/hooks/use-table-filters";

export function MyTable() {
  const filters = useTableFilters({
    initialSearch: "",
    initialFilters: { category: "all" },
    initialLimit: 10,
  });

  return (
    <>
      <SearchFilterInput
        value={filters.search}
        onChange={filters.setSearch}
        onClear={filters.clearSearch}
      />

      <LimitSelect value={filters.limit} onChange={filters.setLimit} />

      <Table
        data={filteredData}
        onSort={filters.toggleSort}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
      />

      <Pagination page={filters.page} onPageChange={filters.setPage} />
    </>
  );
}
```

### API Reference

```tsx
interface UseTableFiltersReturn {
  // State
  state: TableFilterState;
  queryParams: Record<string, unknown>; // URL-ready params

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
  toggleSort: (sortBy: string) => void; // Toggle asc/desc
  clearSort: () => void;

  // Pagination
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  goToFirstPage: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;

  // Utilities
  resetAll: () => void;
}
```

### Features

- ✅ **Search Management** - Real-time search dengan reset
- ✅ **Filter Management** - Multiple independent filters
- ✅ **Sorting** - Toggle asc/desc, change sort column
- ✅ **Pagination** - Page, limit management, navigation
- ✅ **Query Params** - Auto-generated URL params ready untuk API
- ✅ **Reset** - Reset ke initial state

---

## 2. useServerTable Hook

Hook untuk server-side pagination dengan React Query integration.

### Usage

```tsx
import { useServerTable } from "@/hooks/use-server-table";

export function AdminCoursesPage() {
  const table = useServerTable<Course>({
    queryKey: ["courses"],
    endpoint: "/api/v1/courses",
    initialLimit: 10,
    initialFilters: { category: "web" },
  });

  if (table.isLoading) return <LoadingSkeleton />;
  if (table.isError) return <ErrorAlert>{table.error?.message}</ErrorAlert>;

  return (
    <>
      {/* Filter Controls */}
      <SearchFilterInput
        value={table.filters.search}
        onChange={table.filters.setSearch}
        onClear={table.filters.clearSearch}
        disabled={table.isLoading}
      />

      <LimitSelect
        value={table.filters.limit}
        onChange={table.filters.setLimit}
        disabled={table.isLoading}
      />

      {/* Active Filters */}
      <ActiveFilters
        filters={table.filters.filters}
        labels={{ category: "Kategori", difficulty: "Level" }}
        onRemove={table.filters.clearFilter}
        onClearAll={table.filters.clearAllFilters}
      />

      {/* Results Info */}
      <ResultsSummary
        total={table.total}
        page={table.filters.page}
        limit={table.filters.limit}
      />

      {/* Table */}
      {table.data.length === 0 ? (
        <EmptyState />
      ) : (
        <Table data={table.data} onSort={table.filters.toggleSort} />
      )}

      {/* Pagination */}
      <Pagination
        page={table.filters.page}
        total={table.totalPages}
        onPageChange={table.filters.setPage}
        hasNextPage={table.hasNextPage}
        hasPrevPage={table.hasPrevPage}
      />
    </>
  );
}
```

### API Response Format

Hook mengharapkan API response dengan format ini:

```typescript
interface ServerTableResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Wrapped dalam ApiResponse
interface ApiResponse<T> {
  message?: string;
  data: T;
}
```

### API Query Parameters

Hook otomatis mengirim query params ke endpoint:

```typescript
// Contoh request:
GET /api/v1/courses?page=1&limit=10&search=react&category=web&sort_by=title&sort_order=asc

// Query params yang didukung:
{
  page: number;
  limit: number;
  search?: string;           // Search keyword
  [key: string]: unknown;    // Custom filters (category, difficulty, etc)
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
```

### API Reference

```tsx
interface UseServerTableReturn<T> {
  // Data
  data: T[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Filters - sama seperti useTableFilters
  filters: UseTableFiltersReturn;

  // Pagination helpers
  hasNextPage: boolean;
  hasPrevPage: boolean;

  // Refetch
  refetch: () => void;
}
```

---

## 3. Filter Components

Reusable UI components untuk filter operations.

### SearchFilterInput

Search input dengan clear button.

```tsx
<SearchFilterInput
  value={filters.search}
  onChange={filters.setSearch}
  onClear={filters.clearSearch}
  placeholder="Cari kursus..."
  disabled={isLoading}
/>
```

**Props:**

- `value: string` - Current search value
- `onChange: (value: string) => void` - On change handler
- `onClear: () => void` - On clear handler
- `placeholder?: string` - Input placeholder
- `disabled?: boolean` - Disable input

---

### LimitSelect

Select untuk mengubah items per page.

```tsx
<LimitSelect
  value={filters.limit}
  onChange={filters.setLimit}
  options={[10, 20, 50, 100]}
  disabled={isLoading}
/>
```

**Props:**

- `value: number` - Current limit
- `onChange: (limit: number) => void` - On change handler
- `options?: number[]` - Available options (default: [10, 20, 50, 100])
- `disabled?: boolean` - Disable select

---

### FilterBadge

Badge untuk menampilkan satu active filter.

```tsx
<FilterBadge
  label="Kategori"
  value="Web Development"
  onRemove={() => filters.clearFilter("category")}
/>
```

---

### ActiveFilters

Component untuk menampilkan semua active filters dengan remove buttons.

```tsx
<ActiveFilters
  filters={filters.filters}
  labels={{
    category: "Kategori",
    difficulty: "Level",
    instructor: "Instruktur",
  }}
  onRemove={(key) => filters.clearFilter(key)}
  onClearAll={filters.clearAllFilters}
/>
```

---

### SortHeader

Sortable table header component.

```tsx
<table>
  <thead>
    <tr>
      <th>
        <SortHeader
          label="Judul"
          sortKey="title"
          currentSort={filters.sortBy}
          currentOrder={filters.sortOrder}
          onSort={filters.toggleSort}
        />
      </th>
    </tr>
  </thead>
</table>
```

---

### TableStatus

Component untuk loading, error, empty states.

```tsx
<TableStatus
  isLoading={table.isLoading}
  isError={table.isError}
  isEmpty={table.data.length === 0}
  errorMessage="Gagal memuat data"
  emptyMessage="Tidak ada kursus"
/>
```

---

### ResultsSummary

Menampilkan "Showing 1-10 of 100".

```tsx
<ResultsSummary total={table.total} page={filters.page} limit={filters.limit} />
```

---

## 4. Table Utils

Utility functions untuk operasi table.

### searchInFields

Search di multiple fields.

```tsx
import { searchInFields } from "@/lib/table-utils";

const courses = data.filter((course) =>
  searchInFields(course, ["title", "description"], "react")
);
```

---

### sortArray

Sort array by field.

```tsx
import { sortArray } from "@/lib/table-utils";

const sorted = sortArray(courses, "title", "asc");
```

---

### paginateArray

Client-side pagination.

```tsx
import { paginateArray } from "@/lib/table-utils";

const { items, hasNextPage, totalPages } = paginateArray(data, 1, 10);
```

---

### processTableData

Combine search + filter + sort + paginate untuk array.

```tsx
import { processTableData } from "@/lib/table-utils";

const results = processTableData(data, {
  search: "react",
  searchFields: ["title", "description"],
  filters: { category: "web", difficulty: "beginner" },
  sortBy: "title",
  sortOrder: "asc",
  page: 1,
  limit: 10,
});

// Result: { items, total, totalPages, hasNextPage, hasPrevPage }
```

---

### formatTableUrl & parseTableUrl

Build dan parse URL query params.

```tsx
import { formatTableUrl, parseTableUrl } from "@/lib/table-utils";

// Build URL
const url = formatTableUrl("/courses", {
  page: 1,
  limit: 10,
  search: "react",
  category: "web",
});
// Result: "/courses?page=1&limit=10&search=react&category=web"

// Parse URL
const params = parseTableUrl("?page=1&limit=10&search=react");
// Result: { page: "1", limit: "10", search: "react" }
```

---

## 5. Complete Example

### Admin Courses Page (Server-side)

```tsx
"use client";

import { useServerTable } from "@/hooks/use-server-table";
import {
  SearchFilterInput,
  LimitSelect,
  ActiveFilters,
  TableStatus,
  ResultsSummary,
  SortHeader,
} from "@/components/common/filter-table";
import { Pagination } from "@/components/common/pagination";
import { CourseTable } from "@/components/course/course-table";
import type { Course } from "@/types";

export default function AdminCoursesPage() {
  const table = useServerTable<Course>({
    queryKey: ["admin", "courses"],
    endpoint: "/api/v1/courses",
    initialLimit: 10,
  });

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex gap-4">
        <SearchFilterInput
          value={table.filters.search}
          onChange={table.filters.setSearch}
          onClear={table.filters.clearSearch}
          placeholder="Cari kursus..."
          disabled={table.isLoading}
        />

        <LimitSelect
          value={table.filters.limit}
          onChange={table.filters.setLimit}
          disabled={table.isLoading}
        />
      </div>

      {/* Active Filters */}
      {table.filters.hasActiveFilters && (
        <ActiveFilters
          filters={table.filters.filters}
          onRemove={table.filters.clearFilter}
          onClearAll={table.filters.clearAllFilters}
        />
      )}

      {/* Results Info */}
      <ResultsSummary
        total={table.total}
        page={table.filters.page}
        limit={table.filters.limit}
      />

      {/* Table or Status */}
      <div className="border rounded-lg overflow-hidden">
        {table.isLoading || table.isError || table.data.length === 0 ? (
          <TableStatus
            isLoading={table.isLoading}
            isError={table.isError}
            isEmpty={table.data.length === 0}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">
                  <SortHeader
                    label="Judul"
                    sortKey="title"
                    currentSort={table.filters.sortBy}
                    currentOrder={table.filters.sortOrder}
                    onSort={table.filters.toggleSort}
                  />
                </th>
                <th className="px-4 py-2 text-left">Kategori</th>
                <th className="px-4 py-2 text-right">Harga</th>
              </tr>
            </thead>
            <tbody>
              {table.data.map((course) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{course.title}</td>
                  <td className="px-4 py-2">{course.category}</td>
                  <td className="px-4 py-2 text-right">
                    Rp {course.price.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        page={table.filters.page}
        total={table.totalPages}
        onPageChange={table.filters.setPage}
        hasNextPage={table.hasNextPage}
        hasPrevPage={table.hasPrevPage}
      />
    </div>
  );
}
```

### Client-side Table

```tsx
import { useTableFilters } from "@/hooks/use-table-filters";
import { processTableData } from "@/lib/table-utils";

export function ClientTable({ data }: { data: Course[] }) {
  const filters = useTableFilters({ initialLimit: 10 });

  const results = processTableData(data, {
    search: filters.search,
    searchFields: ["title", "description"],
    filters: filters.filters,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  });

  return (
    <>
      <SearchFilterInput
        value={filters.search}
        onChange={filters.setSearch}
        onClear={filters.clearSearch}
      />

      {/* Table... */}

      <Pagination
        page={filters.page}
        total={results.totalPages}
        onPageChange={filters.setPage}
      />
    </>
  );
}
```

---

## 6. Best Practices

### ✅ DO

1. **Use `useServerTable` untuk server-side data**

   ```tsx
   const table = useServerTable<Course>({
     queryKey: ["courses"],
     endpoint: "/api/v1/courses",
   });
   ```

2. **Use `useTableFilters` untuk client-side data**

   ```tsx
   const filters = useTableFilters();
   const results = processTableData(data, filters.state);
   ```

3. **Pass `disabled={isLoading}` ke components**

   ```tsx
   <SearchFilterInput disabled={table.isLoading} />
   ```

4. **Show loading, error, empty states**

   ```tsx
   <TableStatus
     isLoading={table.isLoading}
     isError={table.isError}
     isEmpty={table.data.length === 0}
   />
   ```

5. **Use search fields yang relevan**
   ```tsx
   processTableData(data, {
     searchFields: ["title", "description", "instructor.name"],
   });
   ```

### ❌ DON'T

1. **Jangan hardcode filter options**

   ```tsx
   // ❌ BAD
   const options = [{ label: "Web", value: "web" }];

   // ✅ GOOD
   const categories = data.map((c) => c.category);
   ```

2. **Jangan lupa debounce untuk search besar-besaran**

   ```tsx
   // Gunakan createDebouncedSearch untuk API calls
   const handleSearch = createDebouncedSearch((value) => {
     filters.setSearch(value);
   });
   ```

3. **Jangan pass undefined filters ke API**

   - Hook sudah handle ini, tapi double-check response format

4. **Jangan lupa reset pagination saat filter change**
   - Hook sudah handle otomatis via `setPage(1)`

---

## 7. Integration Checklist

- [ ] Import hooks dan components
- [ ] Setup `useServerTable` atau `useTableFilters`
- [ ] Add search input
- [ ] Add limit selector
- [ ] Add filter controls
- [ ] Show active filters
- [ ] Show results summary
- [ ] Add table with sortable headers
- [ ] Add pagination
- [ ] Handle loading/error/empty states
- [ ] Test filter combinations
- [ ] Test pagination
- [ ] Test search
- [ ] Test sorting

"use client";

import { Pagination } from "@/components/common/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode, useMemo, memo } from "react";

/**
 * SVG ICON CONSTANTS (Priority 2: Extracted to avoid recreation)
 * Icons are defined once and reused, preventing JSX recreation
 */
const ERROR_ICON = (
  <svg
    className="w-6 h-6 text-red-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const EMPTY_ICON = (
  <svg
    className="w-8 h-8 text-orange-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

/**
 * Cell rendering context - provides access to row data and utilities
 */
export interface CellContext<TData, TValue = unknown> {
  getValue: () => TValue;
  row: {
    original: TData;
    index: number;
  };
}

/**
 * Header cell rendering context
 */
export interface HeaderContext<TData> {
  column: {
    id: string;
  };
  header: {
    getContext: () => HeaderContext<TData>;
  };
}

/**
 * Column definition for reusable tables
 * Similar to TanStack Table v8 but simpler
 */
export interface ColumnDef<TData, TValue = unknown> {
  // Unique identifier for column
  id?: string;

  // Access nested properties with dot notation (e.g., "user.name")
  // Or function for custom value extraction
  accessor?: keyof TData | ((row: TData) => TValue);

  // Column header label or render function
  header?: string | ((context: HeaderContext<TData>) => ReactNode);

  // Cell render function
  cell?: (context: CellContext<TData, TValue>) => ReactNode;

  // Enable sorting for this column
  enableSorting?: boolean;

  // Sort key (defaults to id or accessor)
  sortKey?: string;

  // Column width class
  className?: string;

  // Header class
  headerClassName?: string;
}

/**
 * Props untuk generic DataTable component
 */
export interface DataTableProps<TData> {
  // Array of column definitions
  columns: ColumnDef<TData>[];

  // Array of data rows
  data: TData[];

  // Current page number
  page: number;

  // Items per page
  limit: number;

  // Total items count
  total: number;

  // Total pages
  totalPages: number;

  // Loading state
  isLoading?: boolean;

  // Error state
  isError?: boolean;

  // Empty state message
  emptyMessage?: string;

  // Loading message
  loadingMessage?: string;

  // Current sort column
  sortBy?: string;

  // Sort order (asc or desc)
  sortOrder?: "asc" | "desc";

  // Callback when sort header clicked
  onSort?: (sortKey: string) => void;

  // Pagination callbacks
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (limit: number) => void;

  // Page size options
  pageSizeOptions?: number[];

  // Show pagination at bottom
  showPagination?: boolean;

  // Show page size selector
  showPageSizeSelector?: boolean;

  // Show page numbers
  showPageNumbers?: boolean;
}

/**
 * Helper function to safely access nested properties
 */
function getValueByAccessor<TData, TValue>(
  row: TData,
  accessor?: keyof TData | ((row: TData) => TValue)
): TValue {
  if (!accessor) return undefined as TValue;

  if (typeof accessor === "function") {
    return accessor(row);
  }

  // Handle dot notation for nested properties
  const keys = String(accessor).split(".");
  let value: unknown = row;

  for (const key of keys) {
    value = (value as Record<string, unknown>)?.[key];
  }

  return value as TValue;
}

/**
 * Priority 2 Optimization: Memoized TableRow component
 * Prevents unnecessary re-renders when parent table updates
 * Only re-renders if columns, row data, or handlers actually change
 */
interface DataTableRowProps<TData> {
  row: TData;
  rowIndex: number;
  columns: ColumnDef<TData>[];
}

const DataTableRow = memo(function DataTableRow<TData>({
  row,
  rowIndex,
  columns,
}: DataTableRowProps<TData>) {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-orange-50 transition-colors duration-150 group">
      {columns.map((column) => {
        const columnId = column.id || (column.accessor as string);
        const value = getValueByAccessor(row, column.accessor);

        return (
          <TableCell
            key={columnId}
            className={`py-4 text-gray-700 group-hover:text-gray-900 transition-colors ${
              column.className || ""
            }`}
          >
            {column.cell ? (
              column.cell({
                getValue: () => value,
                row: {
                  original: row,
                  index: rowIndex,
                },
              })
            ) : (
              <>{value || "-"}</>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}) as <TData>(props: DataTableRowProps<TData>) => React.ReactElement;

/**
 * Generic reusable DataTable component
 *
 * Works seamlessly with useServerTable hook
 * Uses column definitions to define structure and behavior
 *
 * Performance optimizations:
 * - Priority 1: Memoized pagination calculations
 * - Priority 2a: Memoized row component (DataTableRow)
 * - Priority 2b: Extracted SVG icons to constants
 * - Efficient header context creation
 * - Skeleton loading for better UX
 */
export function DataTable<TData>({
  columns,
  data,
  page,
  limit,
  total,
  isLoading = false,
  isError = false,
  emptyMessage = "Tidak ada data",
  loadingMessage = "Memuat data...",
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPagination = true,
  showPageSizeSelector = true,
  showPageNumbers = true,
}: DataTableProps<TData>) {
  // Memoize start and end row calculations
  const startRow = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const endRow = useMemo(
    () => Math.min(page * limit, total),
    [page, limit, total]
  );
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => {
                  const columnId = column.id || (column.accessor as string);
                  return (
                    <TableHead
                      key={columnId}
                      className={`bg-gray-50 ${column.headerClassName}`}
                    >
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-transparent">
                  {columns.map((column) => {
                    const columnId = column.id || (column.accessor as string);
                    return (
                      <TableCell key={columnId} className="py-4">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-center py-4 text-gray-500 text-sm">
          {loadingMessage}
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50">
        <div className="w-full py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              {ERROR_ICON}
            </div>
            <div>
              <p className="font-semibold text-red-900">Gagal memuat data</p>
              <p className="text-sm text-red-700 mt-1">
                Silakan coba lagi atau hubungi dukungan jika masalah berlanjut
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-linear-to-b from-gray-50 to-white">
        <div className="w-full py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              {EMPTY_ICON}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {emptyMessage}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Tidak ada data yang sesuai dengan kriteria pencarian Anda
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => {
                const columnId = column.id || (column.accessor as string);
                const sortKey = column.sortKey || columnId;
                const isSorted = sortBy === sortKey;
                const isSortable = column.enableSorting && onSort;

                return (
                  <TableHead
                    key={columnId}
                    className={`font-semibold text-gray-700 text-sm uppercase tracking-wide ${
                      column.headerClassName || ""
                    }`}
                  >
                    {isSortable ? (
                      <button
                        onClick={() => onSort(sortKey)}
                        className="inline-flex items-center gap-2 font-semibold text-gray-700 hover:text-orange-600 transition-colors duration-200"
                        aria-label={`Sort by ${columnId}`}
                      >
                        {typeof column.header === "function" ? (
                          column.header({
                            column: { id: columnId },
                            header: {
                              getContext: () => ({
                                column: { id: columnId },
                                header: {
                                  getContext: () => ({
                                    column: { id: columnId },
                                    header: {
                                      getContext: () => ({
                                        column: { id: columnId },
                                        header: {
                                          getContext: () =>
                                            ({} as HeaderContext<TData>),
                                        },
                                      }),
                                    },
                                  }),
                                },
                              }),
                            },
                          })
                        ) : (
                          <span>{column.header}</span>
                        )}
                        {isSorted && (
                          <span className="inline-flex">
                            {sortOrder === "asc" ? (
                              <ChevronUp className="w-4 h-4 text-orange-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-orange-600" />
                            )}
                          </span>
                        )}
                      </button>
                    ) : (
                      <>
                        {typeof column.header === "function" ? (
                          column.header({
                            column: { id: columnId },
                            header: {
                              getContext: () => ({
                                column: { id: columnId },
                                header: {
                                  getContext: () => ({
                                    column: { id: columnId },
                                    header: {
                                      getContext: () =>
                                        ({} as HeaderContext<TData>),
                                    },
                                  }),
                                },
                              }),
                            },
                          })
                        ) : (
                          <span>{column.header}</span>
                        )}
                      </>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <DataTableRow
                key={rowIndex}
                row={row}
                rowIndex={rowIndex}
                columns={columns}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results summary + Pagination - Built-in */}
      {showPagination && data.length > 0 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1 pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            Menampilkan{" "}
            <span className="text-orange-600 font-semibold">
              {startRow}-{endRow}
            </span>{" "}
            dari <span className="text-orange-600 font-semibold">{total}</span>{" "}
            data
          </p>
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(total / limit))}
            totalItems={total}
            pageSize={limit}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
            showPageSizeSelector={showPageSizeSelector}
            showPageNumbers={showPageNumbers}
          />
        </div>
      )}
    </div>
  );
}

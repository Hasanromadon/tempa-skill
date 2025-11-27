"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReactNode } from "react";

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
  header?:
    | string
    | ((context: HeaderContext<TData>) => ReactNode);

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
 * Generic reusable DataTable component
 *
 * Works seamlessly with useServerTable hook
 * Uses column definitions to define structure and behavior
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
}: DataTableProps<TData>) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full py-8 text-center">
        <div className="inline-flex items-center gap-2 text-gray-600">
          <div className="animate-spin">
            <div className="h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full" />
          </div>
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-red-600">Gagal memuat data. Silakan coba lagi.</p>
      </div>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  // Calculate start and end row numbers
  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const columnId = column.id || (column.accessor as string);
                const sortKey =
                  column.sortKey || columnId;
                const isSorted = sortBy === sortKey;
                const isSortable = column.enableSorting && onSort;

                return (
                  <TableHead
                    key={columnId}
                    className={column.headerClassName}
                  >
                    {isSortable ? (
                      <button
                        onClick={() => onSort(sortKey)}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
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
                                          getContext: () => ({} as HeaderContext<TData>),
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
                          <span className="text-sm">
                            {sortOrder === "asc" ? "↑" : "↓"}
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
                                      getContext: () => ({} as HeaderContext<TData>),
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
              <TableRow key={rowIndex}>
                {columns.map((column) => {
                  const columnId = column.id || (column.accessor as string);
                  const value = getValueByAccessor(row, column.accessor);

                  return (
                    <TableCell key={columnId} className={column.className}>
                      {column.cell ? (
                        column.cell({
                          getValue: () => value,
                          row: {
                            original: row,
                            index: rowIndex,
                          },
                        })
                      ) : (
                        <>{value}</>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Menampilkan {startRow}-{endRow} dari {total} data
        </div>
      </div>
    </div>
  );
}

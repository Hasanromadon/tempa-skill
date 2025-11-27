import { useMemo, useState } from "react";

interface UseDataTableProps<T> {
  data: T[];
  pageSize?: number;
}

interface UseDataTableReturn<T> {
  // State
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;

  // Paginated data
  paginatedData: T[];

  // Actions
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * Hook untuk data table pagination logic
 *
 * Headless pagination hook yang dapat digunakan dengan TanStack Table, Material-UI, Shadcn, dll
 *
 * @example
 * ```tsx
 * const { currentPage, paginatedData, totalPages, goToPage } = useDataTable({
 *   data: courses,
 *   pageSize: 10,
 * });
 *
 * return (
 *   <>
 *     <Table data={paginatedData} />
 *     <Pagination
 *       current={currentPage}
 *       total={totalPages}
 *       onChange={goToPage}
 *     />
 *   </>
 * );
 * ```
 */
export function useDataTable<T>({
  data,
  pageSize = 10,
}: UseDataTableProps<T>): UseDataTableReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSizeState);

  // Pastikan currentPage tidak melebihi totalPages
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const paginatedData = useMemo(() => {
    const startIndex = (validPage - 1) * pageSizeState;
    const endIndex = startIndex + pageSizeState;
    return data.slice(startIndex, endIndex);
  }, [data, validPage, pageSizeState]);

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const nextPage = () => {
    goToPage(validPage + 1);
  };

  const prevPage = () => {
    goToPage(validPage - 1);
  };

  const handleSetPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return {
    currentPage: validPage,
    pageSize: pageSizeState,
    totalPages: Math.max(1, totalPages),
    totalItems,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize,
  };
}

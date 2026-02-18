"use client";

import type { UsePaginationResult } from "@/hooks/use-pagination";
import { Pagination } from "./Pagination";

export interface PaginationBarProps {
  /** Return value of usePagination or usePaginationWithUrl. */
  pagination: UsePaginationResult;
  /** Label for the items (e.g. "constituencies", "results"). Used in "Showing 1–9 of 45 constituencies". */
  itemLabel?: string;
  /** Aria label for the pagination nav. */
  ariaLabel?: string;
  /** Show page size selector when pagination.pageSizeOptions is set. */
  showPageSizeSelector?: boolean;
  /** Optional class for the wrapper. */
  className?: string;
}

/**
 * Combines range summary ("Showing X–Y of Z"), optional page size selector,
 * and pagination controls. Reusable for any paginated list.
 */
export function PaginationBar({
  pagination,
  itemLabel = "items",
  ariaLabel = "Results pagination",
  showPageSizeSelector = true,
  className = "",
}: PaginationBarProps) {
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    rangeLabel,
    pageSize,
    setPageSize,
    pageSizeOptions,
  } = pagination;

  const hasPageSizeOptions = pageSizeOptions && pageSizeOptions.length > 1;

  if (totalPages <= 1 && !hasPageSizeOptions) return null;

  const summary = totalItems > 0
    ? `Showing ${rangeLabel} of ${totalItems.toLocaleString()} ${itemLabel}`
    : null;

  return (
    <div
      className={`flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="region"
      aria-label="Pagination"
    >
      <div className="flex flex-wrap items-center gap-3">
        {summary && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {summary}
          </p>
        )}
        {showPageSizeSelector && hasPageSizeOptions && (
          <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Per page</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Items per page"
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-500"
            >
              {pageSizeOptions!.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        ariaLabel={ariaLabel}
        className="w-full sm:w-auto"
      />
    </div>
  );
}

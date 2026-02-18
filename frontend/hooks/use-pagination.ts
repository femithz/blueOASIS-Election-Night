"use client";

import { useCallback, useMemo, useState } from "react";

export interface UsePaginationOptions {
  /** Items per page. Default 10. */
  pageSize?: number;
  /** Initial 1-based page. Default 1. */
  initialPage?: number;
  /** Allowed page sizes for selector (e.g. [9, 18, 36]). If provided, pageSize is constrained to one of these. */
  pageSizeOptions?: readonly number[];
}

export interface UsePaginationResult {
  /** 1-based current page */
  page: number;
  setPage: (page: number) => void;
  /** Current page size */
  pageSize: number;
  setPageSize: (size: number) => void;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items (as passed in) */
  totalItems: number;
  /** 0-based start index for the current page (for slicing) */
  startIndex: number;
  /** 0-based end index (exclusive) for the current page */
  endIndex: number;
  /** Slice an array to the current page. Returns a new array. */
  slice: <T>(items: T[]) => T[];
  /** Human-readable range, e.g. "1–9" or "10–18" */
  rangeLabel: string;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Whether there is a next page */
  hasNextPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  /** Resets to page 1. Call when data source changes (e.g. after filter). */
  resetToFirstPage: () => void;
  /** Allowed page sizes if provided in options; otherwise undefined. */
  pageSizeOptions: readonly number[] | undefined;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_INITIAL_PAGE = 1;

/**
 * Reusable client-side pagination state and helpers.
 * Keeps page in bounds when totalItems or pageSize changes.
 */
export function usePagination(
  totalItems: number,
  options: UsePaginationOptions = {}
): UsePaginationResult {
  const {
    pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
    initialPage = DEFAULT_INITIAL_PAGE,
    pageSizeOptions,
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(() => {
    if (pageSizeOptions?.length) {
      const valid = pageSizeOptions.includes(initialPageSize);
      return valid ? initialPageSize : pageSizeOptions[0] ?? initialPageSize;
    }
    return initialPageSize;
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );
  const currentPage = useMemo(
    () => Math.min(Math.max(1, page), totalPages),
    [page, totalPages]
  );

  const setPage = useCallback(
    (p: number) => setPageState(Math.max(1, p)),
    []
  );

  const setPageSize = useCallback(
    (size: number) => {
      const next = pageSizeOptions?.length
        ? (pageSizeOptions as number[]).includes(size)
          ? size
          : pageSizeOptions[0]
        : size;
      setPageSizeState(next);
      setPageState(1);
    },
    [pageSizeOptions]
  );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const slice = useCallback(
    <T>(items: T[]): T[] => items.slice(startIndex, endIndex),
    [startIndex, endIndex]
  );

  const rangeLabel =
    totalItems === 0
      ? "0–0"
      : `${startIndex + 1}–${endIndex}`;

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const goToNextPage = useCallback(
    () => setPageState((p) => p + 1),
    []
  );
  const goToPreviousPage = useCallback(
    () => setPageState((p) => Math.max(p - 1, 1)),
    []
  );
  const goToFirstPage = useCallback(() => setPageState(1), []);
  const goToLastPage = useCallback(() => setPageState(totalPages), [totalPages]);
  const resetToFirstPage = useCallback(() => setPageState(1), []);

  return {
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    slice,
    rangeLabel,
    hasPreviousPage,
    hasNextPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    resetToFirstPage,
    pageSizeOptions: pageSizeOptions ?? undefined,
  };
}

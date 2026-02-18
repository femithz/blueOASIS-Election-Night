"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  usePagination,
  type UsePaginationOptions,
  type UsePaginationResult,
} from "./use-pagination";

export const PAGINATION_PARAMS = {
  page: "page",
  pageSize: "pageSize",
} as const;

export interface UsePaginationWithUrlOptions extends UsePaginationOptions {
  /** Query param keys. Override if you have multiple paginated lists on one page. */
  paramKeys?: { page: string; pageSize: string };
}

/**
 * usePagination synced with URL search params (Next.js App Router).
 * Gives shareable/bookmarkable URLs (e.g. ?page=2&pageSize=18).
 */
export function usePaginationWithUrl(
  totalItems: number,
  options: UsePaginationWithUrlOptions = {}
): UsePaginationResult {
  const { paramKeys = PAGINATION_PARAMS, ...rest } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = useMemo(() => {
    const p = searchParams.get(paramKeys.page);
    const n = parseInt(p ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams, paramKeys.page]);

  const pageSizeFromUrl = useMemo(() => {
    const p = searchParams.get(paramKeys.pageSize);
    if (!p) return rest.pageSize ?? 10;
    const n = parseInt(p, 10);
    if (!Number.isFinite(n) || n < 1) return rest.pageSize ?? 10;
    if (rest.pageSizeOptions?.length && !rest.pageSizeOptions.includes(n)) {
      return rest.pageSize ?? (rest.pageSizeOptions[0] as number) ?? 10;
    }
    return n;
  }, [searchParams, paramKeys.pageSize, rest.pageSize, rest.pageSizeOptions]);

  const pagination = usePagination(totalItems, {
    ...rest,
    initialPage: pageFromUrl,
    pageSize: pageSizeFromUrl,
  });

  const setPageWithUrl = (page: number) => {
    const next = Math.max(1, Math.min(page, pagination.totalPages));
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKeys.page, String(next));
    if (rest.pageSizeOptions?.length) {
      params.set(paramKeys.pageSize, String(pagination.pageSize));
    }
    router.replace(`?${params.toString()}`, { scroll: false });
    pagination.setPage(next);
  };

  const setPageSizeWithUrl = (size: number) => {
    const next = rest.pageSizeOptions?.length
      ? (rest.pageSizeOptions as number[]).includes(size)
        ? size
        : (rest.pageSizeOptions[0] as number)
      : size;
    pagination.setPageSize(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKeys.page, "1");
    params.set(paramKeys.pageSize, String(next));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Sync state from URL when user navigates (e.g. browser back/forward).
  useEffect(() => {
    if (pageFromUrl !== pagination.page) pagination.setPage(pageFromUrl);
  }, [pageFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps -- only sync when URL-derived page changes

  return {
    ...pagination,
    setPage: setPageWithUrl,
    setPageSize: setPageSizeWithUrl,
  };
}

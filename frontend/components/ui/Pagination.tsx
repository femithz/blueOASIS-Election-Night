"use client";

export interface PaginationProps {
  /** 1-based current page */
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Optional aria label for the nav. Default "Pagination". */
  ariaLabel?: string;
  /** Optional class name for the root nav. */
  className?: string;
}

function range(start: number, end: number): number[] {
  const r: number[] = [];
  for (let i = start; i <= end; i++) r.push(i);
  return r;
}

/** Page numbers to show: first, ellipsis, window around current, ellipsis, last. */
function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 6) return range(1, totalPages);

  const windowSize = 2;
  const start = Math.max(2, currentPage - windowSize);
  const end = Math.min(totalPages - 1, currentPage + windowSize);

  const pages: (number | "ellipsis")[] = [1];
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }
  if (end < totalPages - 1) pages.push("ellipsis");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

/**
 * Presentational pagination controls: Previous, page numbers, Next.
 * Use with usePagination or usePaginationWithUrl for state.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = "Pagination",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
      className={`flex w-full items-center justify-between gap-2 py-2 sm:justify-end sm:gap-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="order-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Previous
      </button>
      <div className="order-2 flex flex-1 items-center justify-center gap-0.5 sm:flex-initial" role="list">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1 text-sm text-zinc-500 dark:text-zinc-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
              className={`min-w-[2.25rem] rounded-lg px-2 py-2 text-sm font-medium transition ${
                p === currentPage
                  ? "border border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-100"
                  : "border border-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="order-3 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Next
      </button>
    </nav>
  );
}

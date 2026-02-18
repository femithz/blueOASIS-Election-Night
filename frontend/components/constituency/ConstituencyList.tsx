"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { ConstituencyCard } from "./ConstituencyCard";
import { useConstituencies } from "@/hooks/use-constituencies";
import { usePaginationWithUrl } from "@/hooks/use-pagination-with-url";
import { ELECTION_RESULTS_UPDATED } from "@/components/upload/FileUpload";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export interface ConstituencyListProps {
  baseHref?: string;
  onLoad?: () => void;
}

export function ConstituencyList({
  baseHref = "/constituency",
  onLoad,
}: ConstituencyListProps) {
  const { state, fetchConstituencies } = useConstituencies();

  useEffect(() => {
    fetchConstituencies();
  }, [fetchConstituencies]);

  useEffect(() => {
    const refetch = () => fetchConstituencies();
    window.addEventListener(ELECTION_RESULTS_UPDATED, refetch);
    return () => window.removeEventListener(ELECTION_RESULTS_UPDATED, refetch);
  }, [fetchConstituencies]);

  useEffect(() => {
    if (state.status === "success") onLoad?.();
  }, [state.status, onLoad]);

  const totalItems = state.status === "success" ? state.data.length : 0;
  const pagination = usePaginationWithUrl(totalItems, {
    pageSize: DEFAULT_PAGE_SIZE,
    pageSizeOptions: [...PAGE_SIZE_OPTIONS],
  });

  if (state.status === "idle" || state.status === "loading") {
    return (
      <ul className="grid list-none grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 [&>li]:min-h-28">
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i} className="flex">
            <Skeleton className="min-h-28 w-full rounded-xl" />
          </li>
        ))}
      </ul>
    );
  }

  if (state.status === "error") {
    return (
      <ErrorMessage
        message={state.error.message}
        onRetry={fetchConstituencies}
      />
    );
  }

  const list = state.data;
  if (list.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-(--border) bg-(--card)/50 py-10 text-center text-(--muted)">
        No constituencies yet. Upload a result file to get started.
      </p>
    );
  }

  const paginatedList = pagination.slice(list);

  return (
    <div className="w-full space-y-4">
      <ul className="grid w-full list-none grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 [&>li]:min-h-28">
        {paginatedList.map((c) => (
          <li key={c.id} className="flex">
            <ConstituencyCard
              constituency={c}
              href={`${baseHref}/${encodeURIComponent(c.id)}`}
            />
          </li>
        ))}
      </ul>
      <PaginationBar
        pagination={pagination}
        itemLabel="constituencies"
        ariaLabel="Constituency results pages"
      />
    </div>
  );
}

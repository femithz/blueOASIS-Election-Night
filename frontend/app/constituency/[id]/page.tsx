"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ConstituencyDetail } from "@/components/constituency/ConstituencyDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useConstituency } from "@/hooks/use-constituency";

export default function ConstituencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, fetchById, reset } = useConstituency();

  useEffect(() => {
    fetchById(id);
    return () => reset();
  }, [id, fetchById, reset]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <AppShell title="Election Night">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to results
        </Link>
        <Skeleton lines={8} />
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell title="Election Night">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to results
        </Link>
        <ErrorMessage
          message={state.error.message}
          onRetry={() => fetchById(id)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Election Night">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to results
      </Link>
      <ConstituencyDetail constituency={state.data} />
    </AppShell>
  );
}

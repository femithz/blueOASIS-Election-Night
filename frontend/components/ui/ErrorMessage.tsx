"use client";

import type { ReactNode } from "react";

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  action,
}: ErrorMessageProps) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30"
      role="alert"
    >
      <p className="font-medium text-red-800 dark:text-red-200">{title}</p>
      <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>
      {(onRetry || action) && (
        <div className="mt-3 flex items-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:ring-offset-zinc-900"
            >
              Try again
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

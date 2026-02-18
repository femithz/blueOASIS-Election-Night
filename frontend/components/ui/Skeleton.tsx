import { forwardRef, type HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ lines = 1, className = "", ...props }, ref) => {
    if (lines <= 1) {
      return (
        <div
          ref={ref}
          className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-700 ${className}`}
          {...props}
        />
      );
    }
    return (
      <div ref={ref} className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"
          />
        ))}
      </div>
    );
  },
);

Skeleton.displayName = "Skeleton";

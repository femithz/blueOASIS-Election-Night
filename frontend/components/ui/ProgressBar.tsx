"use client";

import { forwardRef, type HTMLAttributes } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  barClassName?: string;
  showLabel?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      barClassName = "bg-zinc-300 dark:bg-zinc-600",
      showLabel = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
    return (
      <div ref={ref} className={`overflow-hidden rounded-full ${className}`} {...props}>
        <div
          className={`h-2 rounded-full transition-[width] duration-300 ${barClassName}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
        {showLabel && (
          <span className="sr-only">
            {value} of {max} ({pct.toFixed(0)}%)
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

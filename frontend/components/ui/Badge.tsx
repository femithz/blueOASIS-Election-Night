import { forwardRef, type HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "muted";
  colorClass?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = "default", colorClass, className = "", children, ...props },
    ref,
  ) => {
    const base =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    const variants = {
      default:
        colorClass ??
        "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
      muted: "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    };
    return (
      <span
        ref={ref}
        className={`${base} ${colorClass ?? variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";

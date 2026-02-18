import { forwardRef, type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ as: Component = "div", className = "", ...props }, ref) => (
    <Component
      ref={ref}
      className={`rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
      {...props}
    />
  )
);

Card.displayName = "Card";

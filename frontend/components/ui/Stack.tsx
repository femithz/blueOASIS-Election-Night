import { type ReactNode } from "react";

export interface StackProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
  as?: "div" | "section" | "ol" | "ul";
}

const gapClass = { sm: "gap-2", md: "gap-4", lg: "gap-6" };

export function Stack({
  children,
  gap = "md",
  className = "",
  as: Component = "div",
}: StackProps) {
  return (
    <Component className={`flex flex-col ${gapClass[gap]} ${className}`}>
      {children}
    </Component>
  );
}

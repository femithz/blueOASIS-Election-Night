import type { ReactNode } from "react";

export interface PageSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function PageSection({
  title,
  children,
  className = "",
  id,
}: PageSectionProps) {
  return (
    <section id={id} className={className} aria-labelledby={id ? `${id}-heading` : undefined}>
      {id ? (
        <h2 id={`${id}-heading`} className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      ) : (
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

"use client";

import type { ReactNode } from "react";

export type ViewTabId = "constituencies" | "parliament";

export interface ViewTabsProps {
  active: ViewTabId;
  onSelect: (id: ViewTabId) => void;
  constituenciesContent: ReactNode;
  parliamentContent: ReactNode;
}

const TABS: { id: ViewTabId; label: string }[] = [
  { id: "constituencies", label: "Constituencies" },
  { id: "parliament", label: "Parliament" },
];

export function ViewTabs({
  active,
  onSelect,
  constituenciesContent,
  parliamentContent,
}: ViewTabsProps) {
  return (
    <div className="space-y-4">
      <nav
        role="tablist"
        aria-label="Result views"
        className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            aria-controls={`panel-${id}`}
            id={`tab-${id}`}
            onClick={() => onSelect(id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
              active === id
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div
        id="panel-constituencies"
        role="tabpanel"
        aria-labelledby="tab-constituencies"
        hidden={active !== "constituencies"}
        className="focus:outline-none"
      >
        {constituenciesContent}
      </div>
      <div
        id="panel-parliament"
        role="tabpanel"
        aria-labelledby="tab-parliament"
        hidden={active !== "parliament"}
        className="focus:outline-none"
      >
        {parliamentContent}
      </div>
    </div>
  );
}

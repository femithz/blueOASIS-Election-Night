import type { ReactNode } from "react";
import Image from "next/image";
import { ThemeSwitcher } from "./ThemeSwitcher";

export interface AppShellProps {
  children: ReactNode;
  title?: string;
}

export function AppShell({
  children,
  title = "Election Night",
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="Blue Oasis"
              width={160}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>
          </div>
          <ThemeSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-full px-4 py-6">{children}</main>
    </div>
  );
}

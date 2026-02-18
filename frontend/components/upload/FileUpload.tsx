"use client";

import { useCallback, useRef, useState } from "react";
import { api, type ImportResult } from "@/lib/api";
import { Card } from "@/components/ui/Card";

export const ELECTION_RESULTS_UPDATED = "election-results-updated";

export function FileUpload() {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setStatus("uploading");
      setMessage("");
      setResult(null);
      try {
        const data = await api.uploadResultFile(file);
        setResult(data);
        setStatus("success");
        setMessage(
          data.errors.length > 0
            ? `Imported ${data.imported} constituency results. ${data.errors.length} line(s) had errors.`
            : `Imported ${data.imported} constituency result(s).`,
        );
        window.dispatchEvent(new CustomEvent(ELECTION_RESULTS_UPDATED));
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [],
  );

  const triggerInput = useCallback(() => inputRef.current?.click(), []);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.csv,text/plain,text/csv,application/octet-stream"
          onChange={handleUpload}
          className="hidden"
          aria-label="Choose result file"
        />
        <button
          type="button"
          onClick={triggerInput}
          disabled={status === "uploading"}
          className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {status === "uploading" && (
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden
            />
          )}
          {status === "uploading" ? "Importing…" : "Upload result file"}
        </button>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Accepts .txt or .csv (one constituency per line)
        </span>
      </div>
      {status === "success" && message && (
        <p
          className="mt-3 text-sm text-green-700 dark:text-green-400"
          role="status"
        >
          {message}
        </p>
      )}
      {status === "error" && message && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {message}
        </p>
      )}
      {result && result.errors.length > 0 && (
        <details className="mt-2" open>
          <summary className="cursor-pointer text-sm font-medium text-amber-700 dark:text-amber-400">
            Parse errors ({result.errors.length} line{result.errors.length === 1 ? "" : "s"})
          </summary>
          <ul className="mt-1 max-h-40 list-inside list-disc overflow-y-auto text-xs text-zinc-600 dark:text-zinc-400">
            {result.errors.slice(0, 15).map((e, i) => (
              <li key={i}>
                Line {e.lineNumber}: {e.message}
              </li>
            ))}
            {result.errors.length > 15 && (
              <li>… and {result.errors.length - 15} more</li>
            )}
          </ul>
        </details>
      )}
    </Card>
  );
}

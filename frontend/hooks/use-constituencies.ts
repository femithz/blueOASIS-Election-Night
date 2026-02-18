"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Constituency } from "@/types/election";

export type ConstituenciesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Constituency[] }
  | { status: "error"; error: Error };

const POLL_INTERVAL_MS = 60_000; // 1 minute

export function useConstituencies(options?: { pollIntervalMs?: number }) {
  const [state, setState] = useState<ConstituenciesState>({ status: "idle" });
  const intervalMs = options?.pollIntervalMs ?? POLL_INTERVAL_MS;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConstituencies = useCallback(async () => {
    setState((prev) => (prev.status === "idle" ? { status: "loading" } : prev));
    try {
      const data = await api.getConstituencies();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, []);

  // Background polling when we have data (near-real-time updates)
  useEffect(() => {
    if (state.status !== "success" || intervalMs <= 0) return;
    intervalRef.current = setInterval(async () => {
      try {
        const data = await api.getConstituencies();
        setState({ status: "success", data });
      } catch {
        // Keep previous data on poll failure
      }
    }, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [state.status, intervalMs]);

  return { state, fetchConstituencies };
}

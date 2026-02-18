"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { Constituency } from "@/types/election";

export type ConstituencyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Constituency }
  | { status: "error"; error: Error };

export function useConstituency() {
  const [state, setState] = useState<ConstituencyState>({ status: "idle" });

  const fetchById = useCallback(async (id: string) => {
    setState({ status: "loading" });
    try {
      const data = await api.getConstituencyById(id);
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, []);

  const fetchByName = useCallback(async (name: string) => {
    setState({ status: "loading" });
    try {
      const data = await api.getConstituencyByName(name);
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, fetchById, fetchByName, reset };
}

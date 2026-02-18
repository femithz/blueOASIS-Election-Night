import type { Constituency, Totals } from "@/types/election";

const DEFAULT_API_URL = "http://localhost:3001";

const getBaseUrl = () => {
  const env = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (env) return env;
  return DEFAULT_API_URL;
};

async function fetchApi<T>(path: string): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ImportResult {
  imported: number;
  errors: Array<{ lineNumber: number; line: string; message: string }>;
}

async function uploadResultFile(file: File): Promise<ImportResult> {
  const base = getBaseUrl();
  const url = `${base.replace(/\/$/, "")}/api/import`;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<ImportResult>;
}

export const api = {
  getConstituencies: () => fetchApi<Constituency[]>("api/constituencies"),
  getConstituencyById: (id: string) =>
    fetchApi<Constituency>(`api/constituencies/${encodeURIComponent(id)}`),
  getConstituencyByName: (name: string) =>
    fetchApi<Constituency>(
      `api/constituencies/by-name/${encodeURIComponent(name)}`,
    ),
  getTotals: () => fetchApi<Totals>("api/totals"),
  uploadResultFile,
};

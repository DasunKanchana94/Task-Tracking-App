import type { DayTemplateDto } from "@/features/day-templates/lib/serialize";

export class DayTemplatesApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new DayTemplatesApiError(
      body?.error?.message ?? "Request failed",
      body?.error?.code ?? "UNKNOWN_ERROR",
      res.status,
    );
  }

  return body as T;
}

export const dayTemplatesApi = {
  list: () => request<{ items: DayTemplateDto[] }>("/api/day-templates"),
  create: (payload: { name: string; date: string }) =>
    request<{ template: DayTemplateDto }>("/api/day-templates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) => request<void>(`/api/day-templates/${id}`, { method: "DELETE" }),
  apply: (id: string, date: string) =>
    request<{ blocksCreated: number; tasksCreated: number; skipped: number }>(
      `/api/day-templates/${id}/apply`,
      { method: "POST", body: JSON.stringify({ date }) },
    ),
};

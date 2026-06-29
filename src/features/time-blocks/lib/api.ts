import type { TimeBlockDto } from "@/features/time-blocks/lib/serialize";

export class TimeBlocksApiError extends Error {
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
    throw new TimeBlocksApiError(
      body?.error?.message ?? "Request failed",
      body?.error?.code ?? "UNKNOWN_ERROR",
      res.status,
    );
  }

  return body as T;
}

export type CreateTimeBlockPayload = {
  taskId?: string | null;
  title?: string | null;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  color?: string | null;
};

export type UpdateTimeBlockPayload = Partial<CreateTimeBlockPayload> & {
  updatedAt: string;
};

export const timeBlocksApi = {
  list: (range: { from: string; to: string }) => {
    const search = new URLSearchParams({ from: range.from, to: range.to });
    return request<{ items: TimeBlockDto[] }>(`/api/time-blocks?${search.toString()}`);
  },
  create: (payload: CreateTimeBlockPayload) =>
    request<{ timeBlock: TimeBlockDto }>("/api/time-blocks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: UpdateTimeBlockPayload) =>
    request<{ timeBlock: TimeBlockDto }>(`/api/time-blocks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) => request<void>(`/api/time-blocks/${id}`, { method: "DELETE" }),
};

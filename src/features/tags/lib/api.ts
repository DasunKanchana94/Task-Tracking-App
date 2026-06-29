import type { TagDto } from "@/features/tags/lib/serialize";

class TagsApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

export { TagsApiError };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new TagsApiError(
      body?.error?.message ?? "Request failed",
      body?.error?.code ?? "UNKNOWN_ERROR",
      res.status,
    );
  }

  return body as T;
}

export type TagPayload = { name: string; color?: string | null; emoji?: string | null };

export const tagsApi = {
  list: () => request<{ items: TagDto[] }>("/api/tags"),
  create: (payload: TagPayload) =>
    request<{ tag: TagDto }>("/api/tags", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<TagPayload>) =>
    request<{ tag: TagDto }>(`/api/tags/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/api/tags/${id}`, { method: "DELETE" }),
};

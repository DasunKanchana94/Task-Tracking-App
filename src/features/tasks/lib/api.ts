import type { TaskDto } from "@/features/tasks/lib/serialize";

export class ApiError extends Error {
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
    throw new ApiError(
      body?.error?.message ?? "Request failed",
      body?.error?.code ?? "UNKNOWN_ERROR",
      res.status,
    );
  }

  return body as T;
}

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: string | null;
  dueTime?: string | null;
  estimatedMinutes?: number | null;
  emoji?: string | null;
  parentTaskId?: string | null;
  tagIds?: string[];
};

export type UpdateTaskPayload = Partial<
  Omit<CreateTaskPayload, "parentTaskId">
> & {
  status?: TaskDto["status"];
  starred?: boolean;
  actualMinutes?: number;
  updatedAt: string;
};

export const tasksApi = {
  list: (params?: { status?: string; starred?: boolean; q?: string; includeSubtasks?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.starred !== undefined) search.set("starred", String(params.starred));
    if (params?.q) search.set("q", params.q);
    if (params?.includeSubtasks) search.set("includeSubtasks", "true");
    const qs = search.toString();
    return request<{ items: TaskDto[] }>(`/api/tasks${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => request<{ task: TaskDto; subtasks: TaskDto[] }>(`/api/tasks/${id}`),
  create: (payload: CreateTaskPayload) =>
    request<{ task: TaskDto }>("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateTaskPayload) =>
    request<{ task: TaskDto }>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  complete: (id: string) => request<{ task: TaskDto }>(`/api/tasks/${id}/complete`, { method: "POST" }),
  uncomplete: (id: string) => request<{ task: TaskDto }>(`/api/tasks/${id}/uncomplete`, { method: "POST" }),
};

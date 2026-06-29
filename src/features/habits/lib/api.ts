import type { HabitDto } from "@/features/habits/lib/serialize";

export class HabitsApiError extends Error {
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
    throw new HabitsApiError(
      body?.error?.message ?? "Request failed",
      body?.error?.code ?? "UNKNOWN_ERROR",
      res.status,
    );
  }

  return body as T;
}

export type CreateHabitPayload = {
  name: string;
  emoji?: string | null;
  color?: string | null;
  frequency?: HabitDto["frequency"];
  targetDaysPerWeek?: number | null;
};

export type UpdateHabitPayload = Partial<CreateHabitPayload> & { archived?: boolean };

export const habitsApi = {
  list: () => request<{ items: HabitDto[] }>("/api/habits"),
  create: (payload: CreateHabitPayload) =>
    request<{ habit: HabitDto }>("/api/habits", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateHabitPayload) =>
    request<{ habit: HabitDto }>(`/api/habits/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/api/habits/${id}`, { method: "DELETE" }),
  checkIn: (id: string, date: string, note?: string | null) =>
    request<{ habit: HabitDto }>(`/api/habits/${id}/logs`, {
      method: "POST",
      body: JSON.stringify({ date, note }),
    }),
  uncheckIn: (id: string, date: string) =>
    request<{ habit: HabitDto }>(`/api/habits/${id}/logs?date=${date}`, { method: "DELETE" }),
};

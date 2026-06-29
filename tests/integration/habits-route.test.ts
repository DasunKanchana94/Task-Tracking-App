import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const habitFindManyMock = vi.fn();
const habitFindFirstMock = vi.fn();
const habitFindFirstOrThrowMock = vi.fn();
const habitCreateMock = vi.fn();
const habitUpdateMock = vi.fn();
const habitDeleteMock = vi.fn();
const habitLogUpsertMock = vi.fn();
const habitLogDeleteManyMock = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    habit: {
      findMany: habitFindManyMock,
      findFirst: habitFindFirstMock,
      findFirstOrThrow: habitFindFirstOrThrowMock,
      create: habitCreateMock,
      update: habitUpdateMock,
      delete: habitDeleteMock,
    },
    habitLog: {
      upsert: habitLogUpsertMock,
      deleteMany: habitLogDeleteManyMock,
    },
  },
}));

const baseHabit = {
  id: "habit-1",
  userId: "user-1",
  name: "Drink water",
  emoji: null,
  color: null,
  frequency: "daily" as const,
  targetDaysPerWeek: null,
  archivedAt: null,
  logs: [],
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
};

describe("/api/habits", () => {
  beforeEach(() => {
    authMock.mockReset();
    habitFindManyMock.mockReset();
    habitCreateMock.mockReset();
    habitFindFirstMock.mockReset();
    habitUpdateMock.mockReset();
    habitDeleteMock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/habits/route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("creates a habit", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    habitCreateMock.mockResolvedValueOnce(baseHabit);

    const { POST } = await import("@/app/api/habits/route");
    const request = new Request("http://localhost/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Drink water", frequency: "daily" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.habit.name).toBe("Drink water");
    expect(body.habit.currentStreak).toBe(0);
  });

  it("rejects an empty name", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/habits/route");
    const request = new Request("http://localhost/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(habitCreateMock).not.toHaveBeenCalled();
  });
});

describe("/api/habits/[id]/logs", () => {
  beforeEach(() => {
    authMock.mockReset();
    habitFindFirstMock.mockReset();
    habitFindFirstOrThrowMock.mockReset();
    habitLogUpsertMock.mockReset();
    habitLogDeleteManyMock.mockReset();
  });

  it("creates a check-in and reflects a 1-day streak", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    habitFindFirstMock.mockResolvedValueOnce(baseHabit);
    habitLogUpsertMock.mockResolvedValueOnce({});
    habitFindFirstOrThrowMock.mockResolvedValueOnce({
      ...baseHabit,
      logs: [{ id: "log-1", habitId: "habit-1", date: new Date("2026-06-29T00:00:00.000Z"), note: null, createdAt: new Date() }],
    });

    const { POST } = await import("@/app/api/habits/[id]/logs/route");
    const request = new Request("http://localhost/api/habits/habit-1/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: "2026-06-29" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "habit-1" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.habit.loggedDates).toContain("2026-06-29");
    expect(body.habit.currentStreak).toBe(1);
  });

  it("removes a check-in", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    habitFindFirstMock.mockResolvedValueOnce(baseHabit);
    habitLogDeleteManyMock.mockResolvedValueOnce({ count: 1 });
    habitFindFirstOrThrowMock.mockResolvedValueOnce(baseHabit);

    const { DELETE } = await import("@/app/api/habits/[id]/logs/route");
    const request = new Request("http://localhost/api/habits/habit-1/logs?date=2026-06-29", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "habit-1" }) });
    expect(response.status).toBe(200);
    expect(habitLogDeleteManyMock).toHaveBeenCalledOnce();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const recurrenceFindManyMock = vi.fn();
const recurrenceCreateMock = vi.fn();
const recurrenceFindFirstMock = vi.fn();
const recurrenceUpdateMock = vi.fn();
const recurrenceDeleteMock = vi.fn();
const exceptionFindManyMock = vi.fn();
const exceptionFindUniqueMock = vi.fn();
const exceptionCreateMock = vi.fn();
const taskFindManyMock = vi.fn();
const taskCreateMock = vi.fn();
const taskDeleteManyMock = vi.fn();
const transactionMock = vi.fn(async (promises: Promise<unknown>[]) => Promise.all(promises));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    recurrence: {
      findMany: recurrenceFindManyMock,
      create: recurrenceCreateMock,
      findFirst: recurrenceFindFirstMock,
      update: recurrenceUpdateMock,
      delete: recurrenceDeleteMock,
    },
    recurrenceException: {
      findMany: exceptionFindManyMock,
      findUnique: exceptionFindUniqueMock,
      create: exceptionCreateMock,
    },
    task: {
      findMany: taskFindManyMock,
      create: taskCreateMock,
      deleteMany: taskDeleteManyMock,
    },
    $transaction: transactionMock,
  },
}));

const baseRecurrence = {
  id: "rec-1",
  userId: "user-1",
  rrule: "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR",
  startDate: new Date("2026-06-29T00:00:00.000Z"),
  endDate: null,
  endCount: null,
  timezone: "UTC",
  taskTemplate: { title: "Standup", priority: 1, estimatedMinutes: 15, emoji: null },
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
};

describe("/api/recurrences", () => {
  beforeEach(() => {
    authMock.mockReset();
    recurrenceFindManyMock.mockReset();
    recurrenceCreateMock.mockReset();
    recurrenceFindFirstMock.mockReset();
    recurrenceUpdateMock.mockReset();
    recurrenceDeleteMock.mockReset();
    exceptionFindManyMock.mockReset().mockResolvedValue([]);
    exceptionFindUniqueMock.mockReset();
    exceptionCreateMock.mockReset();
    taskFindManyMock.mockReset().mockResolvedValue([]);
    taskCreateMock.mockReset().mockImplementation(({ data }) => Promise.resolve({ id: "task-1", ...data }));
    taskDeleteManyMock.mockReset();
    transactionMock.mockClear();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/recurrences/route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("creates a recurrence and materializes upcoming instances", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    recurrenceCreateMock.mockResolvedValueOnce(baseRecurrence);

    const { POST } = await import("@/app/api/recurrences/route");
    const request = new Request("http://localhost/api/recurrences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rrule: "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR",
        startDate: "2026-06-29",
        taskTemplate: { title: "Standup", priority: 1, estimatedMinutes: 15 },
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.recurrence.rrule).toBe("FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR");
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(taskCreateMock.mock.calls.length).toBeGreaterThan(0);
  });

  it("rejects an invalid RRULE string", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/recurrences/route");
    const request = new Request("http://localhost/api/recurrences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rrule: "NOT-A-VALID-RRULE",
        startDate: "2026-06-29",
        taskTemplate: { title: "Standup" },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(recurrenceCreateMock).not.toHaveBeenCalled();
  });
});

describe("/api/recurrences/[id]/exceptions", () => {
  beforeEach(() => {
    authMock.mockReset();
    recurrenceFindFirstMock.mockReset();
    exceptionFindUniqueMock.mockReset();
    exceptionCreateMock.mockReset();
    taskDeleteManyMock.mockReset();
    taskCreateMock.mockReset();
  });

  it("creates a skip exception and removes any materialized task for that date", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    recurrenceFindFirstMock.mockResolvedValueOnce(baseRecurrence);
    exceptionFindUniqueMock.mockResolvedValueOnce(null);
    exceptionCreateMock.mockResolvedValueOnce({
      id: "exc-1",
      recurrenceId: "rec-1",
      exceptionDate: new Date("2026-07-01T00:00:00.000Z"),
      action: "skip",
      modifiedTaskId: null,
    });

    const { POST } = await import("@/app/api/recurrences/[id]/exceptions/route");
    const request = new Request("http://localhost/api/recurrences/rec-1/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: "2026-07-01", action: "skip" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "rec-1" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.exception.action).toBe("skip");
    expect(taskDeleteManyMock).toHaveBeenCalledOnce();
  });
});

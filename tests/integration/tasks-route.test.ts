import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findManyMock = vi.fn();
const findFirstMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: findManyMock,
      findFirst: findFirstMock,
      create: createMock,
      update: updateMock,
    },
  },
}));

const baseTask = {
  id: "task-1",
  userId: "user-1",
  parentTaskId: null,
  title: "Write report",
  descriptionRich: null,
  status: "pending",
  priority: 0,
  dueDate: null,
  dueTime: null,
  estimatedMinutes: null,
  actualMinutes: 0,
  icon: null,
  emoji: null,
  sortOrder: 1,
  starred: false,
  completedAt: null,
  deletedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("/api/tasks", () => {
  beforeEach(() => {
    authMock.mockReset();
    findManyMock.mockReset();
    findFirstMock.mockReset();
    createMock.mockReset();
    updateMock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/tasks/route");

    const response = await GET(new Request("http://localhost/api/tasks"));
    expect(response.status).toBe(401);
  });

  it("lists tasks for the current user", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findManyMock.mockResolvedValueOnce([baseTask]);

    const { GET } = await import("@/app/api/tasks/route");
    const response = await GET(new Request("http://localhost/api/tasks"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toBe("Write report");
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "user-1" }) }),
    );
  });

  it("creates a task with a valid payload", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findFirstMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce(baseTask);

    const { POST } = await import("@/app/api/tasks/route");
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Write report" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.task.title).toBe("Write report");
  });

  it("rejects a task with an empty title", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/tasks/route");
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });
});

describe("/api/tasks/:id/complete", () => {
  beforeEach(() => {
    authMock.mockReset();
    findFirstMock.mockReset();
    updateMock.mockReset();
  });

  it("marks a task completed", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findFirstMock.mockResolvedValueOnce(baseTask);
    updateMock.mockResolvedValueOnce({ ...baseTask, status: "completed", completedAt: new Date() });

    const { POST } = await import("@/app/api/tasks/[id]/complete/route");
    const response = await POST(new Request("http://localhost/api/tasks/task-1/complete", { method: "POST" }), {
      params: Promise.resolve({ id: "task-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task.status).toBe("completed");
  });

  it("returns 404 for a task that does not belong to the user", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findFirstMock.mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/tasks/[id]/complete/route");
    const response = await POST(new Request("http://localhost/api/tasks/task-1/complete", { method: "POST" }), {
      params: Promise.resolve({ id: "task-1" }),
    });

    expect(response.status).toBe(404);
  });
});

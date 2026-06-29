import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const dayTemplateFindManyMock = vi.fn();
const dayTemplateFindFirstMock = vi.fn();
const dayTemplateCreateMock = vi.fn();
const dayTemplateDeleteMock = vi.fn();
const timeBlockFindManyMock = vi.fn();
const timeBlockCreateMock = vi.fn();
const taskCreateMock = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    dayTemplate: {
      findMany: dayTemplateFindManyMock,
      findFirst: dayTemplateFindFirstMock,
      create: dayTemplateCreateMock,
      delete: dayTemplateDeleteMock,
    },
    timeBlock: {
      findMany: timeBlockFindManyMock,
      create: timeBlockCreateMock,
    },
    task: {
      create: taskCreateMock,
    },
  },
}));

describe("/api/day-templates", () => {
  beforeEach(() => {
    authMock.mockReset();
    dayTemplateFindManyMock.mockReset();
    dayTemplateCreateMock.mockReset();
    timeBlockFindManyMock.mockReset();
    taskCreateMock.mockReset();
    timeBlockCreateMock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/day-templates/route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("snapshots a day's blocks into a new template", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    timeBlockFindManyMock.mockResolvedValueOnce([
      {
        title: "Standup",
        startAt: new Date("2026-06-29T09:00:00.000Z"),
        endAt: new Date("2026-06-29T09:15:00.000Z"),
        color: "#22c55e",
        task: null,
      },
    ]);
    dayTemplateCreateMock.mockImplementationOnce(({ data }) =>
      Promise.resolve({ id: "tpl-1", ...data, createdAt: new Date(), updatedAt: new Date() }),
    );

    const { POST } = await import("@/app/api/day-templates/route");
    const request = new Request("http://localhost/api/day-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Workday", date: "2026-06-29" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.template.name).toBe("Workday");
    expect(body.template.blocks).toEqual([
      { title: "Standup", taskTitle: null, startMinute: 540, endMinute: 555, color: "#22c55e" },
    ]);
  });

  it("rejects saving a template from a day with no blocks", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    timeBlockFindManyMock.mockResolvedValueOnce([]);

    const { POST } = await import("@/app/api/day-templates/route");
    const request = new Request("http://localhost/api/day-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Empty", date: "2026-06-29" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(dayTemplateCreateMock).not.toHaveBeenCalled();
  });
});

describe("/api/day-templates/[id]/apply", () => {
  beforeEach(() => {
    authMock.mockReset();
    dayTemplateFindFirstMock.mockReset();
    timeBlockFindManyMock.mockReset();
    timeBlockCreateMock.mockReset();
    taskCreateMock.mockReset();
  });

  it("applies a template to a target date, creating blocks and linked tasks", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    dayTemplateFindFirstMock.mockResolvedValueOnce({
      id: "tpl-1",
      userId: "user-1",
      blocks: [
        { title: "Gym", taskTitle: "Workout", startMinute: 420, endMinute: 480, color: null },
      ],
    });
    timeBlockFindManyMock.mockResolvedValueOnce([]);
    taskCreateMock.mockResolvedValueOnce({ id: "task-1" });
    timeBlockCreateMock.mockResolvedValueOnce({ id: "block-1" });

    const { POST } = await import("@/app/api/day-templates/[id]/apply/route");
    const request = new Request("http://localhost/api/day-templates/tpl-1/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: "2026-07-06" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "tpl-1" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ blocksCreated: 1, tasksCreated: 1, skipped: 0 });
    expect(taskCreateMock).toHaveBeenCalledOnce();
    expect(timeBlockCreateMock).toHaveBeenCalledOnce();
  });

  it("skips blocks that already exist on the target date instead of duplicating them", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    dayTemplateFindFirstMock.mockResolvedValueOnce({
      id: "tpl-1",
      userId: "user-1",
      blocks: [{ title: "Gym", taskTitle: null, startMinute: 420, endMinute: 480, color: null }],
    });
    timeBlockFindManyMock.mockResolvedValueOnce([
      {
        startAt: new Date("2026-07-06T07:00:00.000Z"),
        endAt: new Date("2026-07-06T08:00:00.000Z"),
        title: "Gym",
      },
    ]);

    const { POST } = await import("@/app/api/day-templates/[id]/apply/route");
    const request = new Request("http://localhost/api/day-templates/tpl-1/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: "2026-07-06" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "tpl-1" }) });
    const body = await response.json();

    expect(body).toEqual({ blocksCreated: 0, tasksCreated: 0, skipped: 1 });
    expect(timeBlockCreateMock).not.toHaveBeenCalled();
  });
});

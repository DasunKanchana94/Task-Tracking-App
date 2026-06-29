import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findManyMock = vi.fn();
const findFirstMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    timeBlock: {
      findMany: findManyMock,
      findFirst: findFirstMock,
      create: createMock,
    },
    task: {
      findFirst: findFirstMock,
    },
  },
}));

const baseBlock = {
  id: "block-1",
  userId: "user-1",
  taskId: null,
  title: "Deep work",
  startAt: new Date("2026-06-29T09:00:00Z"),
  endAt: new Date("2026-06-29T10:00:00Z"),
  allDay: false,
  color: null,
  source: "local",
  createdAt: new Date("2026-06-29T00:00:00Z"),
  updatedAt: new Date("2026-06-29T00:00:00Z"),
};

describe("/api/time-blocks", () => {
  beforeEach(() => {
    authMock.mockReset();
    findManyMock.mockReset();
    findFirstMock.mockReset();
    createMock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/time-blocks/route");

    const response = await GET(
      new Request("http://localhost/api/time-blocks?from=2026-06-29T00:00:00.000Z&to=2026-06-30T00:00:00.000Z"),
    );
    expect(response.status).toBe(401);
  });

  it("lists time blocks within a range", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findManyMock.mockResolvedValueOnce([baseBlock]);

    const { GET } = await import("@/app/api/time-blocks/route");
    const response = await GET(
      new Request("http://localhost/api/time-blocks?from=2026-06-29T00:00:00.000Z&to=2026-06-30T00:00:00.000Z"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toBe("Deep work");
  });

  it("rejects an invalid range", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });

    const { GET } = await import("@/app/api/time-blocks/route");
    const response = await GET(new Request("http://localhost/api/time-blocks?from=not-a-date&to=also-not-a-date"));
    expect(response.status).toBe(400);
  });

  it("creates a time block with a valid payload", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    createMock.mockResolvedValueOnce(baseBlock);

    const { POST } = await import("@/app/api/time-blocks/route");
    const request = new Request("http://localhost/api/time-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Deep work",
        startAt: "2026-06-29T09:00:00.000Z",
        endAt: "2026-06-29T10:00:00.000Z",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.timeBlock.title).toBe("Deep work");
  });

  it("rejects a block where endAt is before startAt", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/time-blocks/route");
    const request = new Request("http://localhost/api/time-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Deep work",
        startAt: "2026-06-29T10:00:00.000Z",
        endAt: "2026-06-29T09:00:00.000Z",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });
});

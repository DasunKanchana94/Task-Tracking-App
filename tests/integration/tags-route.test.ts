import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findManyMock = vi.fn();
const findUniqueMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tag: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
    },
  },
}));

const baseTag = {
  id: "tag-1",
  userId: "user-1",
  name: "Work",
  color: "#ff0000",
  emoji: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("/api/tags", () => {
  beforeEach(() => {
    authMock.mockReset();
    findManyMock.mockReset();
    findUniqueMock.mockReset();
    createMock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/tags/route");

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("lists tags for the current user", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findManyMock.mockResolvedValueOnce([baseTag]);

    const { GET } = await import("@/app/api/tags/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].name).toBe("Work");
  });

  it("creates a tag with a valid payload", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findUniqueMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce(baseTag);

    const { POST } = await import("@/app/api/tags/route");
    const request = new Request("http://localhost/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Work", color: "#ff0000" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.tag.name).toBe("Work");
  });

  it("rejects a tag with an invalid color", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/tags/route");
    const request = new Request("http://localhost/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Work", color: "not-a-color" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects a duplicate tag name", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findUniqueMock.mockResolvedValueOnce(baseTag);

    const { POST } = await import("@/app/api/tags/route");
    const request = new Request("http://localhost/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Work" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
    expect(createMock).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const findUniqueMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
      create: createMock,
    },
  },
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    createMock.mockReset();
  });

  it("creates a new user when the email is not taken", async () => {
    findUniqueMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({
      id: "user-1",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    const { POST } = await import("@/app/api/auth/register/route");

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "Password123",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.user.email).toBe("ada@example.com");
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("rejects an email that is already registered", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "existing-user" });

    const { POST } = await import("@/app/api/auth/register/route");

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "Password123",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("EMAIL_TAKEN");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload", async () => {
    const { POST } = await import("@/app/api/auth/register/route");

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/features/auth/lib/schemas";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "Password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password without an uppercase letter", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "not-an-email",
      password: "Password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "Pass1",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

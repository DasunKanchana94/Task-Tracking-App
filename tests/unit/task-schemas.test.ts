import { describe, expect, it } from "vitest";

import { createTaskSchema, updateTaskSchema } from "@/features/tasks/lib/schemas";

describe("createTaskSchema", () => {
  it("accepts a minimal valid task", () => {
    const result = createTaskSchema.safeParse({ title: "Write report" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createTaskSchema.safeParse({ title: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range priority", () => {
    const result = createTaskSchema.safeParse({ title: "Task", priority: 9 });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed dueTime", () => {
    const result = createTaskSchema.safeParse({ title: "Task", dueTime: "25:99" });
    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("requires updatedAt for optimistic concurrency", () => {
    const result = updateTaskSchema.safeParse({ title: "New title" });
    expect(result.success).toBe(false);
  });

  it("accepts a partial update with updatedAt", () => {
    const result = updateTaskSchema.safeParse({
      starred: true,
      updatedAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });
});

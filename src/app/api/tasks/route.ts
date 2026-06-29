import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, unauthorized } from "@/lib/api-errors";
import { createTaskSchema, listTasksQuerySchema } from "@/features/tasks/lib/schemas";
import { toDescriptionRich, toTaskDto } from "@/features/tasks/lib/serialize";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const url = new URL(request.url);
  const parsed = listTasksQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters", 400, parsed.error.flatten().fieldErrors);
  }

  const { status, starred, q, includeSubtasks } = parsed.data;
  const parentTaskId = parsed.data.parentTaskId ?? (includeSubtasks ? undefined : null);

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(starred !== undefined ? { starred } : {}),
      ...(parentTaskId !== undefined ? { parentTaskId } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      tags: { include: { tag: true } },
      subtasks: { where: { deletedAt: null } },
    },
  });

  return NextResponse.json({ items: tasks.map(toTaskDto) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid task data", 400, parsed.error.flatten().fieldErrors);
  }

  const { title, description, priority, dueDate, dueTime, estimatedMinutes, emoji, parentTaskId, tagIds } =
    parsed.data;

  if (parentTaskId) {
    const parent = await prisma.task.findFirst({
      where: { id: parentTaskId, userId: session.user.id, deletedAt: null },
      select: { id: true },
    });
    if (!parent) return apiError("PARENT_NOT_FOUND", "Parent task not found", 400);
  }

  if (tagIds?.length) {
    const ownedCount = await prisma.tag.count({
      where: { id: { in: tagIds }, userId: session.user.id },
    });
    if (ownedCount !== tagIds.length) return apiError("TAG_NOT_FOUND", "One or more tags not found", 400);
  }

  const last = await prisma.task.findFirst({
    where: { userId: session.user.id, parentTaskId: parentTaskId ?? null },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title,
      descriptionRich: toDescriptionRich(description ?? null) ?? undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime: dueTime ?? null,
      estimatedMinutes: estimatedMinutes ?? null,
      emoji: emoji ?? null,
      parentTaskId: parentTaskId ?? null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      ...(tagIds?.length ? { tags: { create: tagIds.map((tagId) => ({ tagId })) } } : {}),
    },
    include: { tags: { include: { tag: true } }, subtasks: true },
  });

  return NextResponse.json({ task: toTaskDto(task) }, { status: 201 });
}

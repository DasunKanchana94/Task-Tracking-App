import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { updateTaskSchema } from "@/features/tasks/lib/schemas";
import { toDescriptionRich, toTaskDto } from "@/features/tasks/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      tags: { include: { tag: true } },
      subtasks: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: { tags: { include: { tag: true } } },
      },
    },
  });
  if (!task) return notFound("Task not found");

  return NextResponse.json({
    task: toTaskDto(task),
    subtasks: task.subtasks.map(toTaskDto),
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid task data", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!existing) return notFound("Task not found");

  if (existing.updatedAt.toISOString() !== parsed.data.updatedAt) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "Task was modified elsewhere" }, latest: toTaskDto(existing) },
      { status: 409 },
    );
  }

  const { description, dueDate, status, tagIds, updatedAt: _updatedAt, ...rest } = parsed.data;

  if (tagIds?.length) {
    const ownedCount = await prisma.tag.count({
      where: { id: { in: tagIds }, userId: session.user.id },
    });
    if (ownedCount !== tagIds.length) return apiError("TAG_NOT_FOUND", "One or more tags not found", 400);
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      ...(description !== undefined ? { descriptionRich: toDescriptionRich(description) ?? undefined } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(status ? { status } : {}),
      ...(tagIds !== undefined
        ? { tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } }
        : {}),
    },
    include: { tags: { include: { tag: true } }, subtasks: { where: { deletedAt: null } } },
  });

  return NextResponse.json({ task: toTaskDto(task) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!existing) return notFound("Task not found");

  await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });

  return new NextResponse(null, { status: 204 });
}

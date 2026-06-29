import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { updateTimeBlockSchema } from "@/features/time-blocks/lib/schemas";
import { toTimeBlockDto } from "@/features/time-blocks/lib/serialize";

type Params = { params: Promise<{ id: string }> };

const taskSelect = { id: true, title: true, emoji: true, status: true } as const;

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateTimeBlockSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid time block data", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.timeBlock.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Time block not found");

  if (existing.updatedAt.toISOString() !== parsed.data.updatedAt) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "Time block was modified elsewhere" }, latest: toTimeBlockDto(existing) },
      { status: 409 },
    );
  }

  const { taskId, startAt, endAt, updatedAt: _updatedAt, ...rest } = parsed.data;

  if (taskId) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId: session.user.id, deletedAt: null } });
    if (!task) return apiError("TASK_NOT_FOUND", "Task not found", 400);
  }

  const block = await prisma.timeBlock.update({
    where: { id },
    data: {
      ...rest,
      ...(taskId !== undefined ? { taskId } : {}),
      ...(startAt ? { startAt: new Date(startAt) } : {}),
      ...(endAt ? { endAt: new Date(endAt) } : {}),
    },
    include: { task: { select: taskSelect } },
  });

  return NextResponse.json({ timeBlock: toTimeBlockDto(block) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const existing = await prisma.timeBlock.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Time block not found");

  await prisma.timeBlock.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}

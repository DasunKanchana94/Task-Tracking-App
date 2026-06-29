import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, unauthorized } from "@/lib/api-errors";
import { createTimeBlockSchema, listTimeBlocksQuerySchema } from "@/features/time-blocks/lib/schemas";
import { toTimeBlockDto } from "@/features/time-blocks/lib/serialize";

const taskSelect = { id: true, title: true, emoji: true, status: true } as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const parsed = listTimeBlocksQuerySchema.safeParse({
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  });
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query params", 400, parsed.error.flatten().fieldErrors);
  }

  const blocks = await prisma.timeBlock.findMany({
    where: {
      userId: session.user.id,
      startAt: { lt: new Date(parsed.data.to) },
      endAt: { gt: new Date(parsed.data.from) },
    },
    include: { task: { select: taskSelect } },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ items: blocks.map(toTimeBlockDto) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createTimeBlockSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid time block data", 400, parsed.error.flatten().fieldErrors);
  }

  const { taskId, startAt, endAt, ...rest } = parsed.data;

  if (taskId) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId: session.user.id, deletedAt: null } });
    if (!task) return apiError("TASK_NOT_FOUND", "Task not found", 400);
  }

  const block = await prisma.timeBlock.create({
    data: {
      ...rest,
      taskId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      userId: session.user.id,
    },
    include: { task: { select: taskSelect } },
  });

  return NextResponse.json({ timeBlock: toTimeBlockDto(block) }, { status: 201 });
}

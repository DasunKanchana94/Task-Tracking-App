import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, unauthorized } from "@/lib/api-errors";
import { toTaskDto } from "@/features/tasks/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!existing) return notFound("Task not found");

  const task = await prisma.task.update({
    where: { id },
    data: { status: "completed", completedAt: new Date() },
  });

  return NextResponse.json({ task: toTaskDto(task) });
}

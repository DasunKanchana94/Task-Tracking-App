import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { createRecurrenceExceptionSchema } from "@/features/recurrences/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const recurrence = await prisma.recurrence.findFirst({ where: { id, userId: session.user.id } });
  if (!recurrence) return notFound("Recurrence not found");

  const body = await request.json().catch(() => null);
  const parsed = createRecurrenceExceptionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid exception data", 400, parsed.error.flatten().fieldErrors);
  }

  const { date, action, modifiedTask } = parsed.data;
  const exceptionDate = new Date(`${date}T00:00:00.000Z`);

  const existingException = await prisma.recurrenceException.findUnique({
    where: { recurrenceId_exceptionDate: { recurrenceId: id, exceptionDate } },
  });
  if (existingException) {
    return apiError("CONFLICT", "An exception already exists for this date", 409);
  }

  // Remove any already-materialized task for this occurrence date so the
  // skip/modification takes effect even if the nightly job already ran.
  await prisma.task.deleteMany({
    where: { recurrenceId: id, recurrenceInstanceDate: exceptionDate, status: { notIn: ["completed", "cancelled"] } },
  });

  let createdTask = null;
  if (action === "modified" && modifiedTask) {
    const template = recurrence.taskTemplate as { title: string; priority?: number; estimatedMinutes?: number | null; emoji?: string | null };
    createdTask = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: modifiedTask.title ?? template.title,
        priority: modifiedTask.priority ?? template.priority ?? 0,
        estimatedMinutes: modifiedTask.estimatedMinutes ?? template.estimatedMinutes ?? null,
        emoji: modifiedTask.emoji ?? template.emoji ?? null,
        dueDate: exceptionDate,
        recurrenceId: id,
        recurrenceInstanceDate: exceptionDate,
      },
    });
  }

  const exception = await prisma.recurrenceException.create({
    data: {
      recurrenceId: id,
      exceptionDate,
      action,
      modifiedTaskId: createdTask?.id ?? null,
    },
  });

  return NextResponse.json(
    {
      exception: {
        id: exception.id,
        recurrenceId: exception.recurrenceId,
        exceptionDate: exception.exceptionDate.toISOString().slice(0, 10),
        action: exception.action,
        modifiedTaskId: exception.modifiedTaskId,
      },
    },
    { status: 201 },
  );
}

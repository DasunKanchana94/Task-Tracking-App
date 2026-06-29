import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { deleteRecurrenceSchema, updateRecurrenceSchema } from "@/features/recurrences/lib/schemas";
import { toRecurrenceDto } from "@/features/recurrences/lib/serialize";
import { MATERIALIZATION_WINDOW_DAYS, addUtcDays, materializeRecurrence, utcMidnight } from "@/features/recurrences/lib/materialize";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateRecurrenceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid recurrence data", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.recurrence.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Recurrence not found");

  const { rrule, endDate, endCount, scope } = parsed.data;
  const today = utcMidnight(new Date());

  await prisma.task.deleteMany({
    where: {
      recurrenceId: id,
      status: { notIn: ["completed", "cancelled"] },
      recurrenceInstanceDate: scope === "all" ? undefined : { gte: today },
    },
  });

  await prisma.recurrenceException.deleteMany({
    where: { recurrenceId: id, exceptionDate: scope === "all" ? undefined : { gte: today } },
  });

  const recurrence = await prisma.recurrence.update({
    where: { id },
    data: {
      ...(rrule !== undefined ? { rrule } : {}),
      ...(endDate !== undefined ? { endDate: endDate ? new Date(`${endDate}T00:00:00.000Z`) : null } : {}),
      ...(endCount !== undefined ? { endCount } : {}),
    },
  });

  const windowStart = recurrence.startDate.getTime() > today.getTime() ? recurrence.startDate : today;
  const windowEnd = addUtcDays(today, MATERIALIZATION_WINDOW_DAYS - 1);
  await materializeRecurrence(prisma, recurrence, windowStart, windowEnd);

  return NextResponse.json({ recurrence: toRecurrenceDto(recurrence) });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = deleteRecurrenceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.recurrence.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Recurrence not found");

  const today = utcMidnight(new Date());
  const { scope } = parsed.data;

  await prisma.task.deleteMany({
    where: {
      recurrenceId: id,
      status: { notIn: ["completed", "cancelled"] },
      recurrenceInstanceDate: scope === "all" ? undefined : { gte: today },
    },
  });

  if (scope === "all") {
    await prisma.recurrence.delete({ where: { id } });
  } else {
    const endDate = addUtcDays(today, -1);
    await prisma.recurrence.update({
      where: { id },
      data: { endDate: endDate.getTime() < existing.startDate.getTime() ? existing.startDate : endDate },
    });
  }

  return new NextResponse(null, { status: 204 });
}

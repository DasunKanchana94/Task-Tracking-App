import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { updateHabitSchema } from "@/features/habits/lib/schemas";
import { toHabitDto } from "@/features/habits/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
    include: { logs: true },
  });
  if (!habit) return notFound("Habit not found");

  return NextResponse.json({ habit: toHabitDto(habit) });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateHabitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid habit data", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Habit not found");

  const { archived, frequency, targetDaysPerWeek, ...rest } = parsed.data;
  const nextFrequency = frequency ?? existing.frequency;

  const habit = await prisma.habit.update({
    where: { id },
    data: {
      ...rest,
      ...(frequency ? { frequency } : {}),
      targetDaysPerWeek:
        nextFrequency === "weekly" ? targetDaysPerWeek ?? existing.targetDaysPerWeek ?? 1 : null,
      ...(archived !== undefined ? { archivedAt: archived ? new Date() : null } : {}),
    },
    include: { logs: true },
  });

  return NextResponse.json({ habit: toHabitDto(habit) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const existing = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Habit not found");

  await prisma.habit.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { createHabitLogSchema } from "@/features/habits/lib/schemas";
import { toHabitDto } from "@/features/habits/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const habit = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
  if (!habit) return notFound("Habit not found");

  const body = await request.json().catch(() => null);
  const parsed = createHabitLogSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid check-in data", 400, parsed.error.flatten().fieldErrors);
  }

  const { date, note } = parsed.data;

  await prisma.habitLog.upsert({
    where: { habitId_date: { habitId: id, date: new Date(date) } },
    create: { habitId: id, date: new Date(date), note: note ?? null },
    update: { note: note ?? null },
  });

  const updated = await prisma.habit.findFirstOrThrow({
    where: { id },
    include: { logs: true },
  });

  return NextResponse.json({ habit: toHabitDto(updated) }, { status: 201 });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const habit = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
  if (!habit) return notFound("Habit not found");

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!date) return apiError("VALIDATION_ERROR", "Missing date query parameter", 400);

  await prisma.habitLog.deleteMany({ where: { habitId: id, date: new Date(date) } });

  const updated = await prisma.habit.findFirstOrThrow({
    where: { id },
    include: { logs: true },
  });

  return NextResponse.json({ habit: toHabitDto(updated) });
}

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, unauthorized } from "@/lib/api-errors";
import { createHabitSchema } from "@/features/habits/lib/schemas";
import { toHabitDto } from "@/features/habits/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: { logs: true },
  });

  return NextResponse.json({ items: habits.map(toHabitDto) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createHabitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid habit data", 400, parsed.error.flatten().fieldErrors);
  }

  const { name, emoji, color, frequency, targetDaysPerWeek } = parsed.data;

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name,
      emoji: emoji ?? null,
      color: color ?? null,
      frequency,
      targetDaysPerWeek: frequency === "weekly" ? targetDaysPerWeek ?? 1 : null,
    },
    include: { logs: true },
  });

  return NextResponse.json({ habit: toHabitDto(habit) }, { status: 201 });
}

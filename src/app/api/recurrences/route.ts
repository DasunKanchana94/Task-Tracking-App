import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, unauthorized } from "@/lib/api-errors";
import { createRecurrenceSchema } from "@/features/recurrences/lib/schemas";
import { toRecurrenceDto } from "@/features/recurrences/lib/serialize";
import { MATERIALIZATION_WINDOW_DAYS, addUtcDays, materializeRecurrence, utcMidnight } from "@/features/recurrences/lib/materialize";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const recurrences = await prisma.recurrence.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: recurrences.map(toRecurrenceDto) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createRecurrenceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid recurrence data", 400, parsed.error.flatten().fieldErrors);
  }

  const { rrule, startDate, endDate, endCount, taskTemplate } = parsed.data;

  const recurrence = await prisma.recurrence.create({
    data: {
      userId: session.user.id,
      rrule,
      startDate: new Date(`${startDate}T00:00:00.000Z`),
      endDate: endDate ? new Date(`${endDate}T00:00:00.000Z`) : null,
      endCount: endCount ?? null,
      taskTemplate,
    },
  });

  const today = utcMidnight(new Date());
  const windowStart = recurrence.startDate.getTime() > today.getTime() ? recurrence.startDate : today;
  const windowEnd = addUtcDays(today, MATERIALIZATION_WINDOW_DAYS - 1);

  await materializeRecurrence(prisma, recurrence, windowStart, windowEnd);

  return NextResponse.json({ recurrence: toRecurrenceDto(recurrence) }, { status: 201 });
}

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { MATERIALIZATION_WINDOW_DAYS, addUtcDays, materializeRecurrence, utcMidnight } from "@/features/recurrences/lib/materialize";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } }, { status: 401 });
  }

  const today = utcMidnight(new Date());
  const windowEnd = addUtcDays(today, MATERIALIZATION_WINDOW_DAYS - 1);

  const recurrences = await prisma.recurrence.findMany({
    where: { OR: [{ endDate: null }, { endDate: { gte: today } }] },
  });

  let materializedCount = 0;
  for (const recurrence of recurrences) {
    const windowStart = recurrence.startDate.getTime() > today.getTime() ? recurrence.startDate : today;
    const created = await materializeRecurrence(prisma, recurrence, windowStart, windowEnd);
    materializedCount += created.length;
  }

  return NextResponse.json({ recurrencesProcessed: recurrences.length, tasksCreated: materializedCount });
}

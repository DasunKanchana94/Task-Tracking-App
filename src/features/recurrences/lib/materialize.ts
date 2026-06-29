import { rrulestr } from "rrule";
import type { PrismaClient, Recurrence } from "@prisma/client";

export const MATERIALIZATION_WINDOW_DAYS = 14;

type TaskTemplate = {
  title: string;
  priority?: number;
  estimatedMinutes?: number | null;
  emoji?: string | null;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function utcMidnight(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addUtcDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}

function getOccurrencesInRange(recurrence: Pick<Recurrence, "rrule" | "startDate" | "endDate" | "endCount">, from: Date, to: Date) {
  const rule = rrulestr(recurrence.rrule, { dtstart: utcMidnight(recurrence.startDate) });

  let rangeEnd = to;
  if (recurrence.endDate && recurrence.endDate.getTime() < rangeEnd.getTime()) {
    rangeEnd = recurrence.endDate;
  }
  if (rangeEnd.getTime() < from.getTime()) return [];

  if (recurrence.endCount) {
    const count = recurrence.endCount;
    const all = rule.all((_date, i) => i < count);
    return all.filter((date) => date.getTime() >= from.getTime() && date.getTime() <= rangeEnd.getTime());
  }

  return rule.between(from, rangeEnd, true);
}

/**
 * Generates Task rows for every recurrence occurrence in [from, to] that
 * doesn't already have a materialized task and isn't excluded by a
 * skip/modified exception. Idempotent — safe to call repeatedly (e.g. from a
 * nightly cron) since already-materialized dates are skipped.
 */
export async function materializeRecurrence(
  prisma: Pick<PrismaClient, "recurrenceException" | "task" | "$transaction">,
  recurrence: Recurrence,
  from: Date,
  to: Date,
) {
  const occurrences = getOccurrencesInRange(recurrence, from, to);
  if (occurrences.length === 0) return [];

  const [exceptions, existingTasks] = await Promise.all([
    prisma.recurrenceException.findMany({
      where: { recurrenceId: recurrence.id, exceptionDate: { gte: from, lte: to } },
    }),
    prisma.task.findMany({
      where: { recurrenceId: recurrence.id, recurrenceInstanceDate: { gte: from, lte: to } },
      select: { recurrenceInstanceDate: true },
    }),
  ]);

  const excludedDates = new Set(exceptions.map((exception) => dateKey(exception.exceptionDate)));
  const existingDates = new Set(
    existingTasks
      .filter((task) => task.recurrenceInstanceDate)
      .map((task) => dateKey(task.recurrenceInstanceDate as Date)),
  );

  const datesToCreate = occurrences.filter(
    (date) => !excludedDates.has(dateKey(date)) && !existingDates.has(dateKey(date)),
  );
  if (datesToCreate.length === 0) return [];

  const template = recurrence.taskTemplate as TaskTemplate;

  const creates = datesToCreate.map((date) =>
    prisma.task.create({
      data: {
        userId: recurrence.userId,
        title: template.title,
        priority: template.priority ?? 0,
        estimatedMinutes: template.estimatedMinutes ?? null,
        emoji: template.emoji ?? null,
        dueDate: date,
        recurrenceId: recurrence.id,
        recurrenceInstanceDate: date,
      },
    }),
  );

  return prisma.$transaction(creates);
}

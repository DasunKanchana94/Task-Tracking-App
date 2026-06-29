import type { PrismaClient } from "@prisma/client";

export type TemplateBlock = {
  title: string | null;
  taskTitle: string | null;
  startMinute: number;
  endMinute: number;
  color: string | null;
};

export function utcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export async function snapshotDayBlocks(
  prisma: PrismaClient,
  userId: string,
  date: Date,
): Promise<TemplateBlock[]> {
  const dayStart = utcMidnight(date);
  const dayEnd = addMinutes(dayStart, 24 * 60);

  const blocks = await prisma.timeBlock.findMany({
    where: { userId, startAt: { gte: dayStart, lt: dayEnd } },
    include: { task: { select: { title: true } } },
    orderBy: { startAt: "asc" },
  });

  return blocks.map((block) => ({
    title: block.title,
    taskTitle: block.task?.title ?? null,
    startMinute: Math.round((block.startAt.getTime() - dayStart.getTime()) / 60_000),
    endMinute: Math.round((block.endAt.getTime() - dayStart.getTime()) / 60_000),
    color: block.color,
  }));
}

function blockKey(startAt: Date, endAt: Date, title: string | null) {
  return `${startAt.getTime()}-${endAt.getTime()}-${title ?? ""}`;
}

/**
 * Creates time blocks (and, where the snapshot had a linked task, a fresh
 * task) for `targetDate` from a template. Skips any template block whose
 * start/end/title already match an existing block that day, so re-applying
 * a template (or applying it on a day that already has matching blocks)
 * never creates duplicates.
 */
export async function applyDayTemplate(
  prisma: PrismaClient,
  userId: string,
  blocks: TemplateBlock[],
  targetDate: Date,
): Promise<{ blocksCreated: number; tasksCreated: number; skipped: number }> {
  const dayStart = utcMidnight(targetDate);

  const existing = await prisma.timeBlock.findMany({
    where: { userId, startAt: { gte: dayStart, lt: addMinutes(dayStart, 24 * 60) } },
    select: { startAt: true, endAt: true, title: true },
  });
  const existingKeys = new Set(existing.map((b) => blockKey(b.startAt, b.endAt, b.title)));

  let blocksCreated = 0;
  let tasksCreated = 0;
  let skipped = 0;

  for (const templateBlock of blocks) {
    const startAt = addMinutes(dayStart, templateBlock.startMinute);
    const endAt = addMinutes(dayStart, templateBlock.endMinute);
    const key = blockKey(startAt, endAt, templateBlock.title);

    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    let taskId: string | null = null;
    if (templateBlock.taskTitle) {
      const task = await prisma.task.create({
        data: { userId, title: templateBlock.taskTitle, dueDate: dayStart },
      });
      taskId = task.id;
      tasksCreated += 1;
    }

    await prisma.timeBlock.create({
      data: {
        userId,
        taskId,
        title: templateBlock.title,
        startAt,
        endAt,
        color: templateBlock.color,
      },
    });
    blocksCreated += 1;
    existingKeys.add(key);
  }

  return { blocksCreated, tasksCreated, skipped };
}

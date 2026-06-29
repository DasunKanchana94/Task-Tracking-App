import type { Task, TimeBlock } from "@prisma/client";

export type TimeBlockWithRelations = TimeBlock & {
  task?: Pick<Task, "id" | "title" | "emoji" | "status"> | null;
};

export type TimeBlockDto = Omit<TimeBlock, "startAt" | "endAt" | "createdAt" | "updatedAt"> & {
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
  task: Pick<Task, "id" | "title" | "emoji" | "status"> | null;
};

export function toTimeBlockDto(block: TimeBlockWithRelations): TimeBlockDto {
  const { task, ...rest } = block;
  return {
    ...rest,
    startAt: rest.startAt.toISOString(),
    endAt: rest.endAt.toISOString(),
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
    task: task ?? null,
  };
}

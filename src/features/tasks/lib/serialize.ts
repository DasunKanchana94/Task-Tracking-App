import type { Tag, Task, TaskTag } from "@prisma/client";

import { toTagDto, type TagDto } from "@/features/tags/lib/serialize";

export type TaskWithRelations = Task & {
  tags?: (TaskTag & { tag: Tag })[];
  subtasks?: Task[];
};

export type TaskDto = Omit<
  Task,
  "descriptionRich" | "dueDate" | "createdAt" | "updatedAt" | "completedAt" | "deletedAt"
> & {
  description: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  tags: TagDto[];
  subtaskCount: { total: number; completed: number } | null;
};

export function toTaskDto(task: TaskWithRelations): TaskDto {
  const { descriptionRich, dueDate, tags, subtasks, ...rest } = task;
  const description =
    descriptionRich && typeof descriptionRich === "object" && "plainText" in descriptionRich
      ? (descriptionRich as { plainText: string }).plainText
      : null;

  return {
    ...rest,
    description,
    dueDate: dueDate ? dueDate.toISOString().slice(0, 10) : null,
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
    completedAt: rest.completedAt ? rest.completedAt.toISOString() : null,
    deletedAt: rest.deletedAt ? rest.deletedAt.toISOString() : null,
    tags: tags ? tags.map((taskTag) => toTagDto(taskTag.tag)) : [],
    subtaskCount: subtasks
      ? { total: subtasks.length, completed: subtasks.filter((s) => s.status === "completed").length }
      : null,
  };
}

export function toDescriptionRich(description: string | null | undefined) {
  if (description === undefined) return undefined;
  if (description === null) return null;
  return { plainText: description };
}

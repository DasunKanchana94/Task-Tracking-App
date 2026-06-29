import { z } from "zod";

export const taskStatusValues = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  description: z.string().max(20000).optional(),
  priority: z.number().int().min(0).max(4).default(0),
  dueDate: z.string().date().nullish(),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format")
    .nullish(),
  estimatedMinutes: z.number().int().positive().nullish(),
  emoji: z.string().max(8).nullish(),
  parentTaskId: z.string().uuid().nullish(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(20000).nullish(),
  status: z.enum(taskStatusValues).optional(),
  priority: z.number().int().min(0).max(4).optional(),
  dueDate: z.string().date().nullish(),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format")
    .nullish(),
  estimatedMinutes: z.number().int().positive().nullish(),
  actualMinutes: z.number().int().min(0).optional(),
  emoji: z.string().max(8).nullish(),
  starred: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  updatedAt: z.string().datetime(),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(taskStatusValues).optional(),
  parentTaskId: z.string().uuid().optional(),
  starred: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).optional(),
  includeSubtasks: z.coerce.boolean().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

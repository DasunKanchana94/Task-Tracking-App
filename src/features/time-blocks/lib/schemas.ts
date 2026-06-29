import { z } from "zod";

export const createTimeBlockSchema = z
  .object({
    taskId: z.string().uuid().nullish(),
    title: z.string().trim().max(500).nullish(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    allDay: z.boolean().default(false),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #22c55e")
      .nullish(),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

export const updateTimeBlockSchema = z
  .object({
    taskId: z.string().uuid().nullish(),
    title: z.string().trim().max(500).nullish(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    allDay: z.boolean().optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #22c55e")
      .nullish(),
    updatedAt: z.string().datetime(),
  })
  .refine(
    (data) =>
      !(data.startAt && data.endAt) || new Date(data.endAt) > new Date(data.startAt),
    { message: "endAt must be after startAt", path: ["endAt"] },
  );

export const listTimeBlocksQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export type CreateTimeBlockInput = z.infer<typeof createTimeBlockSchema>;
export type UpdateTimeBlockInput = z.infer<typeof updateTimeBlockSchema>;
export type ListTimeBlocksQuery = z.infer<typeof listTimeBlocksQuerySchema>;

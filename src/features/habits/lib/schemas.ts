import { z } from "zod";

export const habitFrequencyValues = ["daily", "weekdays", "weekly"] as const;

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  emoji: z.string().max(8).nullish(),
  color: z.string().max(32).nullish(),
  frequency: z.enum(habitFrequencyValues).default("daily"),
  targetDaysPerWeek: z.number().int().min(1).max(7).nullish(),
});

export const updateHabitSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  emoji: z.string().max(8).nullish(),
  color: z.string().max(32).nullish(),
  frequency: z.enum(habitFrequencyValues).optional(),
  targetDaysPerWeek: z.number().int().min(1).max(7).nullish(),
  archived: z.boolean().optional(),
});

export const createHabitLogSchema = z.object({
  date: z.string().date(),
  note: z.string().max(2000).nullish(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CreateHabitLogInput = z.infer<typeof createHabitLogSchema>;

import { z } from "zod";
import { rrulestr } from "rrule";

const taskTemplateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  priority: z.number().int().min(0).max(4).default(0),
  estimatedMinutes: z.number().int().positive().nullish(),
  emoji: z.string().max(8).nullish(),
});

function isValidRrule(value: string) {
  try {
    rrulestr(value, { dtstart: new Date() });
    return true;
  } catch {
    return false;
  }
}

export const createRecurrenceSchema = z
  .object({
    rrule: z.string().trim().min(1).refine(isValidRrule, "Invalid RRULE string"),
    startDate: z.string().date(),
    endDate: z.string().date().nullish(),
    endCount: z.number().int().positive().nullish(),
    taskTemplate: taskTemplateSchema,
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const recurrenceScopeValues = ["future", "all"] as const;

export const updateRecurrenceSchema = z.object({
  rrule: z.string().trim().min(1).refine(isValidRrule, "Invalid RRULE string").optional(),
  endDate: z.string().date().nullish(),
  endCount: z.number().int().positive().nullish(),
  scope: z.enum(recurrenceScopeValues),
});

export const deleteRecurrenceSchema = z.object({
  scope: z.enum(recurrenceScopeValues),
});

export const recurrenceExceptionActionValues = ["skip", "modified"] as const;

export const createRecurrenceExceptionSchema = z
  .object({
    date: z.string().date(),
    action: z.enum(recurrenceExceptionActionValues),
    modifiedTask: taskTemplateSchema.partial().optional(),
  })
  .refine((data) => data.action !== "modified" || data.modifiedTask, {
    message: "modifiedTask is required when action is 'modified'",
    path: ["modifiedTask"],
  });

export type CreateRecurrenceInput = z.infer<typeof createRecurrenceSchema>;
export type UpdateRecurrenceInput = z.infer<typeof updateRecurrenceSchema>;
export type DeleteRecurrenceInput = z.infer<typeof deleteRecurrenceSchema>;
export type CreateRecurrenceExceptionInput = z.infer<typeof createRecurrenceExceptionSchema>;
